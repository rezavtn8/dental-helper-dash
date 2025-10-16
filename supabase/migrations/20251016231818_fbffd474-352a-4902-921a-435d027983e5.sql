-- Fix 1: Create RPC function for server-side role verification
-- This prevents client-side role manipulation

CREATE OR REPLACE FUNCTION public.verify_user_has_role(required_role text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_role boolean;
  user_clinic uuid;
BEGIN
  -- Check if user has the required role
  SELECT EXISTS(
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = required_role
    UNION
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = required_role 
      AND is_active = true
  ) INTO has_role;
  
  -- Get user's clinic
  SELECT clinic_id INTO user_clinic
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN json_build_object(
    'hasRole', has_role,
    'userId', auth.uid(),
    'clinicId', user_clinic
  );
END;
$$;

-- Fix 2: Restrict email visibility in users table to prevent harvesting
-- Create a secure function to get team members without emails for regular users
CREATE OR REPLACE FUNCTION public.get_team_members_no_email()
RETURNS TABLE(
  id uuid,
  name text,
  role text,
  is_active boolean,
  created_at timestamp with time zone,
  last_login timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.name,
    u.role,
    u.is_active,
    u.created_at,
    u.last_login
  FROM public.users u
  WHERE u.clinic_id = get_current_user_clinic_id()
    AND u.is_active = true
  ORDER BY u.created_at DESC;
$$;

-- Update the existing secure user profile function to only show emails to owners
CREATE OR REPLACE FUNCTION public.get_user_profile_with_email(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  role text,
  is_active boolean,
  created_at timestamp with time zone,
  last_login timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only owners can see emails
  SELECT 
    u.id,
    u.name,
    CASE 
      WHEN get_current_user_role() = 'owner' THEN u.email
      ELSE NULL
    END as email,
    u.role,
    u.is_active,
    u.created_at,
    u.last_login
  FROM public.users u
  WHERE u.id = target_user_id
    AND u.clinic_id = get_current_user_clinic_id()
  LIMIT 1;
$$;