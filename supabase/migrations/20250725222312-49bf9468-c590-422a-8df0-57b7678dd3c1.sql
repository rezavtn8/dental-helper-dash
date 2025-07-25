-- Fix clinic creation by allowing initial clinic setup
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Clinic owners can manage their clinic" ON public.clinics;

-- Create new policies that allow clinic creation during setup
CREATE POLICY "Anyone can create clinics during setup"
ON public.clinics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow owners to manage their clinic after creation
CREATE POLICY "Clinic owners can manage their clinic"
ON public.clinics
FOR ALL
TO authenticated
USING (id IN (
  SELECT users.clinic_id
  FROM users
  WHERE users.id = auth.uid() AND users.role = 'owner'
));

-- Allow reading clinic info for login purposes
CREATE POLICY "Anyone can read clinic info for login"
ON public.clinics
FOR SELECT
TO anon, authenticated
USING (true);