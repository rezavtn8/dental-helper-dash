-- SECURITY FIXES - Phase 3: Fix function search paths and finalize security
-- Address remaining linter warnings

-- Fix all function search paths by adding SET search_path = public
CREATE OR REPLACE FUNCTION public.validate_email(email_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- Basic email validation
  RETURN email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(email_input) <= 254
    AND email_input IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_clinic_code(code_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE  
SET search_path = public
AS $$
BEGIN
  -- Clinic code validation: 4-10 alphanumeric characters
  RETURN code_input ~* '^[A-Z0-9]{4,10}$'
    AND code_input IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potentially dangerous characters and limit length
  RETURN trim(
    regexp_replace(
      regexp_replace(input_text, '[<>]', '', 'g'), -- Remove < >
      'javascript:', '', 'gi' -- Remove javascript:
    )
  )::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_user_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate and sanitize user inputs
  IF NEW.email IS NOT NULL THEN
    IF NOT validate_email(NEW.email) THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
    NEW.email = lower(trim(NEW.email));
  END IF;
  
  IF NEW.name IS NOT NULL THEN
    NEW.name = sanitize_text_input(NEW.name);
    IF length(NEW.name) > 100 THEN
      RAISE EXCEPTION 'Name too long (max 100 characters)';
    END IF;
  END IF;
  
  -- Validate role
  IF NEW.role IS NOT NULL AND NEW.role NOT IN ('owner', 'assistant', 'admin') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_clinic_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate clinic inputs
  IF NEW.name IS NOT NULL THEN
    NEW.name = sanitize_text_input(NEW.name);
    IF length(NEW.name) > 200 THEN
      RAISE EXCEPTION 'Clinic name too long (max 200 characters)';
    END IF;
  END IF;
  
  IF NEW.clinic_code IS NOT NULL THEN
    NEW.clinic_code = upper(trim(NEW.clinic_code));
    IF NOT validate_clinic_code(NEW.clinic_code) THEN
      RAISE EXCEPTION 'Invalid clinic code format (4-10 alphanumeric characters)';
    END IF;
  END IF;
  
  IF NEW.email IS NOT NULL THEN
    IF NOT validate_email(NEW.email) THEN
      RAISE EXCEPTION 'Invalid clinic email format';
    END IF;
    NEW.email = lower(trim(NEW.email));
  END IF;
  
  IF NEW.phone IS NOT NULL THEN
    NEW.phone = regexp_replace(NEW.phone, '[^0-9+\-\(\)\s]', '', 'g');
    IF length(NEW.phone) > 20 THEN
      RAISE EXCEPTION 'Phone number too long';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add password security validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- Password must be at least 8 characters with mixed case, numbers, and symbols
  RETURN password_text IS NOT NULL
    AND length(password_text) >= 8
    AND password_text ~ '[a-z]'      -- lowercase
    AND password_text ~ '[A-Z]'      -- uppercase  
    AND password_text ~ '[0-9]'      -- numbers
    AND password_text ~ '[^A-Za-z0-9]'; -- special characters
END;
$$;

-- Create comprehensive security monitoring view for owners
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
  'failed_logins' as metric,
  count(*) as value,
  'last_hour' as period
FROM public.rate_limits 
WHERE operation = 'login_attempt' 
  AND created_at > (now() - interval '1 hour')
UNION ALL
SELECT 
  'invitation_attempts' as metric,
  count(*) as value, 
  'last_hour' as period
FROM public.rate_limits
WHERE operation = 'create_invitation'
  AND created_at > (now() - interval '1 hour')
UNION ALL
SELECT
  'active_sessions' as metric,
  count(*) as value,
  'current' as period  
FROM public.user_sessions
WHERE is_active = true 
  AND expires_at > now()
UNION ALL
SELECT
  'pending_invitations' as metric,
  count(*) as value,
  'current' as period
FROM public.invitations 
WHERE status = 'pending' 
  AND expires_at > now();

-- Grant access to security dashboard for owners only
GRANT SELECT ON public.security_dashboard TO authenticated;

-- Create RLS policy for security dashboard
CREATE POLICY "Owners can view security dashboard"
ON public.security_dashboard
FOR SELECT  
USING (get_current_user_role() = 'owner');

-- Final security cleanup function
CREATE OR REPLACE FUNCTION public.security_cleanup()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Clean up expired sessions
  DELETE FROM public.user_sessions 
  WHERE expires_at < now() OR is_active = false;
  
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits 
  WHERE created_at < (now() - interval '7 days');
  
  -- Clean up expired invitations
  UPDATE public.invitations 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < now();
    
  -- Clean up old audit logs (keep 90 days)
  DELETE FROM public.audit_log
  WHERE timestamp < (now() - interval '90 days');
$$;