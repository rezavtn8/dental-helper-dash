-- Fix the invitations table trigger issue
-- First, add the missing updated_at column to invitations table
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or replace the trigger function to handle updated_at properly
CREATE OR REPLACE FUNCTION public.update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_invitations_updated_at ON public.invitations;
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invitations_updated_at();

-- Update existing invitations to have updated_at = created_at for consistency
UPDATE public.invitations 
SET updated_at = created_at 
WHERE updated_at IS NULL;