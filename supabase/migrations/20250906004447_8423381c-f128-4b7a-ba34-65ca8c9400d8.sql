-- Remove checklist from task_templates since tasks will now have individual checklists
ALTER TABLE public.task_templates DROP COLUMN IF EXISTS checklist;

-- Add a tasks_count field to templates for tracking
ALTER TABLE public.task_templates ADD COLUMN tasks_count integer DEFAULT 0;

-- Create function to update tasks_count when tasks are added/removed
CREATE OR REPLACE FUNCTION public.update_template_tasks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.task_templates 
    SET tasks_count = tasks_count + 1 
    WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.task_templates 
    SET tasks_count = tasks_count - 1 
    WHERE id = OLD.template_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically update tasks_count
CREATE TRIGGER update_template_tasks_count_trigger
  AFTER INSERT OR DELETE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.template_id IS NOT NULL OR OLD.template_id IS NOT NULL)
  EXECUTE FUNCTION public.update_template_tasks_count();

-- Update existing templates to set correct tasks_count
UPDATE public.task_templates 
SET tasks_count = (
  SELECT COUNT(*) 
  FROM public.tasks 
  WHERE tasks.template_id = task_templates.id
);