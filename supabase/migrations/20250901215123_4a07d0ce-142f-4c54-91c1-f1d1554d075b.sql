-- Add unique constraint to patient_logs table to enable proper upsert functionality
ALTER TABLE public.patient_logs 
ADD CONSTRAINT unique_assistant_date_clinic 
UNIQUE (assistant_id, date, clinic_id);