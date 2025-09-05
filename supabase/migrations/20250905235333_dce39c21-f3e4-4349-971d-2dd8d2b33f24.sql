-- First, let's see what recurrence values exist and fix them
-- Update any invalid recurrence values to valid ones
UPDATE public.task_templates 
SET recurrence = CASE 
  WHEN recurrence IS NULL OR recurrence = '' THEN 'once'
  WHEN recurrence = 'none' THEN 'once'
  WHEN recurrence NOT IN ('daily', 'weekly', 'biweekly', 'monthly', 'once') THEN 'once'
  ELSE recurrence
END;

-- Now add the constraint
ALTER TABLE public.task_templates 
ADD CONSTRAINT valid_recurrence CHECK (recurrence IN ('daily', 'weekly', 'biweekly', 'monthly', 'once'));

-- Add the new fields for template scheduling
ALTER TABLE public.task_templates 
ADD COLUMN IF NOT EXISTS start_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS is_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_generated_date date,
ADD COLUMN IF NOT EXISTS next_generation_date date;

-- Add template tracking to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.task_templates(id),
ADD COLUMN IF NOT EXISTS generated_date date DEFAULT CURRENT_DATE;