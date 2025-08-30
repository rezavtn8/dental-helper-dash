-- Clean up all user-related data and reset database to fresh state

-- First delete all dependent data (in order to avoid foreign key constraints)
DELETE FROM public.task_notes;
DELETE FROM public.patient_logs;
DELETE FROM public.tasks;
DELETE FROM public.task_templates;
DELETE FROM public.invitations;
DELETE FROM public.user_sessions;
DELETE FROM public.rate_limits;
DELETE FROM public.audit_log;

-- Delete user profiles
DELETE FROM public.users;

-- Delete all clinics
DELETE FROM public.clinics;

-- Clean up auth.users table (this removes all authentication records)
-- Note: This requires elevated privileges and will log out all users
DELETE FROM auth.users;

-- Reset any sequences if needed
-- This ensures auto-generated values start fresh
ALTER SEQUENCE IF EXISTS auth.users_id_seq RESTART WITH 1;

-- Log the cleanup operation with proper JSONB casting
INSERT INTO public.audit_log (table_name, operation, new_values, timestamp)
VALUES ('database_cleanup', 'reset_all_data', '{"action": "complete_reset"}'::jsonb, now());