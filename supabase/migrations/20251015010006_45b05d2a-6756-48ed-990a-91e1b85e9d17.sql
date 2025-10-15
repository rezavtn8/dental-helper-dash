-- Add a field to track clinic membership status
-- This allows us to remove users from a clinic while keeping them visible in the team list

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS clinic_membership_status text DEFAULT 'active' 
CHECK (clinic_membership_status IN ('active', 'removed'));

-- Update existing users to have active status
UPDATE public.users 
SET clinic_membership_status = 'active' 
WHERE clinic_id IS NOT NULL AND clinic_membership_status IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_clinic_membership 
ON public.users(clinic_id, clinic_membership_status);