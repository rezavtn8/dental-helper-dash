-- Create notification preferences table for users
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  task_reminders BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT true,
  system_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create notifications log table
CREATE TABLE public.notifications_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivery_status TEXT DEFAULT 'pending',
  email_id TEXT,
  error_message TEXT
);

-- Enable RLS  
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notification logs"
ON public.notifications_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification logs"
ON public.notifications_log
FOR INSERT
WITH CHECK (true);

-- Create password reset attempts table for security
CREATE TABLE public.password_reset_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy (only system can manage)
CREATE POLICY "System manages password reset attempts"
ON public.password_reset_attempts
FOR ALL
USING (false)
WITH CHECK (false);

-- Create function to track password reset attempts
CREATE OR REPLACE FUNCTION public.log_password_reset_attempt(
  p_email TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.password_reset_attempts (email, ip_address, attempted_at, success)
  VALUES (p_email, p_ip_address::inet, now(), p_success);
END;
$$;

-- Create function to check password reset rate limiting
CREATE OR REPLACE FUNCTION public.check_password_reset_rate_limit(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Check attempts in the last hour
  SELECT COUNT(*) INTO attempt_count
  FROM public.password_reset_attempts
  WHERE email = p_email 
    AND attempted_at > (now() - interval '1 hour');
  
  -- Allow max 3 attempts per hour
  RETURN attempt_count < 3;
END;
$$;

-- Create trigger to update notification preferences updated_at
CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_preferences_updated_at();