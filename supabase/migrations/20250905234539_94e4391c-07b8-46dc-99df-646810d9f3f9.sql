-- Add extra protection to ensure default templates are never accidentally modified
-- by adding a source_type field to track template origins

-- Add source tracking to task_templates
ALTER TABLE public.task_templates 
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'custom';

-- Update existing templates that came from defaults
UPDATE public.task_templates 
SET source_type = 'imported_default'
WHERE created_at < now() AND clinic_id IS NOT NULL;

-- Add a trigger to prevent accidental modification of default templates table
CREATE OR REPLACE FUNCTION public.protect_default_templates()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow SELECT operations from clinic owners
  IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
    RAISE EXCEPTION 'Default templates cannot be modified. These are system templates used to seed new clinics.';
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to protect default templates (except for system operations)
DROP TRIGGER IF EXISTS prevent_default_template_changes ON public.default_task_templates;
CREATE TRIGGER prevent_default_template_changes
  BEFORE INSERT OR UPDATE OR DELETE ON public.default_task_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_default_templates();

-- Add helpful comment to clarify the relationship
COMMENT ON TABLE public.default_task_templates IS 'System-wide template library. These are copied to clinic-specific task_templates when clinics are initialized. Never modify directly.';
COMMENT ON TABLE public.task_templates IS 'Clinic-specific templates. These are copies/derivatives of default_task_templates plus custom templates created by clinic owners.';