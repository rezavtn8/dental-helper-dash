-- Fix helper functions to handle multiple roles properly
-- These functions are used throughout RLS policies

-- Get current user's primary role (from users table)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.users 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Get current user's clinic_id
CREATE OR REPLACE FUNCTION public.get_current_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id 
  FROM public.users 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Check if user has a specific role (checks both users table and user_roles table)
CREATE OR REPLACE FUNCTION public.user_has_role_check(check_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    -- Check primary role in users table
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = check_role
    UNION
    -- Check additional roles in user_roles table
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = check_role 
      AND is_active = true
  );
$$;

-- Get all roles for current user as an array
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY(
    SELECT DISTINCT role FROM (
      -- Get primary role from users table
      SELECT role FROM public.users WHERE id = auth.uid()
      UNION
      -- Get additional roles from user_roles table
      SELECT role FROM public.user_roles 
      WHERE user_id = auth.uid() AND is_active = true
    ) AS all_roles
    WHERE role IS NOT NULL
  );
$$;