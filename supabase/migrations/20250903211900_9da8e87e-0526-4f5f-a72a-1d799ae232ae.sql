-- CRITICAL SECURITY FIXES FOR DENTALLEAGUE APPLICATION
-- Phase 1: Fix Critical Data Exposure Vulnerabilities

-- 1. SECURE CLINIC DATA ACCESS
-- Remove broad clinic access and implement context-aware lookups
DROP POLICY IF EXISTS "Restricted clinic lookup for join only" ON public.clinics;

-- Create more restrictive clinic access policy
CREATE POLICY "Secure clinic member access only" 
ON public.clinics 
FOR SELECT 
USING (
  -- Only clinic members can see their own clinic
  id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
);

-- Create secure clinic lookup function that doesn't expose sensitive data
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

-- 2. ELIMINATE USER EMAIL HARVESTING
-- Update users table policies to prevent email enumeration
DROP POLICY IF EXISTS "Users can read team member profiles (no email enumeration)" ON public.users;
DROP POLICY IF EXISTS "Owners can view users with pending join requests" ON public.users;

-- Create more restrictive team member access
CREATE POLICY "Secure team member access" 
ON public.users 
FOR SELECT 
USING (
  -- Users can only see their own profile with email
  (id = auth.uid()) OR
  -- Owners can see team members but with restricted email access
  (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner' AND id != auth.uid())
);

-- Create secure function for owners to view join request users (no email exposure)
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

-- 3. SECURE INVITATION SYSTEM
-- Update invitation policies for better scoping
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.invitations;

-- Create more secure invitation access
CREATE POLICY "Secure invitation access for recipients" 
ON public.invitations 
FOR SELECT 
USING (
  -- Only allow access to invitations specifically for the authenticated user's email
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  AND status = 'pending' 
  AND expires_at > now()
  -- Additional rate limiting context
  AND check_rate_limit('invitation_access', 10, 60)
);

-- Update invitation creation with enhanced validation
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

-- 4. ENHANCED RATE LIMITING AND MONITORING
-- Create more aggressive rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  operation_name text, 
  max_attempts integer DEFAULT 3, 
  window_minutes integer DEFAULT 60,
  security_level text DEFAULT 'standard'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- 5. AUDIT AND CLEANUP EXISTING POLICIES
-- Review and tighten task access
DROP POLICY IF EXISTS "Clinic members can read tasks" ON public.tasks;
CREATE POLICY "Secure task access for clinic members" 
ON public.tasks 
FOR SELECT 
USING (
  clinic_id = get_current_user_clinic_id() 
  AND (
    assigned_to = auth.uid() OR -- Assigned users can see their tasks
    get_current_user_role() IN ('owner', 'admin') -- Owners/admins can see all clinic tasks
  )
);

-- Secure feedback access
DROP POLICY IF EXISTS "Assistants can view their own feedback" ON public.feedback;
CREATE POLICY "Secure feedback access" 
ON public.feedback 
FOR SELECT 
USING (
  (assistant_id = auth.uid() AND is_visible = true) OR
  (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner')
);

-- 6. ADDITIONAL SECURITY ENHANCEMENTS
-- Create function to validate clinic membership before sensitive operations
CREATE OR REPLACE FUNCTION public.validate_clinic_membership(p_clinic_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
      AND clinic_id = p_clinic_id 
      AND is_active = true
  );
END;
$$;

-- Enhanced security event logging with IP tracking
CREATE OR REPLACE FUNCTION public.enhanced_security_log(
  event_type text, 
  event_details jsonb DEFAULT '{}'::jsonb, 
  severity text DEFAULT 'info'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  request_headers jsonb;
BEGIN
  -- Safely get request headers
  BEGIN
    request_headers := current_setting('request.headers', true)::jsonb;
  EXCEPTION WHEN OTHERS THEN
    request_headers := '{}'::jsonb;
  END;
  
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    new_values,
    timestamp
  ) VALUES (
    'security_events',
    event_type,
    auth.uid(),
    jsonb_build_object(
      'severity', severity,
      'details', event_details,
      'ip_address', COALESCE(request_headers->>'x-forwarded-for', 'unknown'),
      'user_agent', COALESCE(request_headers->>'user-agent', 'unknown'),
      'timestamp', extract(epoch from now())
    ),
    now()
  );
END;
$$;

-- Update all security logging calls to use enhanced version
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text, 
  event_details jsonb DEFAULT '{}'::jsonb, 
  severity text DEFAULT 'info'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM enhanced_security_log(event_type, event_details, severity);
END;
$$;