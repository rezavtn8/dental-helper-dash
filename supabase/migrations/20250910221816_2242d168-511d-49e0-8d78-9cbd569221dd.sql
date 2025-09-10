-- Fix RLS policy to allow assistants to claim unassigned tasks and update their own tasks
DROP POLICY IF EXISTS "Assistants can update their assigned tasks" ON public.tasks;

-- New policy that allows assistants to:
-- 1. Update tasks already assigned to them
-- 2. Claim unassigned tasks (where assigned_to IS NULL)
CREATE POLICY "Assistants can update their tasks and claim unassigned" 
ON public.tasks 
FOR UPDATE 
USING (
  (clinic_id = get_current_user_clinic_id()) 
  AND (get_current_user_role() = 'assistant'::text)
  AND (assigned_to = auth.uid() OR assigned_to IS NULL)
)
WITH CHECK (
  (clinic_id = get_current_user_clinic_id()) 
  AND (get_current_user_role() = 'assistant'::text)
  AND (assigned_to = auth.uid())
);