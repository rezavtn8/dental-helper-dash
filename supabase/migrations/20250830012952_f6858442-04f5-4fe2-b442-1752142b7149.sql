-- Fix ambiguous column reference in invitation functions
CREATE OR REPLACE FUNCTION public.create_simple_invitation(p_email text, p_name text, p_clinic_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(invitation_id uuid, token text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $$
DECLARE
  v_clinic_id uuid;
  new_invitation_id uuid;
  new_token text;
BEGIN
  -- Get clinic_id from current user if not provided
  IF p_clinic_id IS NULL THEN
    SELECT u.clinic_id INTO v_clinic_id FROM public.users u WHERE u.id = auth.uid();
  ELSE
    v_clinic_id := p_clinic_id;
  END IF;
  
  -- Validate inputs
  IF NOT validate_email(p_email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Check if user already exists
  IF EXISTS(SELECT 1 FROM public.users u WHERE u.email = lower(trim(p_email))) THEN
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
  RETURNING id, invitations.token INTO new_invitation_id, new_token;
  
  RETURN QUERY SELECT new_invitation_id, new_token;
END;
$$;