-- Add new fields to tasks table for enhanced functionality
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS checklist jsonb,
ADD COLUMN IF NOT EXISTS owner_notes text,
ADD COLUMN IF NOT EXISTS custom_due_date timestamp with time zone;

-- Create templates table for task templates
CREATE TABLE IF NOT EXISTS public.task_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  checklist jsonb,
  category text,
  "due-type" text,
  recurrence text,
  owner_notes text,
  specialty text, -- clinical specialty grouping
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  clinic_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on task_templates
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for task_templates
CREATE POLICY "Owners can manage templates in their clinic" 
ON public.task_templates 
FOR ALL 
USING (
  clinic_id = public.get_current_user_clinic_id() 
  AND public.get_current_user_role() = 'owner'
);

CREATE POLICY "Users can read templates in their clinic" 
ON public.task_templates 
FOR SELECT 
USING (clinic_id = public.get_current_user_clinic_id() AND is_active = true);

-- Add trigger for automatic timestamp updates on task_templates
CREATE TRIGGER update_task_templates_updated_at
BEFORE UPDATE ON public.task_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();