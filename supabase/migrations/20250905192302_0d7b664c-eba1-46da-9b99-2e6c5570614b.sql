-- Security Fix Migration: Update System Table Policies and Fix Access Issues

-- Fix 1: Update rate_limits table RLS policies to allow proper service access
DROP POLICY IF EXISTS "Rate limits - service access only" ON public.rate_limits;

CREATE POLICY "Service can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Add policy for users to check their own rate limits
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
USING (user_id = auth.uid());

-- Fix 2: Update user_sessions table RLS policies to allow service access
DROP POLICY IF EXISTS "Sessions - system access only" ON public.user_sessions;

CREATE POLICY "Service can manage user sessions"
ON public.user_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Add policy for users to view their own active sessions
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (user_id = auth.uid());

-- Fix 3: Update password_reset_attempts table RLS policies
DROP POLICY IF EXISTS "Password reset - service access only" ON public.password_reset_attempts;

CREATE POLICY "Service can manage password reset attempts"
ON public.password_reset_attempts
FOR ALL
USING (true)
WITH CHECK (true);

-- Fix 4: Add missing policy for conversation_memory deletion to prevent orphaned records
CREATE POLICY "Users can delete their own conversation entries"
ON public.conversation_memory
FOR DELETE
USING (auth.uid() = user_id);

-- Fix 5: Create enhanced security function to check if user has proper clinic access
CREATE OR REPLACE FUNCTION public.has_clinic_access(target_clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
      AND clinic_id = target_clinic_id 
      AND is_active = true
  );
$$;

-- Fix 6: Create function to safely log security events with proper validation
CREATE OR REPLACE FUNCTION public.enhanced_security_log(
  event_type text,
  event_details jsonb DEFAULT '{}'::jsonb,
  severity text DEFAULT 'info'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate inputs
  IF event_type IS NULL OR length(trim(event_type)) = 0 THEN
    RETURN;
  END IF;
  
  IF severity NOT IN ('info', 'warn', 'error') THEN
    severity := 'info';
  END IF;
  
  -- Log the security event (this would typically go to a security_events table)
  -- For now, we'll use the existing audit_log table
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    old_values,
    new_values,
    timestamp
  ) VALUES (
    'security_events',
    event_type,
    auth.uid(),
    '{}',
    jsonb_build_object(
      'event_type', event_type,
      'details', event_details,
      'severity', severity,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    now()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if logging fails
    NULL;
END;
$$;

-- Fix 7: Add index for better performance on security-critical queries
CREATE INDEX IF NOT EXISTS idx_users_clinic_active ON public.users(clinic_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_operation ON public.rate_limits(user_id, operation, window_start);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, is_active) WHERE is_active = true;

-- Fix 8: Create secure clinic lookup function to replace unsafe lookups
CREATE OR REPLACE FUNCTION public.lookup_clinic_by_code_secure(p_code text)
RETURNS TABLE(id uuid, name text, clinic_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sanitized_code text;
BEGIN
  -- Rate limiting check
  IF NOT check_rate_limit('secure_clinic_lookup', 3, 60) THEN
    RAISE EXCEPTION 'Too many lookup attempts. Please wait before trying again.';
  END IF;
  
  -- Input validation and sanitization
  IF p_code IS NULL OR length(trim(p_code)) < 3 THEN
    RETURN; -- Return empty result
  END IF;
  
  sanitized_code := upper(trim(regexp_replace(p_code, '[^A-Z0-9]', '', 'g')));
  
  -- Log the lookup attempt
  PERFORM enhanced_security_log('secure_clinic_lookup', 
    jsonb_build_object('clinic_code', sanitized_code), 
    'info');
  
  -- Return clinic info only if found and active
  RETURN QUERY 
  SELECT c.id, c.name, c.clinic_code 
  FROM public.clinics c 
  WHERE c.clinic_code = sanitized_code 
    AND c.is_active = true
  LIMIT 1;
END;
$$;

-- Fix 9: Update existing functions to use the enhanced security logging
CREATE OR REPLACE FUNCTION public.authenticated_clinic_lookup(clinic_code text)
RETURNS TABLE(id uuid, name text, clinic_code text, can_join boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_clinic_id uuid;
  clinic_record RECORD;
BEGIN
  -- Get user's current clinic
  SELECT clinic_id INTO user_clinic_id 
  FROM public.users 
  WHERE id = auth.uid();
  
  -- Use the secure lookup function
  SELECT * INTO clinic_record 
  FROM lookup_clinic_by_code_secure(clinic_code);
  
  IF clinic_record.id IS NOT NULL THEN
    RETURN QUERY SELECT 
      clinic_record.id,
      clinic_record.name,
      clinic_record.clinic_code,
      (user_clinic_id IS NULL OR user_clinic_id != clinic_record.id) as can_join;
  END IF;
END;
$$;

-- Fix 10: Add constraint to prevent null user_message in conversation_memory
ALTER TABLE public.conversation_memory 
ALTER COLUMN user_message SET NOT NULL;

ALTER TABLE public.conversation_memory 
ALTER COLUMN ai_response SET NOT NULL;

-- Add check constraint for minimum message length
ALTER TABLE public.conversation_memory 
ADD CONSTRAINT check_user_message_length 
CHECK (length(trim(user_message)) >= 1);

ALTER TABLE public.conversation_memory 
ADD CONSTRAINT check_ai_response_length 
CHECK (length(trim(ai_response)) >= 1);

-- Fix 11: Create emergency access revocation function for security incidents
CREATE OR REPLACE FUNCTION public.revoke_user_access(target_user_id uuid, reason text DEFAULT 'Security incident')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only owners can revoke access
  IF get_current_user_role() != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: Only clinic owners can revoke user access';
  END IF;
  
  -- Deactivate user
  UPDATE public.users 
  SET is_active = false 
  WHERE id = target_user_id 
    AND clinic_id = get_current_user_clinic_id();
  
  -- Deactivate all user sessions
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE user_id = target_user_id;
  
  -- Log the action
  PERFORM enhanced_security_log('user_access_revoked', 
    jsonb_build_object(
      'target_user_id', target_user_id,
      'reason', reason,
      'revoked_by', auth.uid()
    ), 
    'warn');
END;
$$;