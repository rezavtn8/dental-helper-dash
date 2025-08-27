-- Create task_notes table for assistant notes on tasks
CREATE TABLE public.task_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id) -- One note per user per task
);

-- Enable RLS
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for task notes
CREATE POLICY "Users can manage their own task notes"
ON public.task_notes
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can view all task notes in their clinic"
ON public.task_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_notes.task_id
    AND t.clinic_id = get_current_user_clinic_id()
    AND get_current_user_role() = 'owner'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_task_notes_updated_at
BEFORE UPDATE ON public.task_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();