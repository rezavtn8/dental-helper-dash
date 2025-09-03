-- Fix join request user profile handling
-- First, let's check if we have the trigger for handle_new_user
CREATE TRIGGER IF NOT EXISTS on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the submit_join_request function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.submit_join_request(p_clinic_code text)
RETURNS TABLE(success boolean, message text, request_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_clinic_id UUID;
  v_user_id UUID;
  v_request_id UUID;
  existing_membership BOOLEAN;
  pending_request BOOLEAN;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Not authenticated'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Get user email from auth.users for profile creation
  SELECT au.email INTO user_email FROM auth.users au WHERE au.id = v_user_id;
  
  -- Ensure user profile exists in public.users table
  INSERT INTO public.users (id, name, email, role, is_active)
  SELECT 
    v_user_id,
    COALESCE(au.raw_user_meta_data ->> 'name', au.raw_user_meta_data ->> 'full_name', split_part(au.email, '@', 1), 'User'),
    au.email,
    COALESCE(au.raw_user_meta_data ->> 'role', 'assistant'),
    true
  FROM auth.users au 
  WHERE au.id = v_user_id
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    email = COALESCE(EXCLUDED.email, public.users.email),
    is_active = true
  WHERE public.users.name IS NULL OR public.users.name = '';
  
  -- Find clinic by code
  SELECT id INTO v_clinic_id 
  FROM public.clinics 
  WHERE clinic_code = upper(trim(p_clinic_code)) AND is_active = true;
  
  IF v_clinic_id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid clinic code'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if user is already a member
  SELECT EXISTS(
    SELECT 1 FROM public.clinic_memberships 
    WHERE user_id = v_user_id AND clinic_id = v_clinic_id AND is_active = true
  ) INTO existing_membership;
  
  IF existing_membership THEN
    RETURN QUERY SELECT false, 'You are already a member of this clinic'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check for existing pending request
  SELECT EXISTS(
    SELECT 1 FROM public.join_requests 
    WHERE user_id = v_user_id AND clinic_id = v_clinic_id AND status = 'pending'
  ) INTO pending_request;
  
  IF pending_request THEN
    RETURN QUERY SELECT false, 'You already have a pending request for this clinic'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Create join request
  INSERT INTO public.join_requests (user_id, clinic_id)
  VALUES (v_user_id, v_clinic_id)
  RETURNING id INTO v_request_id;
  
  RETURN QUERY SELECT true, 'Join request submitted successfully'::TEXT, v_request_id;
END;
$function$;