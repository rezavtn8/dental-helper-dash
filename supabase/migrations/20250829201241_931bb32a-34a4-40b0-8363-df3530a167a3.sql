-- Fix column ambiguity issues by qualifying all column references in RLS policies
-- and functions that might cause ambiguous column reference errors

-- Update RLS policies to use fully qualified column names to avoid ambiguity
-- when tables are joined in queries

-- For users table policies
DROP POLICY IF EXISTS "Owners can manage all users in clinic" ON public.users;
CREATE POLICY "Owners can manage all users in clinic" 
ON public.users
FOR ALL
USING (
  users.clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
)
WITH CHECK (
  users.clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
);

DROP POLICY IF EXISTS "Admins can manage assistants in clinic" ON public.users;
CREATE POLICY "Admins can manage assistants in clinic"
ON public.users  
FOR ALL
USING (
  users.clinic_id = get_current_user_clinic_id()
  AND get_current_user_role() = 'admin'
  AND (users.role = 'assistant' OR users.id = auth.uid())
)
WITH CHECK (
  users.clinic_id = get_current_user_clinic_id()
  AND get_current_user_role() = 'admin'  
  AND (users.role = 'assistant' OR users.id = auth.uid())
);

DROP POLICY IF EXISTS "Users can read team members in their clinic" ON public.users;
CREATE POLICY "Users can read team members in their clinic"
ON public.users
FOR SELECT
USING (users.clinic_id = get_current_user_clinic_id());

-- For invitations table policies  
DROP POLICY IF EXISTS "Owners can manage invitations in their clinic" ON public.invitations;
CREATE POLICY "Owners can manage invitations in their clinic"
ON public.invitations
FOR ALL
USING (
  invitations.clinic_id = get_current_user_clinic_id()
  AND get_current_user_role() = 'owner'
)
WITH CHECK (
  invitations.clinic_id = get_current_user_clinic_id()
  AND get_current_user_role() = 'owner'
);

DROP POLICY IF EXISTS "Users can view invitations in their clinic" ON public.invitations;
CREATE POLICY "Users can view invitations in their clinic"
ON public.invitations
FOR SELECT
USING (invitations.clinic_id = get_current_user_clinic_id());

-- For tasks table policies
DROP POLICY IF EXISTS "Clinic members can read tasks" ON public.tasks;
CREATE POLICY "Clinic members can read tasks"
ON public.tasks
FOR SELECT
USING (tasks.clinic_id = get_current_user_clinic_id());

DROP POLICY IF EXISTS "Owners can manage all clinic tasks" ON public.tasks;
CREATE POLICY "Owners can manage all clinic tasks"
ON public.tasks
FOR ALL
USING (
  tasks.clinic_id = get_current_user_clinic_id()
  AND get_current_user_role() = 'owner'
)
WITH CHECK (
  tasks.clinic_id = get_current_user_clinic_id()
  AND get_current_user_role() = 'owner'
);

DROP POLICY IF EXISTS "Assistants can update their assigned tasks" ON public.tasks;
CREATE POLICY "Assistants can update their assigned tasks"
ON public.tasks
FOR UPDATE
USING (
  tasks.clinic_id = get_current_user_clinic_id()
  AND tasks.assigned_to = auth.uid()
  AND get_current_user_role() = 'assistant'
)
WITH CHECK (
  tasks.clinic_id = get_current_user_clinic_id()
  AND tasks.assigned_to = auth.uid()
  AND get_current_user_role() = 'assistant'
);