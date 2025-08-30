-- Optimize invitations table for unified invitation system
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_email_status ON public.invitations(email, status);
CREATE INDEX IF NOT EXISTS idx_invitations_token_lookup ON public.invitations(token) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invitations_clinic_status ON public.invitations(clinic_id, status);

-- Add invitation_type enum for different invitation flows (check if exists first)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_type') THEN
        CREATE TYPE public.invitation_type AS ENUM ('email_signup', 'magic_link');
    END IF;
END $$;

-- Add new columns for unified invitation system
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS invitation_type public.invitation_type DEFAULT 'email_signup',
ADD COLUMN IF NOT EXISTS last_email_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS click_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_agent text;

-- Update existing invitations to use email_signup type
UPDATE public.invitations 
SET invitation_type = 'email_signup' 
WHERE invitation_type IS NULL;

-- Create unified invitation creation function
CREATE OR REPLACE FUNCTION public.create_unified_invitation(
  p_clinic_id uuid,
  p_email text,
  p_name text,
  p_role text DEFAULT 'assistant',
  p_invitation_type public.invitation_type DEFAULT 'email_signup'
)
RETURNS TABLE(invitation_id uuid, invitation_token text, invitation_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_invitation_id UUID;
  new_token TEXT;
  new_url TEXT;
  existing_user RECORD;
BEGIN
  -- Rate limiting check
  IF NOT check_rate_limit('create_invitation', 10, 60) THEN
    RAISE EXCEPTION 'Too many invitation attempts. Please wait before creating more invitations.';
  END IF;
  
  -- Only owners and admins can create invitations
  IF get_current_user_role() NOT IN ('owner', 'admin') OR get_current_user_clinic_id() != p_clinic_id THEN
    RAISE EXCEPTION 'Unauthorized to create invitations for this clinic';
  END IF;
  
  -- Validate inputs
  IF NOT validate_email(p_email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RAISE EXCEPTION 'Valid name is required (minimum 2 characters)';
  END IF;
  
  IF p_role NOT IN ('assistant', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be assistant or admin';
  END IF;
  
  -- Check if user already exists
  SELECT * INTO existing_user FROM public.users WHERE email = lower(trim(p_email));
  
  IF existing_user.id IS NOT NULL THEN
    IF existing_user.clinic_id = p_clinic_id THEN
      RAISE EXCEPTION 'This person is already a member of your team. You can find them in the Team section.';
    ELSE
      RAISE EXCEPTION 'This email is already registered with another clinic. Please use a different email address.';
    END IF;
  END IF;
  
  -- Check for existing pending invitation
  IF EXISTS(
    SELECT 1 FROM public.invitations 
    WHERE email = lower(trim(p_email))
      AND clinic_id = p_clinic_id 
      AND status = 'pending' 
      AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'A pending invitation already exists for this email. Use the Team section to resend or cancel it.';
  END IF;
  
  -- Create the invitation with sanitized inputs
  INSERT INTO public.invitations (
    clinic_id, 
    email, 
    role, 
    invited_by, 
    invitation_type,
    expires_at
  )
  VALUES (
    p_clinic_id, 
    lower(trim(p_email)), 
    p_role, 
    auth.uid(),
    p_invitation_type,
    now() + interval '7 days'
  )
  RETURNING id, token INTO new_invitation_id, new_token;
  
  -- Generate the appropriate URL based on invitation type
  new_url := format('/join?token=%s', new_token);
  
  RETURN QUERY SELECT new_invitation_id, new_token, new_url;
END;
$$;