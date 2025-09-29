-- Fix broken RLS policies that cause "more than one row returned" errors

-- Drop the broken policy
DROP POLICY IF EXISTS "Clinic owners can manage team member status" ON public.users;

-- Recreate it correctly - owners can update team members but cannot change their email
CREATE POLICY "Clinic owners can manage team member status"
ON public.users
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
  AND id <> auth.uid() -- Can't update own record via this policy
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
  AND id <> auth.uid()
  -- Email should not be changed by this policy
  AND email = (SELECT email FROM public.users WHERE id = users.id LIMIT 1)
);

-- Ensure the user_roles policies are clean
DROP POLICY IF EXISTS "Owners can manage roles in their clinic" ON public.user_roles;

CREATE POLICY "Owners can manage roles in their clinic"
ON public.user_roles
FOR ALL
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);