-- Add the remaining functions for template-based task generation

-- Create function to calculate next generation date
CREATE OR REPLACE FUNCTION public.calculate_next_generation_date(
  last_date date,
  recurrence_type text,
  start_date date DEFAULT CURRENT_DATE
) RETURNS date AS $$
BEGIN
  IF last_date IS NULL THEN
    RETURN start_date;
  END IF;
  
  CASE recurrence_type
    WHEN 'daily' THEN
      RETURN last_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN last_date + INTERVAL '1 week';
    WHEN 'biweekly' THEN
      RETURN last_date + INTERVAL '2 weeks';
    WHEN 'monthly' THEN
      RETURN last_date + INTERVAL '1 month';
    WHEN 'once' THEN
      RETURN NULL; -- Only generate once
    ELSE
      RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public;

-- Function to generate tasks from templates
CREATE OR REPLACE FUNCTION public.generate_tasks_from_templates(target_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(template_id uuid, tasks_created integer) AS $$
DECLARE
  template_record task_templates%ROWTYPE;
  task_count integer := 0;
  total_created integer := 0;
BEGIN
  -- Loop through all active templates that need task generation
  FOR template_record IN 
    SELECT * FROM public.task_templates 
    WHERE is_active = true 
      AND is_enabled = true
      AND (
        next_generation_date IS NULL 
        OR next_generation_date <= target_date
      )
  LOOP
    task_count := 0;
    
    -- Generate task if this is a working day for the clinic
    IF public.is_working_day(template_record.clinic_id, target_date) THEN
      -- Insert the new task
      INSERT INTO public.tasks (
        title,
        description,
        category,
        priority,
        "due-type",
        recurrence,
        checklist,
        attachments,
        clinic_id,
        created_by,
        template_id,
        generated_date,
        status
      ) VALUES (
        template_record.title,
        template_record.description,
        template_record.category,
        template_record.priority,
        template_record."due-type",
        template_record.recurrence,
        template_record.checklist,
        template_record.attachments,
        template_record.clinic_id,
        template_record.created_by,
        template_record.id,
        target_date,
        'pending'::task_status
      );
      
      task_count := 1;
      total_created := total_created + 1;
    END IF;
    
    -- Update template's generation tracking
    UPDATE public.task_templates 
    SET 
      last_generated_date = target_date,
      next_generation_date = public.calculate_next_generation_date(
        target_date, 
        template_record.recurrence, 
        template_record.start_date
      )
    WHERE id = template_record.id;
    
    -- Return result for this template
    RETURN QUERY SELECT template_record.id, task_count;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Initialize next_generation_date for existing templates
UPDATE public.task_templates 
SET next_generation_date = public.calculate_next_generation_date(
  last_generated_date, 
  recurrence, 
  COALESCE(start_date, created_at::date)
)
WHERE next_generation_date IS NULL AND recurrence IS NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_templates_generation ON public.task_templates(next_generation_date, is_active, is_enabled) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tasks_template_generated ON public.tasks(template_id, generated_date) WHERE template_id IS NOT NULL;