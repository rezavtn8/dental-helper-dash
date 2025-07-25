-- Add clinic code and domain fields to clinics table
ALTER TABLE public.clinics 
ADD COLUMN clinic_code TEXT UNIQUE,
ADD COLUMN domain_slug TEXT,
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN subscription_status TEXT DEFAULT 'active';

-- Create unique index on clinic_code
CREATE UNIQUE INDEX idx_clinics_clinic_code ON public.clinics(clinic_code);

-- Add PIN and session fields to users table
ALTER TABLE public.users 
ADD COLUMN pin TEXT,
ADD COLUMN pin_attempts INTEGER DEFAULT 0,
ADD COLUMN pin_locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN display_order INTEGER DEFAULT 0,
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Create user_sessions table for persistent sessions
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
CREATE POLICY "Users can manage their own sessions" 
ON public.user_sessions 
FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Owners can view sessions in their clinic" 
ON public.user_sessions 
FOR SELECT 
USING (clinic_id = (
  SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'owner'
));

-- Update existing clinics with clinic codes (temporary for migration)
UPDATE public.clinics 
SET clinic_code = LOWER(REPLACE(name, ' ', '')) || substring(id::text, 1, 6)
WHERE clinic_code IS NULL;

-- Add constraints
ALTER TABLE public.clinics 
ALTER COLUMN clinic_code SET NOT NULL;

-- Create index on user sessions
CREATE INDEX idx_user_sessions_user_clinic ON public.user_sessions(user_id, clinic_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);