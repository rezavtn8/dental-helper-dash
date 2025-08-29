-- Add action_link column to invitations table for storing Supabase action links
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS action_link TEXT;

-- Add index for better performance on action_link lookups
CREATE INDEX IF NOT EXISTS idx_invitations_action_link ON public.invitations(action_link);

-- Update existing pending invitations to have a default expires_at if null
UPDATE public.invitations 
SET expires_at = created_at + INTERVAL '7 days' 
WHERE expires_at IS NULL AND status = 'pending';

-- Add constraint to ensure expires_at is not null for new records
ALTER TABLE public.invitations 
ALTER COLUMN expires_at SET NOT NULL;