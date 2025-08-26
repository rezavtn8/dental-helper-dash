-- Phase 1: Fix Database Schema Issues
-- Fix tasks table schema problems

-- Remove duplicate due_type column (keep the hyphenated one)
ALTER TABLE public.tasks DROP COLUMN IF EXISTS due_type;

-- Fix problematic UUID defaults - these should be nullable, not gen_random_uuid()
ALTER TABLE public.tasks ALTER COLUMN assigned_to DROP DEFAULT;
ALTER TABLE public.tasks ALTER COLUMN created_by DROP DEFAULT;
ALTER TABLE public.tasks ALTER COLUMN clinic_id DROP DEFAULT;

-- Ensure clinic_id is NOT NULL and properly constrained
ALTER TABLE public.tasks ALTER COLUMN clinic_id SET NOT NULL;

-- Add proper created_at default if missing
ALTER TABLE public.tasks ALTER COLUMN created_at SET DEFAULT now();

-- Ensure proper status default
ALTER TABLE public.tasks ALTER COLUMN status SET DEFAULT 'To Do';

-- Clean up any existing bad data (tasks without clinic_id)
DELETE FROM public.tasks WHERE clinic_id IS NULL;

-- Update RLS policies to be more explicit and fix any issues
DROP POLICY IF EXISTS "Users can read tasks in their clinic" ON public.tasks;
DROP POLICY IF EXISTS "Owners can manage all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Assistants can read all clinic tasks" ON public.tasks;
DROP POLICY IF EXISTS "Assistants can update assigned tasks" ON public.tasks;

-- Recreate RLS policies with clearer logic
CREATE POLICY "Clinic members can read tasks"
ON public.tasks FOR SELECT
USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Owners can manage all clinic tasks"
ON public.tasks FOR ALL
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

CREATE POLICY "Assistants can update their assigned tasks"
ON public.tasks FOR UPDATE
USING (
  clinic_id = get_current_user_clinic_id()
  AND assigned_to = auth.uid()
  AND get_current_user_role() = 'assistant'
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id()
  AND assigned_to = auth.uid()
  AND get_current_user_role() = 'assistant'
);