
-- Re-add the RLS policy that allows owners to view users with pending join requests
DROP POLICY IF EXISTS "Owners can view users with pending join requests" ON public.users;

CREATE POLICY "Owners can view users with pending join requests"
ON public.users
FOR SELECT
USING (public.can_owner_view_user(id));
