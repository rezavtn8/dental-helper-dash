-- Drop the old function first
DROP FUNCTION IF EXISTS public.lookup_clinic_for_join(text);

-- Fix Issue 1: Create a simpler, reliable lookup_clinic_for_join function
CREATE OR REPLACE FUNCTION public.lookup_clinic_for_join(p_code text)
RETURNS TABLE(id uuid, name text, clinic_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sanitized_code text;
BEGIN
  -- Input validation
  IF p_code IS NULL OR length(trim(p_code)) < 3 THEN
    RETURN; -- Return empty result
  END IF;
  
  -- Sanitize input - only allow alphanumeric characters
  sanitized_code := upper(trim(regexp_replace(p_code, '[^A-Z0-9]', '', 'g')));
  
  -- Return clinic info (no rate limiting for preview - it's just a lookup)
  RETURN QUERY 
  SELECT c.id, c.name, c.clinic_code
  FROM public.clinics c 
  WHERE c.clinic_code = sanitized_code 
    AND c.is_active = true
  LIMIT 1;
END;
$$;

-- Fix Issue 2: Improve user name extraction in submit_join_request
CREATE OR REPLACE FUNCTION public.submit_join_request(p_clinic_code text)
RETURNS TABLE(success boolean, message text, request_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_clinic_id UUID;
  v_user_id UUID;
  v_request_id UUID;
  existing_membership BOOLEAN;
  pending_request BOOLEAN;
  user_email TEXT;
  user_name TEXT;
  user_metadata JSONB;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Not authenticated'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Get user metadata from auth.users for proper name extraction
  SELECT 
    au.email,
    au.raw_user_meta_data
  INTO user_email, user_metadata
  FROM auth.users au 
  WHERE au.id = v_user_id;

  -- Extract name with better fallback logic
  user_name := COALESCE(
    user_metadata->>'name',
    user_metadata->>'full_name',
    user_metadata->>'display_name',
    split_part(user_email, '@', 1)
  );

  -- Ensure user profile exists in public.users table with proper name
  INSERT INTO public.users (id, name, email, role, is_active)
  VALUES (
    v_user_id,
    user_name,
    user_email,
    'assistant',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    name = CASE 
      WHEN public.users.name IS NULL OR public.users.name = '' OR public.users.name = 'User'
      THEN EXCLUDED.name
      ELSE public.users.name
    END,
    email = COALESCE(EXCLUDED.email, public.users.email),
    is_active = true;
  
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
    SELECT 1 FROM public.users 
    WHERE id = v_user_id AND clinic_id = v_clinic_id
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
$$;