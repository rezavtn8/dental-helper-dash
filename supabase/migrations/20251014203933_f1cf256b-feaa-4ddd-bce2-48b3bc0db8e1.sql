-- Add email tracking fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verification_token text,
ADD COLUMN IF NOT EXISTS verification_token_expires_at timestamp with time zone;

-- Create email logs table for tracking all email communications
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  resend_id text,
  error_message text,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_logs
CREATE POLICY "Users can view their own email logs" ON email_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners can view clinic email logs" ON email_logs
  FOR SELECT USING (
    clinic_id = get_current_user_clinic_id() 
    AND get_current_user_role() = 'owner'
  );

CREATE POLICY "System can insert email logs" ON email_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update email logs" ON email_logs
  FOR UPDATE USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_clinic_id ON email_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Add comment for documentation
COMMENT ON TABLE email_logs IS 'Tracks all email communications sent through the platform';