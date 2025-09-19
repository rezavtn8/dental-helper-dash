-- Additional tables for scalable course creation system

-- Course templates for reusable structures
CREATE TABLE public.course_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  template_data JSONB NOT NULL, -- Course structure and module templates
  created_by UUID NOT NULL,
  clinic_id UUID, -- NULL for system templates, specific clinic for custom templates
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Media assets management
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  thumbnail_path TEXT, -- For videos/images
  metadata JSONB, -- Additional file metadata
  uploaded_by UUID NOT NULL,
  clinic_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course categories for better organization
CREATE TABLE public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color_scheme TEXT, -- For UI theming
  icon TEXT, -- Icon identifier
  clinic_id UUID, -- NULL for system categories
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course versions for version control
CREATE TABLE public.course_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  version_name TEXT,
  course_data JSONB NOT NULL, -- Full course snapshot
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, version_number)
);

-- Storage buckets for learning content
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('learning-content', 'learning-content', false),
  ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.course_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_templates
CREATE POLICY "Users can view system and their clinic templates" ON public.course_templates
FOR SELECT USING (
  clinic_id IS NULL OR clinic_id = get_current_user_clinic_id()
);

CREATE POLICY "Owners can manage clinic templates" ON public.course_templates
FOR ALL USING (
  clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner'
);

-- RLS Policies for media_assets
CREATE POLICY "Users can view clinic media" ON public.media_assets
FOR SELECT USING (clinic_id = get_current_user_clinic_id());

CREATE POLICY "Owners can manage clinic media" ON public.media_assets
FOR ALL USING (
  clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner'
);

-- RLS Policies for course_categories
CREATE POLICY "Users can view system and clinic categories" ON public.course_categories
FOR SELECT USING (
  clinic_id IS NULL OR clinic_id = get_current_user_clinic_id()
);

CREATE POLICY "Owners can manage clinic categories" ON public.course_categories
FOR ALL USING (
  clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner'
);

-- RLS Policies for course_versions
CREATE POLICY "Users can view course versions in their clinic" ON public.course_versions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM learning_courses lc 
    WHERE lc.id = course_versions.course_id 
    AND lc.clinic_id = get_current_user_clinic_id()
  )
);

CREATE POLICY "Owners can manage course versions" ON public.course_versions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM learning_courses lc 
    WHERE lc.id = course_versions.course_id 
    AND lc.clinic_id = get_current_user_clinic_id()
    AND get_current_user_role() = 'owner'
  )
);

-- Storage policies for learning content
CREATE POLICY "Users can view learning content" ON storage.objects
FOR SELECT USING (
  bucket_id = 'learning-content' 
  AND EXISTS (
    SELECT 1 FROM public.media_assets ma 
    WHERE ma.storage_path = name 
    AND ma.clinic_id = get_current_user_clinic_id()
  )
);

CREATE POLICY "Owners can upload learning content" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'learning-content' 
  AND get_current_user_role() = 'owner'
);

CREATE POLICY "Course thumbnails are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Owners can upload course thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-thumbnails' 
  AND get_current_user_role() = 'owner'
);

-- Triggers for updated_at
CREATE TRIGGER update_course_templates_updated_at
  BEFORE UPDATE ON public.course_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.course_categories (name, description, color_scheme, icon, clinic_id)
VALUES 
  ('General', 'General learning content', 'blue', 'BookOpen', NULL),
  ('Medical', 'Medical and healthcare topics', 'green', 'Heart', NULL),
  ('Technology', 'Technology and software topics', 'purple', 'Monitor', NULL),
  ('Certification', 'Professional certification courses', 'orange', 'Award', NULL),
  ('Skills', 'Professional skills development', 'pink', 'Users', NULL)
ON CONFLICT DO NOTHING;

-- Insert default course templates
INSERT INTO public.course_templates (name, description, category, difficulty_level, template_data, created_by, clinic_id)
VALUES 
  (
    'Basic Course Template',
    'A simple template with introduction, main content, and assessment',
    'General',
    'beginner',
    '{
      "modules": [
        {"title": "Introduction", "type": "text", "duration": 10},
        {"title": "Main Content", "type": "text", "duration": 20},
        {"title": "Assessment", "type": "interactive", "duration": 15}
      ],
      "quiz": {
        "passing_score": 70,
        "questions": 5,
        "time_limit": 10
      }
    }'::jsonb,
    '00000000-0000-0000-0000-000000000000',
    NULL
  ),
  (
    'Certification Course Template',
    'Comprehensive template for certification courses with multiple assessments',
    'Certification',
    'advanced',
    '{
      "modules": [
        {"title": "Course Overview", "type": "text", "duration": 15},
        {"title": "Core Concepts", "type": "text", "duration": 30},
        {"title": "Practical Applications", "type": "interactive", "duration": 25},
        {"title": "Case Studies", "type": "text", "duration": 20},
        {"title": "Final Assessment", "type": "interactive", "duration": 30}
      ],
      "quiz": {
        "passing_score": 85,
        "questions": 15,
        "time_limit": 30
      }
    }'::jsonb,
    '00000000-0000-0000-0000-000000000000',
    NULL
  )
ON CONFLICT DO NOTHING;