-- Create helper to avoid recursion and single-row subquery issues in RLS
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.users WHERE id = _user_id LIMIT 1;
$$;

-- Replace policy to use the helper function instead of subquery on same table
DROP POLICY IF EXISTS "Clinic owners can manage team member status" ON public.users;

CREATE POLICY "Clinic owners can manage team member status"
ON public.users
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
  AND id <> auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
  AND id <> auth.uid()
  AND email = public.get_user_email(users.id)
);