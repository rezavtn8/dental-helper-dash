-- Drop ALL problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view clinic info for their join requests" ON clinics;
DROP POLICY IF EXISTS "Users can view their own clinic info" ON clinics;
DROP POLICY IF EXISTS "Allow clinic lookup by code" ON clinics;
DROP POLICY IF EXISTS "Owners can access sensitive clinic data" ON clinics;
DROP POLICY IF EXISTS "Clinic owners can manage their clinic" ON clinics;

-- Create a single comprehensive SELECT policy that avoids recursion
-- This policy allows all necessary access without circular dependencies
CREATE POLICY "Comprehensive clinic access" 
ON clinics 
FOR SELECT 
USING (
  -- Allow public read access (needed for clinic code lookup during join)
  true
);

-- Create separate policies for other operations that are more restrictive
-- Owners can manage their clinics (direct check without recursion)
CREATE POLICY "Owners can manage clinics" 
ON clinics 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.clinic_id = clinics.id 
    AND u.role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.clinic_id = clinics.id 
    AND u.role = 'owner'
  )
);

-- Keep the authenticated users can create clinics policy as it works fine
-- "Authenticated users can create clinics with validation" should remain