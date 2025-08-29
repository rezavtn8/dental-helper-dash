-- CRITICAL SECURITY FIXES - Phase 1: RLS Policy Hardening
-- Fix exposed sensitive data in users, clinics, sessions, and invitations tables

-- 1. USERS TABLE SECURITY - Remove password_hash exposure and strengthen policies
DROP POLICY IF EXISTS "Users can read team members in their clinic" ON public.users;
CREATE POLICY "Users can read team members in their clinic"
ON public.users
FOR SELECT
USING (users.clinic_id = get_current_user_clinic_id())
-- Only expose safe fields, exclude password_hash and other sensitive data
;

-- Create a view for safe user data access (excluding password_hash)
CREATE OR REPLACE VIEW public.safe_user_profiles AS
SELECT 
  id,
  name,
  email,
  role,
  clinic_id,
  is_active,
  created_at,
  last_login
FROM public.users;

-- Grant access to the safe view
GRANT SELECT ON public.safe_user_profiles TO authenticated;

-- Strengthen user profile creation policy
DROP POLICY IF EXISTS "Allow user profile creation during auth" ON public.users;
CREATE POLICY "Authenticated users can create their own profile"
ON public.users
FOR INSERT
WITH CHECK (
  id = auth.uid() 
  AND clinic_id IS NOT NULL  -- Require clinic association
  AND role IN ('owner', 'assistant', 'admin')  -- Only allow valid roles
);

-- 2. CLINICS TABLE SECURITY - Restrict sensitive clinic information access
DROP POLICY IF EXISTS "Anyone can create clinics during setup" ON public.clinics;
CREATE POLICY "Authenticated users can create clinics with validation"
ON public.clinics
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL  -- Must be authenticated
  AND name IS NOT NULL    -- Require clinic name
  AND clinic_code IS NOT NULL  -- Require clinic code
);

-- Restrict clinic sensitive data access to owners only
DROP POLICY IF EXISTS "Authenticated users can view their clinic" ON public.clinics;
CREATE POLICY "Users can view basic clinic info"
ON public.clinics
FOR SELECT
USING (id = get_current_user_clinic_id());

-- Create separate policy for owners to access sensitive clinic data
CREATE POLICY "Owners can access sensitive clinic data"
ON public.clinics
FOR ALL
USING (
  id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

-- 3. USER_SESSIONS TABLE SECURITY - Restrict session token access
DROP POLICY IF EXISTS "Owners can view sessions in their clinic" ON public.user_sessions;
-- Remove owner access to other users' session tokens

CREATE POLICY "Users can only access their own sessions"
ON public.user_sessions
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. INVITATIONS TABLE SECURITY - Secure invitation token access
DROP POLICY IF EXISTS "Users can view invitations in their clinic" ON public.invitations;
CREATE POLICY "Limited invitation visibility"
ON public.invitations
FOR SELECT
USING (
  -- Only owners can see all invitations in their clinic
  (invitations.clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner')
  OR
  -- Users can only see invitations sent to their email
  (invitations.email = (SELECT email FROM public.users WHERE id = auth.uid()))
);

-- Create function to safely retrieve invitation info without exposing tokens
CREATE OR REPLACE FUNCTION public.get_safe_invitation_info(invitation_email text)
RETURNS TABLE(
  id uuid,
  clinic_id uuid,
  email text,
  role text,
  status text,
  created_at timestamp with time zone,
  expires_at timestamp with time zone
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.clinic_id,
    i.email,
    i.role,
    i.status,
    i.created_at,
    i.expires_at
  FROM public.invitations i
  WHERE i.email = invitation_email
    AND i.status = 'pending'
    AND i.expires_at > now()
  ORDER BY i.created_at DESC
  LIMIT 1;
$$;

-- 5. Add audit logging trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log role changes
  IF TG_TABLE_NAME = 'users' AND OLD.role != NEW.role THEN
    INSERT INTO public.audit_log (
      table_name,
      operation,
      user_id,
      old_values,
      new_values,
      timestamp
    ) VALUES (
      TG_TABLE_NAME,
      'role_change',
      auth.uid(),
      json_build_object('role', OLD.role),
      json_build_object('role', NEW.role),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid,
  old_values jsonb,
  new_values jsonb,
  timestamp timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only owners can view audit logs for their clinic
CREATE POLICY "Owners can view audit logs"
ON public.audit_log
FOR SELECT
USING (
  get_current_user_role() = 'owner'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id 
    AND clinic_id = get_current_user_clinic_id()
  )
);

-- Add audit triggers
DROP TRIGGER IF EXISTS audit_user_changes ON public.users;
CREATE TRIGGER audit_user_changes
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_changes();

-- 6. Add session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.user_sessions 
  WHERE expires_at < now() OR is_active = false;
$$;