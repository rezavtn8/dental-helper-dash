-- Fix RLS policies for system tables to allow proper service access

-- Drop existing overly restrictive policies
DROP POLICY IF EXISTS "Password reset - service access only" ON public.password_reset_attempts;
DROP POLICY IF EXISTS "Rate limits - service access only" ON public.rate_limits;  
DROP POLICY IF EXISTS "Sessions - system access only" ON public.user_sessions;

-- Create proper service-level access policies for password_reset_attempts
CREATE POLICY "Service role can manage password reset attempts"
ON public.password_reset_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow security definer functions to access password reset attempts
CREATE POLICY "Security definer functions can access password reset attempts"
ON public.password_reset_attempts
FOR ALL
USING (current_setting('role') = 'service_role' OR current_user = 'supabase_admin');

-- Create proper service-level access policies for rate_limits
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow security definer functions to access rate limits
CREATE POLICY "Security definer functions can access rate limits"
ON public.rate_limits
FOR ALL
USING (current_setting('role') = 'service_role' OR current_user = 'supabase_admin');

-- Create proper service-level access policies for user_sessions
CREATE POLICY "Service role can manage user sessions"
ON public.user_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow security definer functions to access user sessions
CREATE POLICY "Security definer functions can access user sessions"  
ON public.user_sessions
FOR ALL
USING (current_setting('role') = 'service_role' OR current_user = 'supabase_admin');

-- Allow users to view their own sessions (for security purposes)
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (user_id = auth.uid());

-- Create enhanced security definer function to check session validity
CREATE OR REPLACE FUNCTION public.validate_user_session(p_session_token text)
RETURNS TABLE(user_id uuid, clinic_id uuid, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_record user_sessions%ROWTYPE;
BEGIN
  -- Find active session
  SELECT * INTO session_record
  FROM public.user_sessions
  WHERE session_token = p_session_token
    AND is_active = true
    AND expires_at > now();
  
  IF session_record.id IS NOT NULL THEN
    -- Update last accessed time
    UPDATE public.user_sessions
    SET last_accessed = now()
    WHERE id = session_record.id;
    
    RETURN QUERY SELECT session_record.user_id, session_record.clinic_id, true;
  ELSE
    RETURN QUERY SELECT NULL::uuid, NULL::uuid, false;
  END IF;
END;
$function$;