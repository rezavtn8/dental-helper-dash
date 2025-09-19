-- Create course_assignments table for tracking course assignments
CREATE TABLE public.course_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'started', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for course assignments
CREATE POLICY "Owners can manage assignments in their clinic" 
ON public.course_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = course_assignments.user_id 
    AND u.clinic_id = get_current_user_clinic_id() 
    AND get_current_user_role() = 'owner'
  )
);

CREATE POLICY "Users can view their own assignments" 
ON public.course_assignments 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own assignment progress" 
ON public.course_assignments 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_course_assignment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_course_assignments_updated_at
BEFORE UPDATE ON public.course_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_course_assignment_updated_at();