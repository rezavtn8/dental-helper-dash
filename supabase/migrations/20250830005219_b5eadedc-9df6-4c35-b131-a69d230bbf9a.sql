-- Clear all existing data from all tables
DELETE FROM public.task_notes;
DELETE FROM public.tasks;
DELETE FROM public.patient_logs;
DELETE FROM public.task_templates;
DELETE FROM public.invitations;
DELETE FROM public.users;
DELETE FROM public.clinics;
DELETE FROM public.user_sessions;
DELETE FROM public.audit_log;
DELETE FROM public.rate_limits;

-- Clear auth users (this will cascade and remove all authentication data)
DELETE FROM auth.users;