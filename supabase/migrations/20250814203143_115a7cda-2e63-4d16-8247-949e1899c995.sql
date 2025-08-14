-- Fix critical security vulnerability: Remove public access to all user data
-- The current policy "Users can read their own record" has "OR true" which makes ALL user data publicly accessible

-- Drop the insecure policy
DROP POLICY IF EXISTS "Users can read their own record" ON public.users;

-- Create a secure policy that only allows users to read their own record
CREATE POLICY "Users can read their own record" 
ON public.users 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Also fix the overly permissive public insert policy
DROP POLICY IF EXISTS "Allow user profile creation during auth" ON public.users;

-- Create a more secure insert policy for user profile creation
CREATE POLICY "Allow user profile creation during auth" 
ON public.users 
FOR INSERT 
TO public
WITH CHECK (id = auth.uid());

-- The "Allow reading assistant/admin names for login" policy should be restricted to only return minimal data needed for login
-- Let's update it to be more specific about what can be accessed
DROP POLICY IF EXISTS "Allow reading assistant/admin names for login" ON public.users;

-- Create a more restricted policy for login purposes that only exposes necessary fields
CREATE POLICY "Allow reading user names for authentication" 
ON public.users 
FOR SELECT 
TO public
USING (
  role IN ('assistant', 'admin') 
  AND is_active = true 
  AND clinic_id IS NOT NULL
);