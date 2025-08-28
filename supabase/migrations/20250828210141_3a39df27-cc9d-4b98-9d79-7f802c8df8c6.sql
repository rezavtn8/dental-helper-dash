-- CRITICAL SECURITY FIX: Remove overly permissive clinic access policy
DROP POLICY IF EXISTS "Public can lookup clinic by code for login" ON public.clinics;

-- Drop existing policy with same name to avoid conflict
DROP POLICY IF EXISTS "Authenticated users can read their clinic info" ON public.clinics;

-- Create secure function for clinic code lookup that only returns minimal data needed for login
CREATE OR REPLACE FUNCTION public.lookup_clinic_by_code(p_code text)
RETURNS TABLE(id uuid, name text, clinic_code text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, name, clinic_code 
  FROM public.clinics 
  WHERE clinic_code = p_code 
    AND is_active = true
  LIMIT 1;
$$;

-- Create new restrictive policy for authenticated clinic access only  
CREATE POLICY "Authenticated users can view their clinic" 
ON public.clinics 
FOR SELECT 
USING (id = get_current_user_clinic_id());

-- Add rate limiting protection to invitation acceptance
CREATE OR REPLACE FUNCTION public.accept_invitation_with_rate_limit(invitation_token text)
RETURNS TABLE(success boolean, message text, clinic_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record invitations%ROWTYPE;
  user_exists BOOLEAN;
  recent_attempts INTEGER;
BEGIN
  -- Check for recent failed attempts (basic rate limiting)
  SELECT COUNT(*) INTO recent_attempts
  FROM public.invitations
  WHERE token = invitation_token
    AND updated_at > (now() - interval '1 hour')
    AND status = 'pending';
  
  IF recent_attempts > 10 THEN
    RETURN QUERY SELECT false, 'Too many attempts. Please try again later.'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Validate token format (should be base64)
  IF invitation_token !~ '^[A-Za-z0-9+/=]+$' OR length(invitation_token) < 20 THEN
    RETURN QUERY SELECT false, 'Invalid token format'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Find the invitation
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > now();
  
  IF invitation_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid or expired invitation'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if user already exists with this email
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE email = invitation_record.email
  ) INTO user_exists;
  
  IF user_exists THEN
    RETURN QUERY SELECT false, 'User already exists with this email'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Mark invitation as accepted
  UPDATE public.invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by = auth.uid()
  WHERE id = invitation_record.id;
  
  RETURN QUERY SELECT true, 'Invitation accepted successfully'::TEXT, invitation_record.clinic_id;
END;
$$;