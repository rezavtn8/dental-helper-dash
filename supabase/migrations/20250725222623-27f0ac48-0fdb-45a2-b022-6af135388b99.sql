-- Fix user profile creation during signup
-- Add policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile during signup"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());