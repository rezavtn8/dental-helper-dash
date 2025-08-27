-- Add email tracking fields to invitations table
ALTER TABLE public.invitations 
ADD COLUMN email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN email_status TEXT DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed', 'delivered')),
ADD COLUMN resend_count INTEGER DEFAULT 0,
ADD COLUMN message_id TEXT DEFAULT NULL,
ADD COLUMN failure_reason TEXT DEFAULT NULL;

-- Add index for better performance
CREATE INDEX idx_invitations_email_status ON public.invitations(email_status);
CREATE INDEX idx_invitations_clinic_status ON public.invitations(clinic_id, status);