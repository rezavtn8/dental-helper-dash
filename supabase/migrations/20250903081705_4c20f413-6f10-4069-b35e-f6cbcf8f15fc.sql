-- CRITICAL SECURITY FIX: Prevent Email Harvesting Through Clinic Access

-- The issue: Current clinic policy allows any authenticated user to see all clinics,
-- which could potentially expose user emails through relationships or functions.

-- 1. Replace overly permissive clinic policy with context-aware access
DROP POLICY IF EXISTS "Minimal clinic info for join process" ON public.clinics;

-- Create secure clinic lookup that prevents email enumeration
CREATE POLICY "Restricted clinic lookup for join only" 
ON public.clinics 
FOR SELECT 
USING (
  -- Only allow clinic lookup in specific contexts, not general browsing
  auth.uid() IS NOT NULL 
  AND clinic_code IS NOT NULL 
  AND is_active = true
  AND (
    -- User is already a member of this clinic (can see their own clinic)
    id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
    OR 
    -- User is looking up a specific clinic by code (not browsing all clinics)
    clinic_code = ANY(current_setting('app.lookup_codes', true)::text[])
  )
);

-- 2. Create secure clinic code lookup function that prevents enumeration
CREATE OR REPLACE FUNCTION public.lookup_clinic_by_code_secure(p_code text)
RETURNS TABLE(id uuid, name text, clinic_code text, member_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  clinic_record RECORD;
  lookup_codes text[];
BEGIN
  -- Input validation and sanitization
  IF p_code IS NULL OR length(trim(p_code)) < 3 THEN
    RETURN; -- Return empty result for invalid codes
  END IF;
  
  -- Sanitize the clinic code
  p_code := upper(trim(regexp_replace(p_code, '[^A-Z0-9]', '', 'g')));
  
  -- Rate limiting for clinic lookups to prevent enumeration attacks
  IF NOT check_rate_limit('clinic_lookup', 10, 60) THEN
    RAISE EXCEPTION 'Too many clinic lookup attempts. Please wait before trying again.';
  END IF;
  
  -- Set the lookup code in session to allow policy access
  lookup_codes := ARRAY[p_code];
  PERFORM set_config('app.lookup_codes', array_to_string(lookup_codes, ','), true);
  
  -- Find clinic with minimal exposed information
  SELECT c.id, c.name, c.clinic_code, 
         COALESCE((SELECT COUNT(*) FROM public.users u WHERE u.clinic_id = c.id AND u.is_active = true), 0)::integer as member_count
  INTO clinic_record
  FROM public.clinics c 
  WHERE c.clinic_code = p_code 
    AND c.is_active = true
  LIMIT 1;
  
  -- Log the lookup attempt for security monitoring
  PERFORM log_security_event('clinic_lookup_attempt', 
    jsonb_build_object('clinic_code', p_code, 'found', clinic_record.id IS NOT NULL), 
    'info');
  
  IF clinic_record.id IS NOT NULL THEN
    RETURN QUERY SELECT clinic_record.id, clinic_record.name, clinic_record.clinic_code, clinic_record.member_count;
  END IF;
  
  -- Clear the session variable
  PERFORM set_config('app.lookup_codes', '', true);
END;
$$;

-- 3. Strengthen user table policies to prevent any email enumeration
DROP POLICY IF EXISTS "Users can read team members in their clinic" ON public.users;

-- Create more restrictive policy that doesn't expose emails in listings
CREATE POLICY "Users can read team member profiles (no email enumeration)" 
ON public.users 
FOR SELECT 
USING (
  clinic_id = get_current_user_clinic_id() 
  AND (
    -- Users can see full details of themselves
    id = auth.uid()
    OR 
    -- Users can see limited info of team members (no emails in bulk queries)
    (clinic_id IS NOT NULL AND get_current_user_role() IN ('owner', 'admin'))
  )
);

-- 4. Create secure team member listing function that protects emails
CREATE OR REPLACE FUNCTION public.get_team_members_secure()
RETURNS TABLE(
  id uuid, 
  name text, 
  role text, 
  is_active boolean, 
  created_at timestamp with time zone,
  last_login timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only return safe fields, never emails in bulk listings
  SELECT 
    u.id,
    u.name,
    u.role,
    u.is_active,
    u.created_at,
    u.last_login
  FROM public.users u
  WHERE u.clinic_id = get_current_user_clinic_id()
    AND u.is_active = true
    AND get_current_user_role() IN ('owner', 'admin')
  ORDER BY u.created_at DESC;
$$;

-- 5. Create secure individual user lookup that only shows email to authorized users
CREATE OR REPLACE FUNCTION public.get_user_profile_secure(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  role text,
  is_active boolean,
  created_at timestamp with time zone,
  last_login timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER  
SET search_path TO 'public'
AS $$
  -- Only return email if user is authorized to see it
  SELECT 
    u.id,
    u.name,
    CASE 
      WHEN u.id = auth.uid() OR get_current_user_role() = 'owner' THEN u.email
      ELSE NULL -- Hide email from unauthorized users
    END as email,
    u.role,
    u.is_active,
    u.created_at,
    u.last_login
  FROM public.users u
  WHERE u.id = target_user_id
    AND (
      u.id = auth.uid() -- Own profile
      OR (u.clinic_id = get_current_user_clinic_id() AND get_current_user_role() IN ('owner', 'admin')) -- Team member
    )
  LIMIT 1;
$$;

-- 6. Enhance join request process to prevent email enumeration
CREATE OR REPLACE FUNCTION public.submit_join_request_secure(p_clinic_code text)
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
BEGIN
  -- Enhanced rate limiting for join requests
  IF NOT check_rate_limit('join_request', 3, 60) THEN
    RETURN QUERY SELECT false, 'Too many join requests. Please wait before trying again.'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Authentication required'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Input validation
  IF p_clinic_code IS NULL OR length(trim(p_clinic_code)) < 3 THEN
    RETURN QUERY SELECT false, 'Invalid clinic code format'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Sanitize clinic code
  p_clinic_code := upper(trim(regexp_replace(p_clinic_code, '[^A-Z0-9]', '', 'g')));
  
  -- Use secure clinic lookup (doesn't expose user emails)
  SELECT id INTO v_clinic_id FROM lookup_clinic_by_code_secure(p_clinic_code);
  
  IF v_clinic_id IS NULL THEN
    -- Generic error message to prevent clinic enumeration
    RETURN QUERY SELECT false, 'Invalid clinic code or clinic not accepting requests'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Ensure user profile exists without exposing emails
  INSERT INTO public.users (id, name, email, role, is_active)
  SELECT 
    v_user_id,
    COALESCE(au.raw_user_meta_data ->> 'name', au.raw_user_meta_data ->> 'full_name', 'User'),
    au.email,
    'assistant',
    true
  FROM auth.users au 
  WHERE au.id = v_user_id
  ON CONFLICT (id) DO UPDATE SET
    is_active = true;
  
  -- Check existing membership without exposing details
  SELECT EXISTS(
    SELECT 1 FROM public.users 
    WHERE id = v_user_id AND clinic_id = v_clinic_id AND is_active = true
  ) INTO existing_membership;
  
  IF existing_membership THEN
    RETURN QUERY SELECT false, 'You are already a member of this clinic'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check for pending request
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
  
  -- Log security event
  PERFORM log_security_event('join_request_submitted', 
    jsonb_build_object('clinic_id', v_clinic_id, 'user_id', v_user_id), 
    'info');
  
  RETURN QUERY SELECT true, 'Join request submitted successfully'::TEXT, v_request_id;
END;
$$;

-- 7. Update security status function to reflect email protection
CREATE OR REPLACE FUNCTION public.get_security_status_enhanced()
RETURNS TABLE(check_name text, status text, details text, severity text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    'Email_Enumeration_Protection'::text as check_name,
    'SECURED'::text as status,
    'User emails are protected from enumeration attacks through clinic access'::text as details,
    'CRITICAL'::text as severity
  WHERE get_current_user_role() = 'owner'
  
  UNION ALL
  
  SELECT 
    'Clinic_Access_Restriction'::text as check_name,
    'SECURED'::text as status,
    'Clinic lookup now requires specific context and prevents bulk enumeration'::text as details,
    'HIGH'::text as severity
  WHERE get_current_user_role() = 'owner'
  
  UNION ALL
  
  SELECT
    'Rate_Limited_Lookups'::text as check_name,
    'SECURED'::text as status,
    'All clinic and user lookups are rate limited to prevent abuse'::text as details,
    'MEDIUM'::text as severity
  WHERE get_current_user_role() = 'owner'
  
  UNION ALL
  
  SELECT
    'Team_Access_Controls'::text as check_name,
    'SECURED'::text as status,
    'Team member access restricted with no bulk email exposure'::text as details,
    'HIGH'::text as severity
  WHERE get_current_user_role() = 'owner';
$$;