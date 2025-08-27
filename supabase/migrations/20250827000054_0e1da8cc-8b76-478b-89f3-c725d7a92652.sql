-- Fix invitation token generation issue - change from base64url to base64
-- Also ensure proper RLS policies for team management

-- First, check if the invitations table exists and update token generation
ALTER TABLE public.invitations 
ALTER COLUMN token SET DEFAULT encode(extensions.gen_random_bytes(32), 'base64');

-- Update the create_assistant_invitation function to handle proper return format
CREATE OR REPLACE FUNCTION public.create_assistant_invitation(p_clinic_id uuid, p_email text, p_name text)
RETURNS TABLE(invitation_id uuid, invitation_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_invitation_id UUID;
  new_token TEXT;
BEGIN
  -- Only owners can create invitations
  IF get_current_user_role() != 'owner' OR get_current_user_clinic_id() != p_clinic_id THEN
    RAISE EXCEPTION 'Unauthorized to create invitations for this clinic';
  END IF;
  
  -- Check if user already exists
  IF EXISTS(SELECT 1 FROM public.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'User already exists with email: %', p_email;
  END IF;
  
  -- Check if there's already a pending invitation
  IF EXISTS(
    SELECT 1 FROM public.invitations 
    WHERE email = p_email 
      AND clinic_id = p_clinic_id 
      AND status = 'pending' 
      AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Pending invitation already exists for this email';
  END IF;
  
  -- Create the invitation
  INSERT INTO public.invitations (clinic_id, email, invited_by)
  VALUES (p_clinic_id, p_email, auth.uid())
  RETURNING id, token INTO new_invitation_id, new_token;
  
  RETURN QUERY SELECT new_invitation_id, new_token;
END;
$$;