-- SECURITY FIXES - Phase 3 (Fixed): Complete security hardening without view RLS
-- Fix the failed migration by removing RLS on view

-- Create comprehensive security monitoring function instead of view
CREATE OR REPLACE FUNCTION public.get_security_metrics()
RETURNS TABLE(
  metric text,
  value bigint,
  period text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only owners can access security metrics
  SELECT 
    'failed_logins'::text as metric,
    count(*) as value,
    'last_hour'::text as period
  FROM public.rate_limits 
  WHERE operation = 'login_attempt' 
    AND created_at > (now() - interval '1 hour')
    AND get_current_user_role() = 'owner'
  UNION ALL
  SELECT 
    'invitation_attempts'::text as metric,
    count(*) as value, 
    'last_hour'::text as period
  FROM public.rate_limits
  WHERE operation = 'create_invitation'
    AND created_at > (now() - interval '1 hour')
    AND get_current_user_role() = 'owner'
  UNION ALL
  SELECT
    'active_sessions'::text as metric,
    count(*) as value,
    'current'::text as period  
  FROM public.user_sessions s
  JOIN public.users u ON s.user_id = u.id
  WHERE s.is_active = true 
    AND s.expires_at > now()
    AND u.clinic_id = get_current_user_clinic_id()
    AND get_current_user_role() = 'owner'
  UNION ALL
  SELECT
    'pending_invitations'::text as metric,
    count(*) as value,
    'current'::text as period
  FROM public.invitations 
  WHERE status = 'pending' 
    AND expires_at > now()
    AND clinic_id = get_current_user_clinic_id()
    AND get_current_user_role() = 'owner';
$$;

-- Drop the problematic view
DROP VIEW IF EXISTS public.security_dashboard;

-- Create final input sanitization for frontend
CREATE OR REPLACE FUNCTION public.sanitize_and_validate_input(
  input_type text,
  input_value text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF input_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  CASE input_type
    WHEN 'email' THEN
      IF NOT validate_email(input_value) THEN
        RAISE EXCEPTION 'Invalid email format';
      END IF;
      RETURN lower(trim(input_value));
    
    WHEN 'clinic_code' THEN
      IF NOT validate_clinic_code(input_value) THEN
        RAISE EXCEPTION 'Invalid clinic code format';
      END IF;
      RETURN upper(trim(input_value));
    
    WHEN 'name' THEN
      RETURN sanitize_text_input(input_value);
    
    WHEN 'phone' THEN
      RETURN regexp_replace(trim(input_value), '[^0-9+\-\(\)\s]', '', 'g');
    
    ELSE
      RETURN sanitize_text_input(input_value);
  END CASE;
END;
$$;

-- Add comprehensive logging for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_details jsonb DEFAULT '{}'::jsonb,
  severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    new_values,
    timestamp
  ) VALUES (
    'security_events',
    event_type,
    auth.uid(),
    jsonb_build_object(
      'severity', severity,
      'details', event_details,
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    now()
  );
END;
$$;