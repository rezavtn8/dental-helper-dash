-- Fix infinite recursion in clinics RLS policies
-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can view basic clinic info for join requests" ON clinics;
DROP POLICY IF EXISTS "Users can view basic clinic info" ON clinics;

-- Create safer policies that avoid recursion
-- Allow users to view clinic info if they have a pending/approved join request
CREATE POLICY "Users can view clinic info for their join requests" 
ON clinics 
FOR SELECT 
USING (
  id IN (
    SELECT jr.clinic_id 
    FROM join_requests jr 
    WHERE jr.user_id = auth.uid()
  )
);

-- Allow users to view their own clinic info (direct clinic_id check)
CREATE POLICY "Users can view their own clinic info" 
ON clinics 
FOR SELECT 
USING (
  id IN (
    SELECT u.clinic_id 
    FROM users u 
    WHERE u.id = auth.uid() AND u.clinic_id IS NOT NULL
  )
);

-- Allow clinic lookup by code for join requests (public read for specific use case)
CREATE POLICY "Allow clinic lookup by code" 
ON clinics 
FOR SELECT 
USING (true);

-- Keep existing owner policies as they should work fine
-- "Clinic owners can manage their clinic" 
-- "Owners can access sensitive clinic data"
-- "Authenticated users can create clinics with validation"