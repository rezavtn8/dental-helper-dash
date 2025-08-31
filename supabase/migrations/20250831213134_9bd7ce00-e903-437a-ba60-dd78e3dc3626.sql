-- Add missing foreign key constraint to users table for clinic_id
ALTER TABLE public.users 
ADD CONSTRAINT users_clinic_id_fkey 
FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE SET NULL;