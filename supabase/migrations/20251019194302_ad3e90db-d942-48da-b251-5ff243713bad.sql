-- Allow users to view basic clinic info for their join requests
CREATE POLICY "Users can view clinic info for join requests"
ON public.clinics
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT clinic_id 
    FROM public.join_requests 
    WHERE user_id = auth.uid()
  )
);