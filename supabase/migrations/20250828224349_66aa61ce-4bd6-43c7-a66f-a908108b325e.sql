-- Phase 1: Make clinic_id nullable to allow assistants to create profiles before accepting invitations
ALTER TABLE public.users ALTER COLUMN clinic_id DROP NOT NULL;

-- Update the default value to be NULL instead of gen_random_uuid()
ALTER TABLE public.users ALTER COLUMN clinic_id DROP DEFAULT;

-- Add an index for better performance when looking up users by clinic_id
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON public.users(clinic_id) WHERE clinic_id IS NOT NULL;