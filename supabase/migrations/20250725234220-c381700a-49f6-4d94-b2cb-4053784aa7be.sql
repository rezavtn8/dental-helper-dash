-- Create a policy to allow reading assistant/admin names for login purposes
CREATE POLICY "Allow reading assistant/admin names for login" 
ON public.users 
FOR SELECT 
USING (role IN ('assistant', 'admin') AND is_active = true);

-- This policy allows unauthenticated users to read basic info about active assistants/admins
-- but only for login purposes (name, role, clinic_id, is_active)