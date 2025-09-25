-- Create error_logs table
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message TEXT NOT NULL,
  user_message TEXT,
  severity TEXT NOT NULL DEFAULT 'error',
  category TEXT,
  error_code TEXT,
  user_id UUID,
  clinic_id UUID,
  component TEXT,
  action TEXT,
  context JSONB,
  stack_trace TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  environment TEXT DEFAULT 'production'
);

-- Enable RLS on error_logs table
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own error logs
CREATE POLICY "Users can view their own error logs"
ON public.error_logs
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Owners can view all error logs in their clinic
CREATE POLICY "Owners can view clinic error logs"
ON public.error_logs
FOR SELECT
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

-- Policy: System can insert error logs
CREATE POLICY "System can insert error logs"
ON public.error_logs
FOR INSERT
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_clinic_id ON public.error_logs(clinic_id);
CREATE INDEX idx_error_logs_timestamp ON public.error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);

-- Add foreign key constraints (optional, as these are nullable)
-- ALTER TABLE public.error_logs ADD CONSTRAINT fk_error_logs_user_id 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create function to get current user clinic ID if not exists
CREATE OR REPLACE FUNCTION public.get_current_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to get current user role if not exists
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;