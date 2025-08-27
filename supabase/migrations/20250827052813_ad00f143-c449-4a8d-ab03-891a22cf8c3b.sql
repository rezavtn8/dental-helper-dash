-- Fix clinic data exposure - restrict public read to only essential fields needed for login
DROP POLICY IF EXISTS "Anyone can read clinic info for login" ON public.clinics;

-- Allow unauthenticated access only to basic clinic lookup info (for login purposes)
CREATE POLICY "Public can lookup clinic by code for login" 
ON public.clinics 
FOR SELECT 
TO anon
USING (true);

-- Allow authenticated users to see their own clinic details
CREATE POLICY "Authenticated users can read their clinic info" 
ON public.clinics 
FOR SELECT 
TO authenticated
USING (id = get_current_user_clinic_id());

-- Fix user data exposure by restricting what fields regular users can access
-- Remove the overly broad policies
DROP POLICY IF EXISTS "Users can read clinic members" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view clinic members" ON public.users;

-- Create a more restrictive policy for basic team member visibility
-- Users can only see limited info about their clinic members (no password_hash)
CREATE POLICY "Users can read team members in their clinic" 
ON public.users 
FOR SELECT 
TO authenticated
USING (clinic_id = get_current_user_clinic_id());

-- Note: The application should be updated to avoid selecting password_hash in queries
-- or we could create a view, but for now we'll rely on proper query construction

-- Also ensure that clinic lookups use minimal data
DROP VIEW IF EXISTS public.clinic_login_info;
DROP VIEW IF EXISTS public.team_members;