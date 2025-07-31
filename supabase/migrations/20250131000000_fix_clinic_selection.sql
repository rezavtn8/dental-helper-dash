-- Fix clinic selection issue by removing hardcoded sample data
-- This migration cleans up the database to allow proper clinic selection

-- Remove hardcoded sample clinic data that was forcing all users to the same clinic
DELETE FROM public.clinics 
WHERE name = 'Sample Medical Clinic' 
   OR name ILIKE '%sample%' 
   OR email = 'admin@sampleclinic.com';

-- Remove any orphaned user references to deleted clinics
UPDATE public.users 
SET clinic_id = NULL 
WHERE clinic_id NOT IN (SELECT id FROM public.clinics);

-- Ensure clinic codes are properly generated and unique
UPDATE public.clinics 
SET clinic_code = LOWER(REPLACE(name, ' ', '')) || LPAD(id::text, 4, '0')
WHERE clinic_code IS NULL OR clinic_code = '';

-- Add unique constraint on clinic_code if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'clinics_clinic_code_key' 
        AND table_name = 'clinics'
    ) THEN
        ALTER TABLE public.clinics ADD CONSTRAINT clinics_clinic_code_key UNIQUE (clinic_code);
    END IF;
END $$;

-- Ensure is_active defaults to true for existing clinics
UPDATE public.clinics 
SET is_active = true 
WHERE is_active IS NULL;

-- Add comment explaining the fix
COMMENT ON TABLE public.clinics IS 'Clinics table - cleaned up to allow proper clinic selection by unique codes';
