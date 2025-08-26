-- Add PIN field to users table for assistant authentication
ALTER TABLE public.users ADD COLUMN pin TEXT;

-- Add index for PIN lookups
CREATE INDEX idx_users_pin ON public.users(pin) WHERE pin IS NOT NULL;

-- Create function to authenticate assistant with PIN
CREATE OR REPLACE FUNCTION public.authenticate_assistant(
  p_clinic_id UUID,
  p_first_name TEXT,
  p_pin TEXT
)
RETURNS TABLE(user_id UUID, user_name TEXT, user_email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email
  FROM public.users u
  WHERE 
    u.clinic_id = p_clinic_id
    AND u.role = 'assistant'
    AND u.is_active = true
    AND LOWER(TRIM(split_part(u.name, ' ', 1))) = LOWER(TRIM(p_first_name))
    AND u.pin = p_pin;
END;
$$;