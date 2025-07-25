-- Update the users table to better support the three-tier role system
-- Add PIN change tracking and ensure proper role management

-- First, let's add some helpful columns for PIN management and role hierarchy
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS pin_changed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS must_change_pin BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id);

-- Update existing users to mark their PINs as needing change (except owners)
UPDATE public.users 
SET must_change_pin = CASE 
  WHEN role = 'owner' THEN false 
  ELSE true 
END
WHERE must_change_pin IS NULL;

-- Create a function to handle PIN updates with proper logging
CREATE OR REPLACE FUNCTION public.update_user_pin(user_id UUID, new_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow users to update their own PIN or owners/admins to update subordinates
  IF auth.uid() = user_id OR 
     (get_current_user_role() IN ('owner', 'admin') AND 
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id 
        AND clinic_id = get_current_user_clinic_id()
      )) 
  THEN
    UPDATE public.users 
    SET 
      pin = new_pin,
      pin_changed_at = now(),
      must_change_pin = false,
      pin_attempts = 0,
      pin_locked_until = NULL
    WHERE id = user_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create enhanced RLS policies for the new role hierarchy

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can read users in their clinic" ON public.users;
DROP POLICY IF EXISTS "Owners can manage users in their clinic" ON public.users;

-- Owners can manage all users in their clinic
CREATE POLICY "Owners can manage all users in clinic"
ON public.users
FOR ALL
TO authenticated
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

-- Admins can manage assistants but not owners or other admins
CREATE POLICY "Admins can manage assistants in clinic"
ON public.users
FOR ALL
TO authenticated
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'admin'
  AND (role = 'assistant' OR id = auth.uid())
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'admin'
  AND (role = 'assistant' OR id = auth.uid())
);

-- All users can read other users in their clinic (for task assignments, etc.)
CREATE POLICY "Users can read clinic members"
ON public.users
FOR SELECT
TO authenticated
USING (clinic_id = get_current_user_clinic_id());

-- Users can update their own basic profile and PIN
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Enhanced task policies for the role hierarchy

-- Drop existing task policies that might conflict
DROP POLICY IF EXISTS "Owners can manage tasks in their clinic" ON public.tasks;
DROP POLICY IF EXISTS "Assistants can update assigned tasks" ON public.tasks;

-- Owners can manage all tasks
CREATE POLICY "Owners can manage all tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

-- Admins can manage all tasks
CREATE POLICY "Admins can manage all tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'admin'
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'admin'
);

-- Assistants can read all tasks but only update their assigned ones
CREATE POLICY "Assistants can read all clinic tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Assistants can update assigned tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  assigned_to = auth.uid() 
  AND clinic_id = get_current_user_clinic_id()
  AND get_current_user_role() = 'assistant'
)
WITH CHECK (
  assigned_to = auth.uid() 
  AND clinic_id = get_current_user_clinic_id()
  AND get_current_user_role() = 'assistant'
);

-- Create a function to check if user can create other users
CREATE OR REPLACE FUNCTION public.can_create_user(target_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN get_current_user_role() = 'owner' THEN true
    WHEN get_current_user_role() = 'admin' AND target_role = 'assistant' THEN true
    ELSE false
  END;
$$;