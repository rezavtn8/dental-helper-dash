-- Fix infinite recursion in users table policies
-- First, drop the problematic policy
DROP POLICY IF EXISTS "Owners can read users in their clinic" ON public.users;

-- Allow anonymous users to read assistant names for login dropdown
CREATE POLICY "Anonymous can read assistant names for login" 
ON public.users 
FOR SELECT 
TO anon
USING (role = 'assistant');

-- Allow authenticated owners to read assistants in their clinic
-- We need to avoid self-referencing the users table
CREATE POLICY "Owners can read assistants in their clinic" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  role = 'assistant' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

-- Allow users to read their own record
CREATE POLICY "Users can read their own record" 
ON public.users 
FOR SELECT 
TO authenticated
USING (id = auth.uid());