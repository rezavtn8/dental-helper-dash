-- Align task_templates and tasks table structures for full compatibility

-- Add missing fields to task_templates table
ALTER TABLE public.task_templates 
ADD COLUMN IF NOT EXISTS priority text,
ADD COLUMN IF NOT EXISTS attachments jsonb;

-- Fix timestamp consistency - make task_templates created_at match tasks format
ALTER TABLE public.tasks 
ALTER COLUMN created_at TYPE timestamp with time zone USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN "due-date" TYPE timestamp with time zone USING "due-date" AT TIME ZONE 'UTC';

-- Add indexes for better performance on frequently queried fields
CREATE INDEX IF NOT EXISTS idx_task_templates_priority ON public.task_templates(priority);
CREATE INDEX IF NOT EXISTS idx_task_templates_specialty ON public.task_templates(specialty);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

-- Update the task_templates table to have default values that match tasks table expectations
ALTER TABLE public.task_templates 
ALTER COLUMN priority SET DEFAULT 'medium';

-- Ensure both tables have consistent NOT NULL constraints where needed
ALTER TABLE public.task_templates 
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN updated_at SET NOT NULL;