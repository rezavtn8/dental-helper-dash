-- Create RLS policy to allow users to see basic clinic info for join request validation
CREATE POLICY "Users can view basic clinic info for join requests" 
ON public.clinics 
FOR SELECT 
USING (
  -- Allow if user has a pending join request for this clinic
  EXISTS (
    SELECT 1 FROM public.join_requests jr 
    WHERE jr.clinic_id = clinics.id 
      AND jr.user_id = auth.uid() 
      AND jr.status = 'pending'
  )
);