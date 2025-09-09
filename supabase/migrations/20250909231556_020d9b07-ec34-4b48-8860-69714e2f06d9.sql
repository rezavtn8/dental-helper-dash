-- Add claimed_by field to tasks table to track user-claimed tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id);

-- Add index for better performance on claimed_by queries
CREATE INDEX IF NOT EXISTS idx_tasks_claimed_by ON public.tasks(claimed_by);