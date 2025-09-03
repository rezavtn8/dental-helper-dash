-- Remove the problematic policy first
DROP POLICY IF EXISTS "Owners can view users with pending join requests" ON public.users;

-- Create a security definer function to check if a user can be viewed by current owner
CREATE OR REPLACE FUNCTION public.can_owner_view_user(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.join_requests jr
    JOIN public.clinics c ON jr.clinic_id = c.id
    JOIN public.users owner ON owner.clinic_id = c.id
    WHERE jr.user_id = target_user_id
      AND jr.status = 'pending'
      AND owner.id = auth.uid()
      AND owner.role = 'owner'
  );
$$;

-- Create the policy using the security definer function
CREATE POLICY "Owners can view users with pending join requests" ON public.users
FOR SELECT
USING (public.can_owner_view_user(id));