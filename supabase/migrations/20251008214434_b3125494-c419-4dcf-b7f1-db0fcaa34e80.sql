-- Function to automatically generate certificates on course completion
CREATE OR REPLACE FUNCTION public.generate_course_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_title TEXT;
  course_category TEXT;
  cert_type TEXT;
  org_name TEXT := 'Practice Learning Platform';
BEGIN
  -- Only proceed if this is a course-level completion (not module)
  IF NEW.completion_percentage = 100 
     AND NEW.status = 'completed' 
     AND NEW.module_id IS NULL 
     AND NEW.completed_at IS NOT NULL THEN
    
    -- Check if certificate already exists for this user and course
    IF EXISTS (
      SELECT 1 FROM public.certifications 
      WHERE user_id = NEW.user_id 
        AND name LIKE '%' || (SELECT title FROM public.learning_courses WHERE id = NEW.course_id) || '%'
    ) THEN
      RETURN NEW; -- Certificate already exists, skip
    END IF;
    
    -- Get course details
    SELECT title, category INTO course_title, course_category
    FROM public.learning_courses
    WHERE id = NEW.course_id;
    
    -- Map course category to certification type
    cert_type := CASE 
      WHEN course_category ILIKE '%hipaa%' THEN 'HIPAA'
      WHEN course_category ILIKE '%osha%' THEN 'OSHA'
      WHEN course_category ILIKE '%infection%' THEN 'Infection Control'
      WHEN course_category ILIKE '%cpr%' OR course_category ILIKE '%emergency%' THEN 'CPR/BLS'
      WHEN course_category ILIKE '%compliance%' THEN 'Compliance'
      WHEN course_category ILIKE '%clinical%' THEN 'Clinical Training'
      ELSE 'Professional Development'
    END;
    
    -- Insert certificate
    INSERT INTO public.certifications (
      user_id,
      name,
      certification_type,
      issued_date,
      issuing_organization,
      file_url
    ) VALUES (
      NEW.user_id,
      course_title || ' - Completion Certificate',
      cert_type,
      NEW.completed_at::date,
      org_name,
      NULL -- PDF generation can be added later
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on learning_progress table
DROP TRIGGER IF EXISTS trigger_generate_certificate ON public.learning_progress;
CREATE TRIGGER trigger_generate_certificate
  AFTER INSERT OR UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_course_certificate();