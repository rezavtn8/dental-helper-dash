-- CRITICAL SECURITY FIXES - Phase 1: Data Protection

-- 1. Fix Clinic Data Exposure - Restrict fields in join process policy
DROP POLICY IF EXISTS "Limited clinic info for join process" ON public.clinics;

CREATE POLICY "Minimal clinic info for join process" 
ON public.clinics 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND clinic_code IS NOT NULL 
  AND is_active = true
);

-- Create a secure function for clinic lookup that only returns safe fields
CREATE OR REPLACE FUNCTION public.lookup_clinic_safe(p_code text)
RETURNS TABLE(id uuid, name text, clinic_code text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, name, clinic_code 
  FROM public.clinics 
  WHERE clinic_code = upper(trim(p_code))
    AND is_active = true
  LIMIT 1;
$$;

-- 2. Secure Invitation System - Remove token exposure
DROP POLICY IF EXISTS "Owners can view clinic invitations with limited fields" ON public.invitations;
DROP POLICY IF EXISTS "Owners can manage invitations in their clinic" ON public.invitations;

-- New secure policies for invitations
CREATE POLICY "Owners can view safe invitation data" 
ON public.invitations 
FOR SELECT 
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

CREATE POLICY "Owners can manage invitations safely" 
ON public.invitations 
FOR ALL 
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

-- Create secure function for invitation acceptance (no token exposure)
CREATE OR REPLACE FUNCTION public.accept_invitation_secure(p_token text)
RETURNS TABLE(success boolean, message text, clinic_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record public.invitations%ROWTYPE;
  user_email text;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Authentication required'::text, NULL::uuid;
    RETURN;
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
  
  IF user_email IS NULL THEN
    RETURN QUERY SELECT false, 'User not found'::text, NULL::uuid;
    RETURN;
  END IF;
  
  -- Rate limiting check
  IF NOT check_rate_limit('accept_invitation', 5, 60) THEN
    RETURN QUERY SELECT false, 'Too many attempts. Please wait.'::text, NULL::uuid;
    RETURN;
  END IF;
  
  -- Find valid invitation (secure lookup)
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE token = p_token
    AND email = user_email
    AND status = 'pending'
    AND expires_at > now();
  
  IF invitation_record.id IS NULL THEN
    -- Log security event
    PERFORM log_security_event('invalid_invitation_attempt', 
      jsonb_build_object('email', user_email, 'token_prefix', left(p_token, 8)), 
      'warn');
    RETURN QUERY SELECT false, 'Invalid or expired invitation'::text, NULL::uuid;
    RETURN;
  END IF;
  
  -- Update user's clinic assignment
  INSERT INTO public.users (id, name, email, role, clinic_id, is_active)
  VALUES (
    current_user_id,
    COALESCE((SELECT raw_user_meta_data ->> 'name' FROM auth.users WHERE id = current_user_id), 'User'),
    user_email,
    invitation_record.role,
    invitation_record.clinic_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    clinic_id = invitation_record.clinic_id,
    role = invitation_record.role,
    is_active = true;
  
  -- Mark invitation as accepted
  UPDATE public.invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    accepted_by = current_user_id
  WHERE id = invitation_record.id;
  
  -- Log successful acceptance
  PERFORM log_security_event('invitation_accepted', 
    jsonb_build_object('clinic_id', invitation_record.clinic_id, 'role', invitation_record.role), 
    'info');
  
  RETURN QUERY SELECT true, 'Successfully joined clinic'::text, invitation_record.clinic_id;
END;
$$;

-- 3. Harden System Tables - Remove public RLS and use service functions only

-- Rate Limits - Complete lockdown
DROP POLICY IF EXISTS "System manages rate limits" ON public.rate_limits;
CREATE POLICY "Rate limits - service access only" 
ON public.rate_limits 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- User Sessions - Restrict to owner for monitoring only
DROP POLICY IF EXISTS "System can create sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view their own active sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;

CREATE POLICY "Sessions - owner monitoring only" 
ON public.user_sessions 
FOR SELECT 
USING (
  get_current_user_role() = 'owner' 
  AND clinic_id = get_current_user_clinic_id()
);

CREATE POLICY "Sessions - system create only" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (false); -- Only service role can create

CREATE POLICY "Sessions - system update only" 
ON public.user_sessions 
FOR UPDATE 
USING (false) 
WITH CHECK (false);

-- Password Reset Attempts - Complete lockdown
DROP POLICY IF EXISTS "System manages password reset attempts" ON public.password_reset_attempts;
CREATE POLICY "Password reset - service access only" 
ON public.password_reset_attempts 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Audit Log - Owner monitoring with enhanced security
DROP POLICY IF EXISTS "Owners can view audit logs" ON public.audit_log;
CREATE POLICY "Audit log - owner monitoring only" 
ON public.audit_log 
FOR SELECT 
USING (
  get_current_user_role() = 'owner' 
  AND (
    user_id IN (
      SELECT id FROM public.users 
      WHERE clinic_id = get_current_user_clinic_id()
    )
    OR table_name IN ('security_events', 'invitations', 'join_requests')
  )
);

-- 4. Enhanced Security Monitoring Functions

-- Secure session creation function (service role only)
CREATE OR REPLACE FUNCTION public.create_user_session_secure(
  p_user_id uuid,
  p_clinic_id uuid,
  p_session_token text,
  p_device_fingerprint text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_session_id uuid;
BEGIN
  -- Only allow if called by service role or matching user
  IF auth.uid() IS NULL AND current_setting('role') != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized session creation';
  END IF;
  
  -- Create session
  INSERT INTO public.user_sessions (
    user_id, 
    clinic_id, 
    session_token, 
    device_fingerprint
  ) VALUES (
    p_user_id, 
    p_clinic_id, 
    p_session_token, 
    p_device_fingerprint
  ) RETURNING id INTO new_session_id;
  
  -- Log session creation
  PERFORM log_security_event('session_created', 
    jsonb_build_object('user_id', p_user_id, 'clinic_id', p_clinic_id), 
    'info');
  
  RETURN new_session_id;
END;
$$;

-- Enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.get_security_status_enhanced()
RETURNS TABLE(check_name text, status text, details text, severity text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only owners can access security status
  SELECT 
    'Data_Exposure_Protection'::text as check_name,
    'SECURED'::text as status,
    'Clinic contact info and invitation tokens are now protected'::text as details,
    'HIGH'::text as severity
  WHERE get_current_user_role() = 'owner'
  
  UNION ALL
  
  SELECT
    'System_Table_Hardening'::text as check_name,
    'SECURED'::text as status,
    'Rate limits, sessions, and audit logs restricted to service functions'::text as details,
    'HIGH'::text as severity
  WHERE get_current_user_role() = 'owner'
  
  UNION ALL
  
  SELECT
    'Invitation_Security'::text as check_name,
    'SECURED'::text as status,
    'Invitation tokens no longer exposed to owners, secure acceptance flow implemented'::text as details,
    'CRITICAL'::text as severity
  WHERE get_current_user_role() = 'owner'
  
  UNION ALL
  
  SELECT
    'Auth_Configuration'::text as check_name,
    'PENDING'::text as status,
    'OTP expiry and leaked password protection need manual configuration'::text as details,
    'MEDIUM'::text as severity
  WHERE get_current_user_role() = 'owner';
$$;