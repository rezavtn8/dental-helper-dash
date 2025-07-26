-- Add columns to track task completion details
ALTER TABLE public.tasks 
ADD COLUMN completed_by uuid REFERENCES auth.users(id),
ADD COLUMN completed_at timestamp with time zone;