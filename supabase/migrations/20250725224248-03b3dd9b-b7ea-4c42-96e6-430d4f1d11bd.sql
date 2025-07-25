-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Owners can manage users in their clinic" ON public.users;
DROP POLICY IF EXISTS "Users can read users in their clinic" ON public.users;

-- Recreate policies using security definer functions
CREATE POLICY "Owners can manage users in their clinic" 
ON public.users 
FOR ALL 
USING (
  clinic_id = public.get_current_user_clinic_id() 
  AND public.get_current_user_role() = 'owner'
);

CREATE POLICY "Users can read users in their clinic" 
ON public.users 
FOR SELECT 
USING (clinic_id = public.get_current_user_clinic_id());

-- Update other table policies to use security definer functions
DROP POLICY IF EXISTS "Assistants can manage their own logs" ON public.patient_logs;
DROP POLICY IF EXISTS "Owner can read logs in their clinic" ON public.patient_logs;
DROP POLICY IF EXISTS "Owners can manage logs in their clinic" ON public.patient_logs;
DROP POLICY IF EXISTS "Users can read logs in their clinic" ON public.patient_logs;

CREATE POLICY "Assistants can manage their own logs" 
ON public.patient_logs 
FOR ALL 
USING (
  assistant_id = auth.uid() 
  AND clinic_id = public.get_current_user_clinic_id()
);

CREATE POLICY "Owners can manage logs in their clinic" 
ON public.patient_logs 
FOR ALL 
USING (
  clinic_id = public.get_current_user_clinic_id() 
  AND public.get_current_user_role() = 'owner'
);

CREATE POLICY "Users can read logs in their clinic" 
ON public.patient_logs 
FOR SELECT 
USING (clinic_id = public.get_current_user_clinic_id());

-- Update tasks table policies
DROP POLICY IF EXISTS "Assistants can update assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Owners can manage tasks in their clinic" ON public.tasks;
DROP POLICY IF EXISTS "Owners can read/write tasks in their clinic" ON public.tasks;
DROP POLICY IF EXISTS "Users can read tasks in their clinic" ON public.tasks;

CREATE POLICY "Assistants can update assigned tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  assigned_to = auth.uid() 
  AND clinic_id = public.get_current_user_clinic_id()
);

CREATE POLICY "Owners can manage tasks in their clinic" 
ON public.tasks 
FOR ALL 
USING (
  clinic_id = public.get_current_user_clinic_id() 
  AND public.get_current_user_role() = 'owner'
);

CREATE POLICY "Users can read tasks in their clinic" 
ON public.tasks 
FOR SELECT 
USING (clinic_id = public.get_current_user_clinic_id());

-- Update user_sessions table policies
DROP POLICY IF EXISTS "Owners can view sessions in their clinic" ON public.user_sessions;

CREATE POLICY "Owners can view sessions in their clinic" 
ON public.user_sessions 
FOR SELECT 
USING (
  clinic_id = public.get_current_user_clinic_id() 
  AND public.get_current_user_role() = 'owner'
);

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();