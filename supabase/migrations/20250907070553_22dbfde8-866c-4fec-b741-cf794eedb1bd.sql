-- Enable real-time for tasks table
ALTER TABLE public.tasks REPLICA IDENTITY FULL;

-- Add tasks table to realtime publication  
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.tasks;