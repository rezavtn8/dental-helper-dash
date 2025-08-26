-- Clean up all existing data for fresh start
DELETE FROM user_sessions;
DELETE FROM patient_logs;  
DELETE FROM tasks;
DELETE FROM task_templates;
DELETE FROM users;
DELETE FROM clinics;

-- Reset sequences if any
-- This ensures we start with a clean slate for testing