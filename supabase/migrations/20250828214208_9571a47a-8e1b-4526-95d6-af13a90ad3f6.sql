-- Update invitation function to handle existing users better
CREATE OR REPLACE FUNCTION public.create_assistant_invitation(p_clinic_id uuid, p_email text, p_name text)
 RETURNS TABLE(invitation_id uuid, invitation_token text, user_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_invitation_id UUID;
  new_token TEXT;
  existing_user RECORD;
BEGIN
  -- Only owners can create invitations
  IF get_current_user_role() != 'owner' OR get_current_user_clinic_id() != p_clinic_id THEN
    RAISE EXCEPTION 'Unauthorized to create invitations for this clinic';
  END IF;
  
  -- Check if user already exists and get their details
  SELECT * INTO existing_user FROM public.users WHERE email = p_email;
  
  IF existing_user.id IS NOT NULL THEN
    -- User exists, check their current clinic status
    IF existing_user.clinic_id = p_clinic_id THEN
      RAISE EXCEPTION 'This person is already a member of your clinic';
    ELSE
      RAISE EXCEPTION 'This person already has an account with another clinic. Please ask them to contact support to transfer clinics';
    END IF;
  END IF;
  
  -- Check if there's already a pending invitation
  IF EXISTS(
    SELECT 1 FROM public.invitations 
    WHERE email = p_email 
      AND clinic_id = p_clinic_id 
      AND status = 'pending' 
      AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'A pending invitation already exists for this email address';
  END IF;
  
  -- Create the invitation
  INSERT INTO public.invitations (clinic_id, email, role, invited_by)
  VALUES (p_clinic_id, p_email, 'assistant', auth.uid())
  RETURNING id, token INTO new_invitation_id, new_token;
  
  RETURN QUERY SELECT new_invitation_id, new_token, 'new_user'::text;
END;
$function$;