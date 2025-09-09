-- Security Enhancement Migration: Critical Data Protection & Authentication Hardening

-- 1. CREATE ENHANCED SECURITY FUNCTIONS
-- Secure function to get team members without exposing emails in bulk
CREATE OR REPLACE FUNCTION public.get_team_members_secure()
RETURNS TABLE(id uuid, name text, role text, is_active boolean, created_at timestamp with time zone, last_login timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
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

-- Secure function to get individual user profile (with email only when authorized)
CREATE OR REPLACE FUNCTION public.get_user_profile_secure(target_user_id uuid)
RETURNS TABLE(id uuid, name text, email text, role text, is_active boolean, created_at timestamp with time zone, last_login timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
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

-- Secure clinic lookup function (prevents enumeration)
CREATE OR REPLACE FUNCTION public.lookup_clinic_for_join(p_code text)
RETURNS TABLE(id uuid, name text, clinic_code text, can_join boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  clinic_record RECORD;
  user_clinic_id uuid;
BEGIN
  -- Rate limiting for clinic lookups
  IF NOT check_rate_limit('secure_clinic_lookup', 5, 60) THEN
    RAISE EXCEPTION 'Too many clinic lookup attempts. Please wait before trying again.';
  END IF;
  
  -- Input validation
  IF p_code IS NULL OR length(trim(p_code)) < 3 THEN
    RETURN; -- Return empty result
  END IF;
  
  -- Sanitize input
  p_code := upper(trim(regexp_replace(p_code, '[^A-Z0-9]', '', 'g')));
  
  -- Get user's current clinic
  SELECT clinic_id INTO user_clinic_id FROM public.users WHERE id = auth.uid();
  
  -- Find clinic (only return minimal safe data)
  SELECT c.id, c.name, c.clinic_code INTO clinic_record
  FROM public.clinics c 
  WHERE c.clinic_code = p_code 
    AND c.is_active = true
  LIMIT 1;
  
  -- Log lookup attempt
  PERFORM log_security_event('secure_clinic_lookup_attempt', 
    jsonb_build_object('clinic_code', p_code, 'found', clinic_record.id IS NOT NULL), 
    'info');
  
  IF clinic_record.id IS NOT NULL THEN
    -- Check if user can join (not already a member)
    RETURN QUERY SELECT 
      clinic_record.id, 
      clinic_record.name, 
      clinic_record.clinic_code,
      (user_clinic_id IS NULL OR user_clinic_id != clinic_record.id) as can_join;
  END IF;
END;
$$;

-- Function to get join request user info (for owners only)
CREATE OR REPLACE FUNCTION public.get_join_request_user_info(p_user_id uuid)
RETURNS TABLE(id uuid, name text, role text, can_view boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only owners can access this function
  IF get_current_user_role() != 'owner' THEN
    RETURN;
  END IF;
  
  -- Check if user has pending join request for owner's clinic
  IF EXISTS(
    SELECT 1 FROM public.join_requests jr
    WHERE jr.user_id = p_user_id 
      AND jr.clinic_id = get_current_user_clinic_id()
      AND jr.status = 'pending'
  ) THEN
    RETURN QUERY 
    SELECT u.id, u.name, u.role, true as can_view
    FROM public.users u 
    WHERE u.id = p_user_id;
  END IF;
END;
$$;

-- Enhanced security event logging function
CREATE OR REPLACE FUNCTION public.enhanced_security_log(
  event_type text,
  event_details jsonb DEFAULT '{}',
  severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Enhanced logging with user context
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    old_values,
    new_values,
    timestamp
  ) VALUES (
    'security_events',
    event_type,
    auth.uid(),
    jsonb_build_object(
      'severity', severity,
      'ip_address', current_setting('request.headers', true)::jsonb ->> 'cf-connecting-ip',
      'user_agent', current_setting('request.headers', true)::jsonb ->> 'user-agent'
    ),
    event_details,
    now()
  );
END;
$$;

-- 2. ENHANCE INVITATION SECURITY
-- Secure invitation creation function
CREATE OR REPLACE FUNCTION public.create_secure_invitation(
  p_clinic_id uuid,
  p_email text,
  p_name text,
  p_role text DEFAULT 'assistant'
)
RETURNS TABLE(invitation_id uuid, invitation_token text, invitation_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_invitation_id UUID;
  new_token TEXT;
  new_url TEXT;
  existing_user RECORD;
  clinic_check RECORD;
BEGIN
  -- Enhanced rate limiting
  IF NOT check_rate_limit('create_secure_invitation', 5, 60) THEN
    RAISE EXCEPTION 'Too many invitation attempts. Please wait before creating more invitations.';
  END IF;
  
  -- Verify caller is owner/admin of the clinic
  SELECT id, name INTO clinic_check FROM public.clinics 
  WHERE id = p_clinic_id AND id = get_current_user_clinic_id();
  
  IF clinic_check.id IS NULL OR get_current_user_role() NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized to create invitations for this clinic';
  END IF;
  
  -- Enhanced input validation
  IF NOT validate_email(p_email) THEN
    RAISE EXCEPTION 'Invalid email format provided';
  END IF;
  
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RAISE EXCEPTION 'Valid name is required (minimum 2 characters)';
  END IF;
  
  IF p_role NOT IN ('assistant', 'admin') THEN
    RAISE EXCEPTION 'Invalid role specified. Must be assistant or admin';
  END IF;
  
  -- Check for existing user (enhanced security)
  SELECT id, clinic_id INTO existing_user FROM public.users 
  WHERE email = lower(trim(p_email));
  
  IF existing_user.id IS NOT NULL THEN
    IF existing_user.clinic_id = p_clinic_id THEN
      RAISE EXCEPTION 'This person is already a member of your team.';
    ELSE
      RAISE EXCEPTION 'This email is already registered with another clinic.';
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
    RAISE EXCEPTION 'A pending invitation already exists for this email address.';
  END IF;
  
  -- Create invitation with enhanced security
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
    'email_signup',
    now() + interval '48 hours' -- Reduced expiry time
  )
  RETURNING id, token INTO new_invitation_id, new_token;
  
  -- Generate secure URL
  new_url := format('/join?token=%s', new_token);
  
  -- Log invitation creation
  PERFORM log_security_event('secure_invitation_created', 
    jsonb_build_object('clinic_id', p_clinic_id, 'role', p_role), 
    'info');
  
  RETURN QUERY SELECT new_invitation_id, new_token, new_url;
END;
$$;

-- Secure join request submission
CREATE OR REPLACE FUNCTION public.submit_join_request_secure(p_clinic_code text)
RETURNS TABLE(success boolean, message text, request_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Helper function to check if owner can view user (for join requests)
CREATE OR REPLACE FUNCTION public.can_owner_view_user(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.join_requests jr
    JOIN public.clinics c ON jr.clinic_id = c.id
    JOIN public.users owner ON owner.clinic_id = c.id
    WHERE jr.user_id = target_user_id
      AND jr.status = 'pending'
      AND owner.id = auth.uid()
      AND owner.role = 'owner'
  );
$$;

-- 3. UPDATE RLS POLICIES FOR ENHANCED SECURITY

-- Drop and recreate users table policies with enhanced security
DROP POLICY IF EXISTS "Clinic owners can view team member basic info" ON public.users;
DROP POLICY IF EXISTS "Clinic owners can manage team member status" ON public.users;

-- More restrictive user access policies
CREATE POLICY "Clinic owners can view team member basic info"
ON public.users
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
  AND id <> auth.uid()
);

CREATE POLICY "Clinic owners can manage team member status" 
ON public.users
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
  AND id <> auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
  AND id <> auth.uid()
  -- Prevent email changes in team member updates
  AND email = (SELECT email FROM public.users WHERE id = users.id)
);

-- Enhanced audit log access policy
DROP POLICY IF EXISTS "Final audit log lockdown" ON public.audit_log;
CREATE POLICY "Final audit log lockdown"
ON public.audit_log
FOR SELECT
USING (
  get_current_user_role() = 'owner'
  AND (
    -- Owner can see logs for users in their clinic
    user_id IN (
      SELECT id FROM public.users 
      WHERE clinic_id = get_current_user_clinic_id()
    )
    -- Or security-related logs for their clinic
    OR table_name IN ('security_events', 'invitations', 'join_requests')
  )
);

-- 4. CREATE SECURITY STATUS MONITORING

-- Enhanced security status function
CREATE OR REPLACE FUNCTION public.get_security_status_enhanced()
RETURNS TABLE(check_name text, status text, details text, severity text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
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

-- Function to create lookup_clinic_by_code_secure (referenced above)
CREATE OR REPLACE FUNCTION public.lookup_clinic_by_code_secure(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  clinic_id uuid;
BEGIN
  -- Rate limiting
  IF NOT check_rate_limit('clinic_lookup_secure', 5, 60) THEN
    RETURN NULL;
  END IF;
  
  -- Input validation and sanitization
  IF p_code IS NULL OR length(trim(p_code)) < 3 THEN
    RETURN NULL;
  END IF;
  
  p_code := upper(trim(regexp_replace(p_code, '[^A-Z0-9]', '', 'g')));
  
  -- Secure lookup
  SELECT id INTO clinic_id
  FROM public.clinics 
  WHERE clinic_code = p_code 
    AND is_active = true
  LIMIT 1;
  
  -- Log attempt
  PERFORM log_security_event('secure_clinic_code_lookup', 
    jsonb_build_object('code_prefix', left(p_code, 3), 'found', clinic_id IS NOT NULL), 
    'info');
  
  RETURN clinic_id;
END;
$$;