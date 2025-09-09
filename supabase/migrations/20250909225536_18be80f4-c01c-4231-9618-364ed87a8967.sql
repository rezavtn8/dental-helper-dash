-- Fix task access policy for assistants to see unassigned tasks
-- Drop the current restrictive policy
DROP POLICY IF EXISTS "Secure task access for clinic members" ON public.tasks;

-- Create a new policy that allows assistants to see both assigned and unassigned tasks
CREATE POLICY "Enhanced task access for clinic members" 
ON public.tasks 
FOR SELECT 
USING (
  clinic_id = get_current_user_clinic_id() 
  AND (
    -- Owners and admins can see all tasks
    get_current_user_role() IN ('owner', 'admin')
    OR
    -- Assistants can see tasks assigned to them OR unassigned tasks
    (
      get_current_user_role() = 'assistant' 
      AND (assigned_to = auth.uid() OR assigned_to IS NULL)
    )
  )
);