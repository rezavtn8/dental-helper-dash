-- Fix infinite recursion: join_requests policies reference clinics, 
-- and clinics policies reference join_requests, causing a loop.
-- Replace the clinics subquery in join_requests with the SECURITY DEFINER helper function.

DROP POLICY IF EXISTS "Owners can view join requests for their clinics" ON public.join_requests;
DROP POLICY IF EXISTS "Owners can update join requests for their clinics" ON public.join_requests;

CREATE POLICY "Owners can view join requests for their clinics" 
ON public.join_requests FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

CREATE POLICY "Owners can update join requests for their clinics" 
ON public.join_requests FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);