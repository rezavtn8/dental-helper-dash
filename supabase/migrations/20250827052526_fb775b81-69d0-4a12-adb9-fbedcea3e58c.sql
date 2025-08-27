-- Add unique constraint on patient_logs (assistant_id, date)
-- This prevents duplicate patient log entries for the same assistant on the same date
ALTER TABLE public.patient_logs 
ADD CONSTRAINT unique_assistant_date UNIQUE (assistant_id, date);

-- Ensure tasks.status uses the enum properly and has correct default
-- The task_status enum already exists, so we just need to ensure the constraint
-- and default are properly set
ALTER TABLE public.tasks 
ALTER COLUMN status SET DEFAULT 'pending'::task_status;

-- Clean up any potentially invalid status values (migrate to pending if invalid)
UPDATE public.tasks 
SET status = 'pending'::task_status 
WHERE status NOT IN ('pending', 'in-progress', 'completed');

-- Add indexes for better performance on clinic_id queries
CREATE INDEX IF NOT EXISTS idx_tasks_clinic_id ON public.tasks(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_logs_clinic_id ON public.patient_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON public.users(clinic_id);

-- Ensure all critical tables have proper clinic_id not null constraints where needed
-- (patient_logs and tasks should always have clinic_id)
ALTER TABLE public.patient_logs 
ALTER COLUMN clinic_id SET NOT NULL;