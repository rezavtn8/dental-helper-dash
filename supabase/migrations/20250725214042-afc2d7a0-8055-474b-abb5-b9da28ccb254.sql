-- First, drop all policies that reference the pin column
DROP POLICY IF EXISTS "Assistants can read tasks assigned to them or unassigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Assistants can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Assistants can view/update their own logs" ON public.patient_logs;

-- Create clinics table
CREATE TABLE public.clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Now safely drop the pin column and update users table
ALTER TABLE public.users 
DROP COLUMN pin,
ADD COLUMN password_hash TEXT;

-- Insert sample clinic data first
INSERT INTO public.clinics (name, address, phone, email) 
VALUES ('Sample Medical Clinic', '123 Main St, City, State', '555-0123', 'admin@sampleclinic.com');

-- Update existing users to reference the sample clinic
UPDATE public.users 
SET clinic_id = (SELECT id FROM public.clinics LIMIT 1)
WHERE clinic_id IS NULL;

-- Now make clinic_id NOT NULL and add foreign key
ALTER TABLE public.users 
ALTER COLUMN clinic_id SET NOT NULL,
ADD CONSTRAINT fk_users_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;

-- Create updated RLS policies for clinics
CREATE POLICY "Clinic owners can manage their clinic" 
ON public.clinics 
FOR ALL 
TO authenticated
USING (
  id IN (
    SELECT clinic_id FROM public.users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Update users table RLS policies
DROP POLICY IF EXISTS "Anonymous can read assistant names for login" ON public.users;
DROP POLICY IF EXISTS "Owners can read assistants in their clinic" ON public.users;
DROP POLICY IF EXISTS "Users can read their own record" ON public.users;

-- Allow authenticated users to read users in their clinic
CREATE POLICY "Users can read users in their clinic" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  clinic_id = (
    SELECT clinic_id FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Allow owners to manage users in their clinic
CREATE POLICY "Owners can manage users in their clinic" 
ON public.users 
FOR ALL 
TO authenticated
USING (
  clinic_id = (
    SELECT clinic_id FROM public.users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Allow users to read their own record
CREATE POLICY "Users can read their own record" 
ON public.users 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Update tasks RLS policies for clinic-based access
DROP POLICY IF EXISTS "Owners can read/write tasks in their clinic" ON public.tasks;

CREATE POLICY "Users can read tasks in their clinic" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (
  clinic_id = (
    SELECT clinic_id FROM public.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Assistants can update assigned tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated
USING (
  assigned_to = auth.uid() 
  AND clinic_id = (
    SELECT clinic_id FROM public.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Owners can manage tasks in their clinic" 
ON public.tasks 
FOR ALL 
TO authenticated
USING (
  clinic_id = (
    SELECT clinic_id FROM public.users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Update patient_logs RLS policies
DROP POLICY IF EXISTS "Owner can read logs in their clinic" ON public.patient_logs;

CREATE POLICY "Users can read logs in their clinic" 
ON public.patient_logs 
FOR SELECT 
TO authenticated
USING (
  clinic_id = (
    SELECT clinic_id FROM public.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Assistants can manage their own logs" 
ON public.patient_logs 
FOR ALL 
TO authenticated
USING (
  assistant_id = auth.uid() 
  AND clinic_id = (
    SELECT clinic_id FROM public.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Owners can manage logs in their clinic" 
ON public.patient_logs 
FOR ALL 
TO authenticated
USING (
  clinic_id = (
    SELECT clinic_id FROM public.users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinics_updated_at
BEFORE UPDATE ON public.clinics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();