-- Update accept_invitation function to allow existing users to accept invitations
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token text)
RETURNS TABLE(success boolean, message text, clinic_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record invitations%ROWTYPE;
  existing_user_id uuid;
  existing_clinic_id uuid;
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
  SELECT id, clinic_id INTO existing_user_id, existing_clinic_id
  FROM public.users 
  WHERE email = invitation_record.email;
  
  -- If user exists and already has a different clinic, prevent acceptance
  IF existing_user_id IS NOT NULL AND existing_clinic_id IS NOT NULL AND existing_clinic_id != invitation_record.clinic_id THEN
    RETURN QUERY SELECT false, 'User already belongs to a different clinic'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- If user exists but has no clinic, or no user exists, accept the invitation
  IF existing_user_id IS NOT NULL AND existing_clinic_id IS NULL THEN
    -- Update existing user's clinic_id
    UPDATE public.users
    SET clinic_id = invitation_record.clinic_id,
        updated_at = now()
    WHERE id = existing_user_id;
  END IF;
  
  -- Mark invitation as accepted
  UPDATE public.invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by = COALESCE(existing_user_id, auth.uid())
  WHERE id = invitation_record.id;
  
  RETURN QUERY SELECT true, 'Invitation accepted successfully'::TEXT, invitation_record.clinic_id;
END;
$function$;

-- Create function to automatically link users to pending invitations
CREATE OR REPLACE FUNCTION public.link_user_to_pending_invitation(user_email text)
RETURNS TABLE(success boolean, message text, clinic_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record invitations%ROWTYPE;
  current_user_id uuid;
  current_clinic_id uuid;
BEGIN
  -- Get current user info
  SELECT id, clinic_id INTO current_user_id, current_clinic_id
  FROM public.users 
  WHERE email = user_email AND id = auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User not found'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- If user already has a clinic, no need to link
  IF current_clinic_id IS NOT NULL THEN
    RETURN QUERY SELECT false, 'User already has a clinic assigned'::TEXT, current_clinic_id;
    RETURN;
  END IF;
  
  -- Find pending invitation for this email
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE email = user_email
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF invitation_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'No pending invitation found'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Update user's clinic_id
  UPDATE public.users
  SET clinic_id = invitation_record.clinic_id,
      updated_at = now()
  WHERE id = current_user_id;
  
  -- Mark invitation as accepted
  UPDATE public.invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by = current_user_id
  WHERE id = invitation_record.id;
  
  RETURN QUERY SELECT true, 'Successfully linked to clinic'::TEXT, invitation_record.clinic_id;
END;
$function$;