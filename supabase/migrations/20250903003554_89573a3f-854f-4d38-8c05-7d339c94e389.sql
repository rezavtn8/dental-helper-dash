-- Fix RLS policy to allow owners to see join request user data
-- Add a new policy that allows owners to view user profiles for pending join requests

CREATE POLICY "Owners can view users with pending join requests" ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.join_requests jr
    JOIN public.clinics c ON jr.clinic_id = c.id
    JOIN public.users owner ON owner.clinic_id = c.id
    WHERE jr.user_id = users.id
      AND jr.status = 'pending'
      AND owner.id = auth.uid()
      AND owner.role = 'owner'
  )
);