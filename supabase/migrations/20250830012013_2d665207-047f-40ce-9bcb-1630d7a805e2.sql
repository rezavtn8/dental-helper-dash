-- Fix updated_at column reference that doesn't exist in users table
CREATE OR REPLACE FUNCTION public.create_clinic_with_owner(
  p_clinic_name text,
  p_clinic_code text,
  p_owner_name text,
  p_owner_email text,
  p_owner_id uuid
) RETURNS TABLE(
  success boolean,
  message text,
  clinic_id uuid,
  user_id uuid
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_clinic_id uuid;
  existing_clinic_check boolean;
  existing_user_check boolean;
BEGIN
  -- Validate inputs
  IF p_clinic_name IS NULL OR length(trim(p_clinic_name)) < 2 THEN
    RETURN QUERY SELECT false, 'Clinic name must be at least 2 characters'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;
  
  IF p_clinic_code IS NULL OR length(trim(p_clinic_code)) < 3 THEN
    RETURN QUERY SELECT false, 'Clinic code must be at least 3 characters'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;
  
  IF p_owner_name IS NULL OR length(trim(p_owner_name)) < 2 THEN
    RETURN QUERY SELECT false, 'Owner name must be at least 2 characters'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;
  
  IF NOT validate_email(p_owner_email) THEN
    RETURN QUERY SELECT false, 'Invalid email format'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;
  
  IF p_owner_id IS NULL THEN
    RETURN QUERY SELECT false, 'Owner ID is required'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;
  
  -- Sanitize inputs
  p_clinic_name := sanitize_text_input(trim(p_clinic_name));
  p_clinic_code := upper(trim(regexp_replace(p_clinic_code, '[^A-Z0-9]', '', 'g')));
  p_owner_name := sanitize_text_input(trim(p_owner_name));
  p_owner_email := lower(trim(p_owner_email));
  
  -- Check if clinic code already exists
  SELECT EXISTS(
    SELECT 1 FROM public.clinics c WHERE c.clinic_code = p_clinic_code
  ) INTO existing_clinic_check;
  
  IF existing_clinic_check THEN
    RETURN QUERY SELECT false, 'Clinic code already exists. Please choose a different one.'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;
  
  -- Check if user already has a clinic
  SELECT EXISTS(
    SELECT 1 FROM public.users u WHERE u.id = p_owner_id AND u.clinic_id IS NOT NULL
  ) INTO existing_user_check;
  
  IF existing_user_check THEN
    RETURN QUERY SELECT false, 'User already belongs to a clinic'::text, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;
  
  -- Start transaction (function is already in a transaction context)
  BEGIN
    -- Create clinic
    INSERT INTO public.clinics (
      name,
      clinic_code,
      is_active,
      subscription_status
    ) VALUES (
      p_clinic_name,
      p_clinic_code,
      true,
      'active'
    ) RETURNING id INTO new_clinic_id;
    
    -- Create or update user profile (removed updated_at column reference)
    INSERT INTO public.users (
      id,
      name,
      email,
      role,
      clinic_id,
      is_active
    ) VALUES (
      p_owner_id,
      p_owner_name,
      p_owner_email,
      'owner',
      new_clinic_id,
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      name = p_owner_name,
      email = p_owner_email,
      role = 'owner',
      clinic_id = new_clinic_id,
      is_active = true;
    
    -- Success
    RETURN QUERY SELECT true, 'Clinic and owner account created successfully!'::text, new_clinic_id, p_owner_id;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback happens automatically
      RETURN QUERY SELECT false, ('Database error: ' || SQLERRM)::text, NULL::uuid, NULL::uuid;
      RETURN;
  END;
END;
$$;