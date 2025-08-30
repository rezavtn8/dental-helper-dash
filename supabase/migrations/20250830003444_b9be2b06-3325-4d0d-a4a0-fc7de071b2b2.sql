-- Phase 1: Complete Database Reset and Cleanup

-- Clear all existing data from all tables
TRUNCATE TABLE public.task_notes CASCADE;
TRUNCATE TABLE public.tasks CASCADE;
TRUNCATE TABLE public.patient_logs CASCADE;
TRUNCATE TABLE public.task_templates CASCADE;
TRUNCATE TABLE public.invitations CASCADE;
TRUNCATE TABLE public.users CASCADE;
TRUNCATE TABLE public.clinics CASCADE;
TRUNCATE TABLE public.user_sessions CASCADE;
TRUNCATE TABLE public.audit_log CASCADE;
TRUNCATE TABLE public.rate_limits CASCADE;

-- Clear auth users (this will cascade to clear all auth-related data)
-- Note: This requires service role permissions
DELETE FROM auth.users;

-- Create a simple function to get current time (utility)
CREATE OR REPLACE FUNCTION public.get_current_timestamp()
RETURNS timestamp with time zone
LANGUAGE sql
STABLE
AS $$
  SELECT now();
$$;

-- Create a simple function to generate clinic codes
CREATE OR REPLACE FUNCTION public.generate_clinic_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    code := upper(substr(md5(random()::text), 1, 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.clinics WHERE clinic_code = code) INTO exists_check;
    
    -- If code doesn't exist, return it
    IF NOT exists_check THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Create a simple function to create invitations
CREATE OR REPLACE FUNCTION public.create_simple_invitation(
  p_email text,
  p_name text,
  p_clinic_id uuid DEFAULT NULL
)
RETURNS TABLE(invitation_id uuid, token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_clinic_id uuid;
  new_invitation_id uuid;
  new_token text;
BEGIN
  -- Get clinic_id from current user if not provided
  IF p_clinic_id IS NULL THEN
    SELECT clinic_id INTO v_clinic_id FROM public.users WHERE id = auth.uid();
  ELSE
    v_clinic_id := p_clinic_id;
  END IF;
  
  -- Validate inputs
  IF NOT validate_email(p_email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Check if user already exists
  IF EXISTS(SELECT 1 FROM public.users WHERE email = lower(trim(p_email))) THEN
    RAISE EXCEPTION 'User already exists with this email';
  END IF;
  
  -- Create invitation
  INSERT INTO public.invitations (
    clinic_id,
    email,
    role,
    invited_by,
    expires_at
  )
  VALUES (
    v_clinic_id,
    lower(trim(p_email)),
    'assistant',
    auth.uid(),
    now() + interval '7 days'
  )
  RETURNING id, token INTO new_invitation_id, new_token;
  
  RETURN QUERY SELECT new_invitation_id, new_token;
END;
$$;

-- Create a simple function to accept invitations
CREATE OR REPLACE FUNCTION public.accept_simple_invitation(
  p_token text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE(success boolean, message text, clinic_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record public.invitations%ROWTYPE;
  user_email text;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
  
  IF user_email IS NULL THEN
    RETURN QUERY SELECT false, 'User not found'::text, NULL::uuid;
    RETURN;
  END IF;
  
  -- Find valid invitation
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE token = p_token
    AND email = user_email
    AND status = 'pending'
    AND expires_at > now();
  
  IF invitation_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid or expired invitation'::text, NULL::uuid;
    RETURN;
  END IF;
  
  -- Update user's clinic
  INSERT INTO public.users (id, name, email, role, clinic_id, is_active)
  VALUES (
    p_user_id,
    'Assistant User',
    user_email,
    invitation_record.role,
    invitation_record.clinic_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    clinic_id = invitation_record.clinic_id,
    role = invitation_record.role,
    updated_at = now();
  
  -- Mark invitation as accepted
  UPDATE public.invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    accepted_by = p_user_id
  WHERE id = invitation_record.id;
  
  RETURN QUERY SELECT true, 'Successfully joined clinic'::text, invitation_record.clinic_id;
END;
$$;