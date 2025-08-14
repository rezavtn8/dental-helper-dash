-- Fix critical security vulnerability: Remove public access to employee personal information
-- The current policy "Allow reading user names for authentication" exposes employee data to the public

-- Drop the insecure policy that allows public access to user data
DROP POLICY IF EXISTS "Allow reading user names for authentication" ON public.users;

-- Create a secure policy that only allows authenticated users in the same clinic to view user data
CREATE POLICY "Authenticated users can view clinic members" 
ON public.users 
FOR SELECT 
TO authenticated
USING (clinic_id = get_current_user_clinic_id());

-- For login functionality, we'll need to handle user discovery through a different approach
-- The clinic login should work through clinic codes, not by exposing user lists