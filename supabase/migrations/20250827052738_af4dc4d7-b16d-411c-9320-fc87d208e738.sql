-- Fix clinic data exposure - restrict public read to only essential fields
DROP POLICY IF EXISTS "Anyone can read clinic info for login" ON public.clinics;

-- Create a more restrictive policy for public clinic access
CREATE POLICY "Public can read clinic basic info for login" 
ON public.clinics 
FOR SELECT 
USING (true);

-- But we need to be careful here - let's create a view for public clinic data instead
CREATE OR REPLACE VIEW public.clinic_login_info AS 
SELECT 
  id,
  name,
  clinic_code,
  is_active
FROM public.clinics 
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.clinic_login_info TO authenticated, anon;

-- Now restrict the full clinics table access
DROP POLICY IF EXISTS "Public can read clinic basic info for login" ON public.clinics;

CREATE POLICY "Authenticated users can read clinic info for their clinic" 
ON public.clinics 
FOR SELECT 
TO authenticated
USING (id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- Fix user data exposure - remove password_hash from broad access and restrict personal data
-- First, let's update the existing policies to be more restrictive

-- Remove the broad clinic members read policy
DROP POLICY IF EXISTS "Users can read clinic members" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view clinic members" ON public.users;

-- Create a more restrictive view for team member info (without sensitive data)
CREATE OR REPLACE VIEW public.team_members AS 
SELECT 
  id,
  name,
  email,
  role,
  is_active,
  created_at,
  last_login,
  clinic_id,
  created_by
FROM public.users 
WHERE is_active = true;

-- Grant access to the view for clinic members
GRANT SELECT ON public.team_members TO authenticated;

-- Create RLS policy for the view
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members in their clinic" 
ON public.team_members 
FOR SELECT 
TO authenticated
USING (clinic_id = (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- Keep the existing policies for owners and admins who need full access
-- But add a policy for regular users to see basic team info
CREATE POLICY "Users can read basic team member info in clinic" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  clinic_id = (SELECT clinic_id FROM public.users WHERE id = auth.uid()) 
  AND (
    -- User can see their own record completely
    id = auth.uid() 
    OR 
    -- Or can see limited info about team members (handled by allowing SELECT but the app should use the view)
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('owner', 'admin')
  )
);