-- Add target_role to tasks table to specify which role(s) can see/claim tasks
ALTER TABLE public.tasks ADD COLUMN target_role text DEFAULT 'assistant';

-- Create user_roles table to support users having multiple roles
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'assistant', 'front_desk')),
  clinic_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, clinic_id)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Owners can manage roles in their clinic" 
ON public.user_roles 
FOR ALL 
USING (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

-- Add target_role to task_templates table
ALTER TABLE public.task_templates ADD COLUMN target_role text DEFAULT 'assistant';

-- Update tasks RLS policies to include target_role filtering
DROP POLICY IF EXISTS "Enhanced task access for clinic members" ON public.tasks;

CREATE POLICY "Enhanced task access for clinic members" 
ON public.tasks 
FOR SELECT 
USING (
  clinic_id = get_current_user_clinic_id() 
  AND (
    get_current_user_role() IN ('owner', 'admin') 
    OR (
      get_current_user_role() = 'assistant' 
      AND target_role IN ('assistant', 'shared')
      AND (assigned_to = auth.uid() OR assigned_to IS NULL)
    )
    OR (
      get_current_user_role() = 'front_desk' 
      AND target_role IN ('front_desk', 'shared')
      AND (assigned_to = auth.uid() OR assigned_to IS NULL)
    )
  )
);

-- Update assistant task update policy to include front_desk
DROP POLICY IF EXISTS "Assistants can update their tasks and claim unassigned" ON public.tasks;

CREATE POLICY "Assistants and front desk can update their tasks and claim unassigned" 
ON public.tasks 
FOR UPDATE 
USING (
  clinic_id = get_current_user_clinic_id() 
  AND (
    (get_current_user_role() = 'assistant' AND target_role IN ('assistant', 'shared'))
    OR (get_current_user_role() = 'front_desk' AND target_role IN ('front_desk', 'shared'))
  )
  AND (assigned_to = auth.uid() OR assigned_to IS NULL OR claimed_by = auth.uid())
)
WITH CHECK (
  clinic_id = get_current_user_clinic_id() 
  AND (
    (get_current_user_role() = 'assistant' AND target_role IN ('assistant', 'shared'))
    OR (get_current_user_role() = 'front_desk' AND target_role IN ('front_desk', 'shared'))
  )
  AND (assigned_to = auth.uid() OR claimed_by = auth.uid() OR (assigned_to IS NULL AND claimed_by IS NULL))
);

-- Function to get user roles for multi-role support
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id_param uuid DEFAULT auth.uid())
RETURNS TABLE(role text, clinic_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ur.role, ur.clinic_id
  FROM public.user_roles ur
  WHERE ur.user_id = user_id_param 
    AND ur.is_active = true
  UNION
  SELECT u.role, u.clinic_id
  FROM public.users u
  WHERE u.id = user_id_param 
    AND u.role IS NOT NULL 
    AND u.role != '';
$$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(check_role text, user_id_param uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.get_user_roles(user_id_param) 
    WHERE role = check_role
  );
$$;