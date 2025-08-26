-- Remove PIN-related database functions and columns
DROP FUNCTION IF EXISTS public.authenticate_assistant(uuid, text, text);
DROP FUNCTION IF EXISTS public.check_assistant_exists(uuid, text);
DROP FUNCTION IF EXISTS public.set_assistant_pin(uuid, text, text);
DROP FUNCTION IF EXISTS public.update_user_pin(uuid, text);

-- Remove PIN-related columns from users table
ALTER TABLE public.users 
DROP COLUMN IF EXISTS pin,
DROP COLUMN IF EXISTS pin_changed_at,
DROP COLUMN IF EXISTS must_change_pin,
DROP COLUMN IF EXISTS pin_attempts,
DROP COLUMN IF EXISTS pin_locked_until;

-- Create invitations table for tracking assistant invitations
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'assistant',
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES public.users(id)
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invitations
CREATE POLICY "Owners can manage invitations in their clinic"
ON public.invitations
FOR ALL
TO authenticated
USING (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner')
WITH CHECK (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner');

CREATE POLICY "Users can view invitations in their clinic"
ON public.invitations
FOR SELECT
TO authenticated
USING (clinic_id = get_current_user_clinic_id());

-- Create function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT, clinic_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record invitations%ROWTYPE;
  user_exists BOOLEAN;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > now();
  
  IF invitation_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid or expired invitation'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if user already exists with this email
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE email = invitation_record.email
  ) INTO user_exists;
  
  IF user_exists THEN
    RETURN QUERY SELECT false, 'User already exists with this email'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Mark invitation as accepted
  UPDATE public.invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by = auth.uid()
  WHERE id = invitation_record.id;
  
  RETURN QUERY SELECT true, 'Invitation accepted successfully'::TEXT, invitation_record.clinic_id;
END;
$$;

-- Add updated_at trigger to invitations
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create assistant invitation
CREATE OR REPLACE FUNCTION public.create_assistant_invitation(
  p_clinic_id UUID,
  p_email TEXT,
  p_name TEXT
)
RETURNS TABLE(invitation_id UUID, invitation_token TEXT)
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