-- Fix RLS policy for task updates to handle both assigned_to and claimed_by
DROP POLICY IF EXISTS "Assistants can update their tasks and claim unassigned" ON public.tasks;

CREATE POLICY "Assistants can update their tasks and claim unassigned" ON public.tasks
  FOR UPDATE
  USING (
    (clinic_id = get_current_user_clinic_id()) 
    AND (get_current_user_role() = 'assistant'::text) 
    AND ((assigned_to = auth.uid()) OR (assigned_to IS NULL) OR (claimed_by = auth.uid()))
  )
  WITH CHECK (
    (clinic_id = get_current_user_clinic_id()) 
    AND (get_current_user_role() = 'assistant'::text) 
    AND ((assigned_to = auth.uid()) OR (claimed_by = auth.uid()) OR (assigned_to IS NULL AND claimed_by IS NULL))
  );