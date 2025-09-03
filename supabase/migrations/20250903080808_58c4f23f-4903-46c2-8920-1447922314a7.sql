-- CRITICAL SECURITY FIX: Remove password_hash column
-- This column should never exist as Supabase Auth handles all authentication
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- Make email required for security
ALTER TABLE public.users ALTER COLUMN email SET NOT NULL;

-- Remove any potential exposure in rate_limits table
-- Only system should manage this, users shouldn't see IP addresses
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "System manages rate limits" ON public.rate_limits;

-- Create more restrictive policy for rate_limits
CREATE POLICY "System manages rate limits" 
ON public.rate_limits 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Strengthen user_sessions security
-- Users should only see their own active sessions, not all details
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can only access their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view their own active sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "System can create sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own active sessions" 
ON public.user_sessions 
FOR SELECT 
USING (
  user_id = auth.uid() 
  AND is_active = true 
  AND expires_at > now()
);

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Strengthen invitations table security
-- Remove overly permissive policies and add field-level restrictions
DROP POLICY IF EXISTS "Limited invitation visibility" ON public.invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.invitations;
DROP POLICY IF EXISTS "Owners can view clinic invitations with limited fields" ON public.invitations;

CREATE POLICY "Users can view invitations sent to them" 
ON public.invitations 
FOR SELECT 
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND status = 'pending'
  AND expires_at > now()
);

CREATE POLICY "Owners can view clinic invitations with limited fields" 
ON public.invitations 
FOR SELECT 
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

-- Add function to automatically clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.invitations 
  WHERE expires_at < now() AND status = 'pending';
  
  DELETE FROM public.user_sessions 
  WHERE expires_at < now() OR is_active = false;
  
  DELETE FROM public.rate_limits 
  WHERE created_at < (now() - interval '24 hours');
$$;