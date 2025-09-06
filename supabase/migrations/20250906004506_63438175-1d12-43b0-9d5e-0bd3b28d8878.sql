-- Remove checklist from task_templates since tasks will now have individual checklists
ALTER TABLE public.task_templates DROP COLUMN IF EXISTS checklist;

-- Add a tasks_count field to templates for tracking
ALTER TABLE public.task_templates ADD COLUMN tasks_count integer DEFAULT 0;

-- Create function to update tasks_count when tasks are inserted
CREATE OR REPLACE FUNCTION public.update_template_tasks_count_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.task_templates 
    SET tasks_count = tasks_count + 1 
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update tasks_count when tasks are deleted
CREATE OR REPLACE FUNCTION public.update_template_tasks_count_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.template_id IS NOT NULL THEN
    UPDATE public.task_templates 
    SET tasks_count = tasks_count - 1 
    WHERE id = OLD.template_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for insert and delete operations
CREATE TRIGGER update_template_tasks_count_insert_trigger
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_tasks_count_insert();

CREATE TRIGGER update_template_tasks_count_delete_trigger
  AFTER DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_tasks_count_delete();

-- Update existing templates to set correct tasks_count
UPDATE public.task_templates 
SET tasks_count = (
  SELECT COUNT(*) 
  FROM public.tasks 
  WHERE tasks.template_id = task_templates.id
);