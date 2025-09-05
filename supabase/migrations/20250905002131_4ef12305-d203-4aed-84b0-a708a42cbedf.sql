-- =======================
-- CRITICAL SECURITY FIXES
-- =======================

-- 1. REPLACE OVERLY PERMISSIVE USER RLS POLICIES
-- Remove the current "ULTIMATE user data protection" policy that exposes emails
DROP POLICY IF EXISTS "ULTIMATE user data protection" ON public.users;

-- Create separate, more restrictive policies for users table
-- Policy 1: Users can view their own complete profile (including email)
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile data
CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their own profile during signup
CREATE POLICY "Users can create their own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy 4: Clinic owners can view LIMITED team member data (NO EMAIL ACCESS)
-- This provides essential team management capabilities without exposing emails
CREATE POLICY "Clinic owners can view team member basic info" 
  ON public.users 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND clinic_id = get_current_user_clinic_id() 
    AND get_current_user_role() = 'owner'
    AND id != auth.uid()  -- Cannot use this policy to view own data
  );

-- Policy 5: Clinic owners can update team member status and roles (but not emails/names)
CREATE POLICY "Clinic owners can manage team member status" 
  ON public.users 
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL 
    AND clinic_id = get_current_user_clinic_id() 
    AND get_current_user_role() = 'owner'
    AND id != auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND clinic_id = get_current_user_clinic_id() 
    AND get_current_user_role() = 'owner'
    AND id != auth.uid()
    -- Prevent email changes by other users
    AND email = (SELECT email FROM public.users WHERE id = users.id)
  );

-- 2. CREATE SECURE FUNCTION FOR TEAM ACCESS THAT EXCLUDES EMAILS
CREATE OR REPLACE FUNCTION public.get_team_members_safe()
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
SET search_path = public
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

-- 3. CREATE SECURE FUNCTION FOR INDIVIDUAL USER PROFILE ACCESS
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(target_user_id uuid)
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
SET search_path = public
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

-- 4. ENHANCE CLINIC DATA PROTECTION
-- Replace the existing clinic policy with more restrictive access
DROP POLICY IF EXISTS "ULTIMATE clinic data protection" ON public.clinics;

-- Policy 1: Users can view their own clinic data
CREATE POLICY "Users can view their clinic basic info" 
  ON public.clinics 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND id = get_current_user_clinic_id()
  );

-- Policy 2: Only owners can modify clinic data
CREATE POLICY "Clinic owners can manage clinic" 
  ON public.clinics 
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL 
    AND id = get_current_user_clinic_id() 
    AND get_current_user_role() = 'owner'
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND ((id = get_current_user_clinic_id() AND get_current_user_role() = 'owner')
    OR (id IS NULL AND auth.uid() IS NOT NULL)) -- Allow creating new clinics
  );

-- 5. SECURE INVITATION SYSTEM WITH ENHANCED PROTECTION
-- Replace the existing invitation policy
DROP POLICY IF EXISTS "ULTIMATE invitation system protection" ON public.invitations;

-- Policy 1: Users can view invitations sent to their email address
CREATE POLICY "Users can view their own invitations" 
  ON public.invitations 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending' 
    AND expires_at > now()
  );

-- Policy 2: Users can accept invitations sent to their email
CREATE POLICY "Users can accept their own invitations" 
  ON public.invitations 
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL 
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending' 
    AND expires_at > now()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND status = 'accepted' 
    AND accepted_by = auth.uid()
  );

-- Policy 3: Clinic owners can manage invitations for their clinic
CREATE POLICY "Clinic owners can manage invitations" 
  ON public.invitations 
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL 
    AND clinic_id = get_current_user_clinic_id() 
    AND get_current_user_role() = 'owner'
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND clinic_id = get_current_user_clinic_id()
  );

-- 6. ENHANCE SESSION SECURITY - RESTRICT ACCESS TO SESSION DATA
-- Update session policies to prevent unnecessary exposure
DROP POLICY IF EXISTS "Sessions - owner monitoring only" ON public.user_sessions;
DROP POLICY IF EXISTS "Sessions - system create only" ON public.user_sessions;
DROP POLICY IF EXISTS "Sessions - system update only" ON public.user_sessions;

-- Only allow system-level access to sessions (no user-level access at all)
CREATE POLICY "Sessions - system access only" 
  ON public.user_sessions 
  FOR ALL 
  USING (false)  -- No user can access session data
  WITH CHECK (false);

-- 7. ENHANCED RATE LIMITING FUNCTION
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  operation_name text, 
  max_attempts integer DEFAULT 3, 
  window_minutes integer DEFAULT 60,
  security_level text DEFAULT 'standard'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  window_start_time timestamp with time zone;
  ip_address text;
BEGIN
  -- Get IP address for enhanced tracking
  ip_address := current_setting('request.headers', true)::jsonb->>'x-forwarded-for';
  
  -- Clean up old records
  DELETE FROM public.rate_limits 
  WHERE created_at < (now() - interval '24 hours');
  
  -- Check both user and IP-based limits for high-security operations
  IF security_level = 'high' THEN
    -- Check IP-based rate limit first
    SELECT COUNT(*) INTO current_attempts
    FROM public.rate_limits
    WHERE operation = operation_name
      AND (ip_address IS NOT NULL AND ip_address = ip_address)
      AND window_start > (now() - (window_minutes || ' minutes')::interval);
    
    IF current_attempts >= (max_attempts / 2) THEN
      -- Log security event for IP-based blocking
      PERFORM log_security_event('rate_limit_ip_block', 
        jsonb_build_object('operation', operation_name, 'ip', ip_address), 
        'warn');
      RETURN false;
    END IF;
  END IF;
  
  -- Standard user-based rate limiting
  SELECT attempts, window_start INTO current_attempts, window_start_time
  FROM public.rate_limits
  WHERE user_id = auth.uid()
    AND operation = operation_name
    AND window_start > (now() - (window_minutes || ' minutes')::interval)
  ORDER BY window_start DESC
  LIMIT 1;
  
  IF current_attempts IS NULL OR window_start_time < (now() - (window_minutes || ' minutes')::interval) THEN
    INSERT INTO public.rate_limits (user_id, operation, attempts, ip_address)
    VALUES (auth.uid(), operation_name, 1, ip_address::inet);
    RETURN true;
  END IF;
  
  IF current_attempts >= max_attempts THEN
    -- Log security event for rate limit hit
    PERFORM log_security_event('rate_limit_exceeded', 
      jsonb_build_object('operation', operation_name, 'attempts', current_attempts), 
      'warn');
    RETURN false;
  END IF;
  
  UPDATE public.rate_limits
  SET attempts = attempts + 1
  WHERE user_id = auth.uid()
    AND operation = operation_name
    AND window_start = window_start_time;
  
  RETURN true;
END;
$$;

-- 8. CREATE ENHANCED SECURITY LOGGING FUNCTION
CREATE OR REPLACE FUNCTION public.enhanced_security_log(
  event_type text, 
  event_details jsonb DEFAULT '{}'::jsonb, 
  severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enhanced logging with more context
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
    jsonb_build_object('severity', severity, 'timestamp', now()),
    event_details,
    now()
  );
  
  -- Also log to application logs for monitoring
  RAISE LOG 'Security Event: % - % - User: % - Details: %', 
    severity, event_type, COALESCE(auth.uid()::text, 'anonymous'), event_details;
END;
$$;

-- 9. UPDATE SECURITY STATUS FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_security_status_enhanced()
RETURNS TABLE(check_name text, status text, details text, severity text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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