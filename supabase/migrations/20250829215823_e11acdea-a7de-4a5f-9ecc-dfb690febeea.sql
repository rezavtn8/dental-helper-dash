-- SECURITY FIXES - Phase 2: Fix remaining security issues and enhance validation
-- Address linter warnings and add input validation

-- 1. Fix Security Definer View issue - Replace view with safer RLS policies
DROP VIEW IF EXISTS public.safe_user_profiles;

-- Instead, create a function that returns safe user data
CREATE OR REPLACE FUNCTION public.get_safe_user_profile(user_id_param uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  name text, 
  email text,
  role text,
  clinic_id uuid,
  is_active boolean,
  created_at timestamp with time zone,
  last_login timestamp with time zone
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.clinic_id,
    u.is_active,
    u.created_at,
    u.last_login
  FROM public.users u
  WHERE u.id = user_id_param
    AND (
      u.id = auth.uid() -- Users can see their own profile
      OR u.clinic_id = get_current_user_clinic_id() -- Or clinic members
    );
$$;

-- 2. Add input validation functions for security
CREATE OR REPLACE FUNCTION public.validate_email(email_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
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

-- 3. Add validation triggers for input sanitization
CREATE OR REPLACE FUNCTION public.validate_user_input()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Add validation triggers
DROP TRIGGER IF EXISTS validate_user_input_trigger ON public.users;
CREATE TRIGGER validate_user_input_trigger
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_input();

DROP TRIGGER IF EXISTS validate_clinic_input_trigger ON public.clinics;  
CREATE TRIGGER validate_clinic_input_trigger
  BEFORE INSERT OR UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_clinic_input();

-- 4. Add rate limiting for sensitive operations
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  operation text NOT NULL,
  ip_address inet,
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
USING (user_id = auth.uid());

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation_name text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  window_start_time timestamp with time zone;
BEGIN
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits 
  WHERE created_at < (now() - interval '24 hours');
  
  -- Get current attempts in window
  SELECT attempts, window_start INTO current_attempts, window_start_time
  FROM public.rate_limits
  WHERE user_id = auth.uid()
    AND operation = operation_name
    AND window_start > (now() - (window_minutes || ' minutes')::interval)
  ORDER BY window_start DESC
  LIMIT 1;
  
  -- If no record or window expired, create new record
  IF current_attempts IS NULL OR window_start_time < (now() - (window_minutes || ' minutes')::interval) THEN
    INSERT INTO public.rate_limits (user_id, operation, attempts)
    VALUES (auth.uid(), operation_name, 1);
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF current_attempts >= max_attempts THEN
    RETURN false;
  END IF;
  
  -- Increment attempts
  UPDATE public.rate_limits
  SET attempts = attempts + 1
  WHERE user_id = auth.uid()
    AND operation = operation_name
    AND window_start = window_start_time;
  
  RETURN true;
END;
$$;

-- 5. Enhanced invitation security with rate limiting
CREATE OR REPLACE FUNCTION public.create_assistant_invitation_secure(
  p_clinic_id uuid, 
  p_email text, 
  p_name text
)
RETURNS TABLE(invitation_id uuid, invitation_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_invitation_id UUID;
  new_token TEXT;
  existing_user RECORD;
BEGIN
  -- Rate limiting check
  IF NOT check_rate_limit('create_invitation', 10, 60) THEN
    RAISE EXCEPTION 'Too many invitation attempts. Please wait before creating more invitations.';
  END IF;
  
  -- Only owners can create invitations
  IF get_current_user_role() != 'owner' OR get_current_user_clinic_id() != p_clinic_id THEN
    RAISE EXCEPTION 'Unauthorized to create invitations for this clinic';
  END IF;
  
  -- Validate inputs
  IF NOT validate_email(p_email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RAISE EXCEPTION 'Valid name is required';
  END IF;
  
  -- Check if user already exists and get their details
  SELECT * INTO existing_user FROM public.users WHERE email = lower(trim(p_email));
  
  IF existing_user.id IS NOT NULL THEN
    -- User exists, check their current clinic status
    IF existing_user.clinic_id = p_clinic_id THEN
      RAISE EXCEPTION 'This person is already a member of your clinic. You can find them in the Team section.';
    ELSE
      RAISE EXCEPTION 'This person already has an account with another clinic. To transfer them to your clinic, please contact support or ask them to create a new account with a different email address.';
    END IF;
  END IF;
  
  -- Check if there's already a pending invitation
  IF EXISTS(
    SELECT 1 FROM public.invitations 
    WHERE email = lower(trim(p_email))
      AND clinic_id = p_clinic_id 
      AND status = 'pending' 
      AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'A pending invitation already exists for this email address. Check the Team section to resend or cancel the existing invitation.';
  END IF;
  
  -- Create the invitation with sanitized inputs
  INSERT INTO public.invitations (clinic_id, email, role, invited_by)
  VALUES (p_clinic_id, lower(trim(p_email)), 'assistant', auth.uid())
  RETURNING id, token INTO new_invitation_id, new_token;
  
  RETURN QUERY SELECT new_invitation_id, new_token;
END;
$$;