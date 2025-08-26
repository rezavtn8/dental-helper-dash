-- Clean up existing data for fresh testing
TRUNCATE TABLE public.tasks CASCADE;
TRUNCATE TABLE public.task_templates CASCADE;
TRUNCATE TABLE public.patient_logs CASCADE;
TRUNCATE TABLE public.user_sessions CASCADE;
TRUNCATE TABLE public.users CASCADE;
TRUNCATE TABLE public.clinics CASCADE;