-- Fix search path security issue for the new functions
CREATE OR REPLACE FUNCTION public.update_template_tasks_count_insert()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE public.task_templates 
    SET tasks_count = tasks_count + 1 
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_template_tasks_count_delete()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  IF OLD.template_id IS NOT NULL THEN
    UPDATE public.task_templates 
    SET tasks_count = tasks_count - 1 
    WHERE id = OLD.template_id;
  END IF;
  RETURN OLD;
END;
$$;