-- Add DELETE policy for clinic owners to remove team members
-- This allows owners to permanently remove users from their clinic

DROP POLICY IF EXISTS "Clinic owners can delete team members" ON public.users;

CREATE POLICY "Clinic owners can delete team members"
ON public.users
FOR DELETE
USING (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
  AND id <> auth.uid() -- Cannot delete themselves
);