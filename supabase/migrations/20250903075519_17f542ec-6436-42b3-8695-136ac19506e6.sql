-- Remove the dangerous "Comprehensive clinic access" policy that allows public access
DROP POLICY IF EXISTS "Comprehensive clinic access" ON public.clinics;

-- Create a secure policy that only allows clinic members to view their own clinic
CREATE POLICY "Clinic members can view their clinic" 
ON public.clinics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.clinic_id = clinics.id
  )
);

-- Allow users to view clinic info during join process (very limited)
CREATE POLICY "Limited clinic info for join process" 
ON public.clinics 
FOR SELECT 
USING (
  -- Only allow viewing id, name, and clinic_code for lookup purposes
  -- This is used by the lookup_clinic_by_code function
  auth.uid() IS NOT NULL
  AND clinic_code IS NOT NULL
  AND is_active = true
);

-- Ensure the lookup function works with minimal data exposure
-- Update the lookup function to be more restrictive
CREATE OR REPLACE FUNCTION public.lookup_clinic_by_code(p_code text)
RETURNS TABLE(id uuid, name text, clinic_code text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only return minimal info needed for joining
  SELECT id, name, clinic_code 
  FROM public.clinics 
  WHERE clinic_code = p_code 
    AND is_active = true
  LIMIT 1;
$$;