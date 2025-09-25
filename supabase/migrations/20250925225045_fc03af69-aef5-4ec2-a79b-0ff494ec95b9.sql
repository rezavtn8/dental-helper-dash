-- Create learning_assignments table
CREATE TABLE public.learning_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.learning_courses(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.learning_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assignments"
ON public.learning_assignments
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own assignment progress"
ON public.learning_assignments
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can manage assignments in their clinic"
ON public.learning_assignments
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = learning_assignments.user_id
        AND u.clinic_id = get_current_user_clinic_id()
        AND get_current_user_role() = 'owner'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = learning_assignments.user_id
        AND u.clinic_id = get_current_user_clinic_id()
        AND get_current_user_role() = 'owner'
    )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_learning_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_assignments_updated_at
    BEFORE UPDATE ON public.learning_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_learning_assignments_updated_at();