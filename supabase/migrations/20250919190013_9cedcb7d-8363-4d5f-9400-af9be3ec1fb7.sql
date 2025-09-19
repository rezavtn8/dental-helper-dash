-- Create learning hub database schema

-- Learning courses table
CREATE TABLE public.learning_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  estimated_duration INTEGER, -- in minutes
  course_type TEXT NOT NULL DEFAULT 'course', -- course, certification, guide
  prerequisites TEXT[],
  created_by UUID NOT NULL,
  clinic_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning modules table
CREATE TABLE public.learning_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  module_order INTEGER NOT NULL,
  module_type TEXT NOT NULL DEFAULT 'text', -- text, video, interactive
  duration INTEGER, -- in minutes
  resources JSONB, -- for files/links
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning quizzes table
CREATE TABLE public.learning_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID,
  module_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  questions JSONB NOT NULL, -- array of question objects
  time_limit INTEGER, -- in minutes
  attempts_allowed INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning progress table
CREATE TABLE public.learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  module_id UUID,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, module_id)
);

-- Quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning achievements table
CREATE TABLE public.learning_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  points_awarded INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_courses
CREATE POLICY "Users can view courses in their clinic" ON public.learning_courses
  FOR SELECT USING (
    clinic_id = get_current_user_clinic_id() OR clinic_id IS NULL
  );

CREATE POLICY "Owners can manage courses in their clinic" ON public.learning_courses
  FOR ALL USING (
    clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner'
  );

-- RLS Policies for learning_modules  
CREATE POLICY "Users can view modules for accessible courses" ON public.learning_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.learning_courses lc 
      WHERE lc.id = learning_modules.course_id 
      AND (lc.clinic_id = get_current_user_clinic_id() OR lc.clinic_id IS NULL)
    )
  );

CREATE POLICY "Owners can manage modules in their clinic" ON public.learning_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.learning_courses lc 
      WHERE lc.id = learning_modules.course_id 
      AND lc.clinic_id = get_current_user_clinic_id() 
      AND get_current_user_role() = 'owner'
    )
  );

-- RLS Policies for learning_quizzes
CREATE POLICY "Users can view quizzes for accessible courses" ON public.learning_quizzes
  FOR SELECT USING (
    (course_id IS NULL OR EXISTS (
      SELECT 1 FROM public.learning_courses lc 
      WHERE lc.id = learning_quizzes.course_id 
      AND (lc.clinic_id = get_current_user_clinic_id() OR lc.clinic_id IS NULL)
    )) AND
    (module_id IS NULL OR EXISTS (
      SELECT 1 FROM public.learning_modules lm 
      JOIN public.learning_courses lc ON lc.id = lm.course_id
      WHERE lm.id = learning_quizzes.module_id 
      AND (lc.clinic_id = get_current_user_clinic_id() OR lc.clinic_id IS NULL)
    ))
  );

CREATE POLICY "Owners can manage quizzes in their clinic" ON public.learning_quizzes
  FOR ALL USING (
    (course_id IS NULL OR EXISTS (
      SELECT 1 FROM public.learning_courses lc 
      WHERE lc.id = learning_quizzes.course_id 
      AND lc.clinic_id = get_current_user_clinic_id() 
      AND get_current_user_role() = 'owner'
    )) AND
    (module_id IS NULL OR EXISTS (
      SELECT 1 FROM public.learning_modules lm 
      JOIN public.learning_courses lc ON lc.id = lm.course_id
      WHERE lm.id = learning_quizzes.module_id 
      AND lc.clinic_id = get_current_user_clinic_id() 
      AND get_current_user_role() = 'owner'
    ))
  );

-- RLS Policies for learning_progress
CREATE POLICY "Users can view and manage their own progress" ON public.learning_progress
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Owners can view progress in their clinic" ON public.learning_progress
  FOR SELECT USING (
    get_current_user_role() = 'owner' AND
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = learning_progress.user_id 
      AND u.clinic_id = get_current_user_clinic_id()
    )
  );

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can manage their own quiz attempts" ON public.quiz_attempts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Owners can view quiz attempts in their clinic" ON public.quiz_attempts
  FOR SELECT USING (
    get_current_user_role() = 'owner' AND
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = quiz_attempts.user_id 
      AND u.clinic_id = get_current_user_clinic_id()
    )
  );

-- RLS Policies for learning_achievements
CREATE POLICY "Users can view their own achievements" ON public.learning_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create achievements" ON public.learning_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view achievements in their clinic" ON public.learning_achievements
  FOR SELECT USING (
    get_current_user_role() = 'owner' AND
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = learning_achievements.user_id 
      AND u.clinic_id = get_current_user_clinic_id()
    )
  );

-- Create foreign key constraints
ALTER TABLE public.learning_modules 
  ADD CONSTRAINT learning_modules_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES public.learning_courses(id) ON DELETE CASCADE;

ALTER TABLE public.learning_quizzes 
  ADD CONSTRAINT learning_quizzes_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES public.learning_courses(id) ON DELETE CASCADE;

ALTER TABLE public.learning_quizzes 
  ADD CONSTRAINT learning_quizzes_module_id_fkey 
  FOREIGN KEY (module_id) REFERENCES public.learning_modules(id) ON DELETE CASCADE;

ALTER TABLE public.learning_progress 
  ADD CONSTRAINT learning_progress_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES public.learning_courses(id) ON DELETE CASCADE;

ALTER TABLE public.learning_progress 
  ADD CONSTRAINT learning_progress_module_id_fkey 
  FOREIGN KEY (module_id) REFERENCES public.learning_modules(id) ON DELETE CASCADE;

ALTER TABLE public.quiz_attempts 
  ADD CONSTRAINT quiz_attempts_quiz_id_fkey 
  FOREIGN KEY (quiz_id) REFERENCES public.learning_quizzes(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_learning_courses_clinic_id ON public.learning_courses(clinic_id);
CREATE INDEX idx_learning_modules_course_id ON public.learning_modules(course_id);
CREATE INDEX idx_learning_quizzes_course_id ON public.learning_quizzes(course_id);
CREATE INDEX idx_learning_quizzes_module_id ON public.learning_quizzes(module_id);
CREATE INDEX idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX idx_learning_progress_course_id ON public.learning_progress(course_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_learning_achievements_user_id ON public.learning_achievements(user_id);

-- Insert some sample courses for immediate use
INSERT INTO public.learning_courses (title, description, category, difficulty_level, estimated_duration, course_type, clinic_id, created_by) VALUES
('HIPAA Compliance Fundamentals', 'Comprehensive training on HIPAA regulations and patient privacy requirements', 'Compliance', 'beginner', 120, 'certification', NULL, '00000000-0000-0000-0000-000000000000'),
('Medical Terminology Basics', 'Essential medical terms and abbreviations used in healthcare settings', 'Medical Knowledge', 'beginner', 90, 'course', NULL, '00000000-0000-0000-0000-000000000000'),
('Patient Communication Skills', 'Effective communication techniques for healthcare professionals', 'Communication', 'intermediate', 60, 'course', NULL, '00000000-0000-0000-0000-000000000000'),
('Emergency Response Procedures', 'Critical procedures for medical emergencies in clinical settings', 'Safety', 'intermediate', 45, 'certification', NULL, '00000000-0000-0000-0000-000000000000'),
('Electronic Health Records (EHR) Management', 'Best practices for managing electronic health records systems', 'Technology', 'intermediate', 75, 'course', NULL, '00000000-0000-0000-0000-000000000000');

-- Insert sample modules for the first course
INSERT INTO public.learning_modules (course_id, title, content, module_order, module_type, duration) 
SELECT 
  lc.id,
  module_data.title,
  module_data.content,
  module_data.module_order,
  module_data.module_type,
  module_data.duration
FROM public.learning_courses lc,
(VALUES 
  ('Introduction to HIPAA', 'Learn the basics of HIPAA regulations and why they matter in healthcare.', 1, 'text', 15),
  ('Patient Privacy Rights', 'Understanding patient rights under HIPAA and how to protect them.', 2, 'text', 20),
  ('Handling Protected Health Information', 'Best practices for managing PHI in various healthcare scenarios.', 3, 'text', 25),
  ('HIPAA Violations and Penalties', 'Common violations and their consequences, plus how to avoid them.', 4, 'text', 15),
  ('HIPAA Compliance Assessment', 'Test your knowledge with real-world scenarios.', 5, 'interactive', 30)
) AS module_data(title, content, module_order, module_type, duration)
WHERE lc.title = 'HIPAA Compliance Fundamentals';

-- Insert a sample quiz for the HIPAA course
INSERT INTO public.learning_quizzes (course_id, title, description, passing_score, questions, time_limit, attempts_allowed)
SELECT 
  lc.id,
  'HIPAA Knowledge Assessment',
  'Test your understanding of HIPAA regulations and compliance requirements.',
  80,
  '[
    {
      "id": 1,
      "question": "What does HIPAA stand for?",
      "type": "multiple_choice",
      "options": [
        "Health Insurance Portability and Accountability Act",
        "Healthcare Information Privacy and Access Act",
        "Health Information Protection and Administration Act",
        "Healthcare Insurance Privacy and Authorization Act"
      ],
      "correct_answer": 0,
      "explanation": "HIPAA stands for Health Insurance Portability and Accountability Act, enacted in 1996."
    },
    {
      "id": 2,
      "question": "PHI can be shared without patient consent in which situation?",
      "type": "multiple_choice",
      "options": [
        "With family members",
        "For treatment, payment, and healthcare operations",
        "With any healthcare worker",
        "Never without consent"
      ],
      "correct_answer": 1,
      "explanation": "PHI can be shared without explicit consent for treatment, payment, and healthcare operations (TPO)."
    },
    {
      "id": 3,
      "question": "The minimum necessary rule requires limiting PHI disclosure to the smallest amount needed.",
      "type": "true_false",
      "correct_answer": true,
      "explanation": "The minimum necessary rule is a key HIPAA principle requiring limitation of PHI use and disclosure."
    }
  ]'::jsonb,
  30,
  3
FROM public.learning_courses lc
WHERE lc.title = 'HIPAA Compliance Fundamentals';

-- Create function to update learning progress
CREATE OR REPLACE FUNCTION public.update_learning_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- If module is completed, check if course should be marked complete
  IF NEW.completion_percentage = 100 AND OLD.completion_percentage < 100 THEN
    -- Check if all modules in the course are completed by this user
    IF NOT EXISTS (
      SELECT 1 FROM public.learning_modules lm
      LEFT JOIN public.learning_progress lp ON (lp.module_id = lm.id AND lp.user_id = NEW.user_id)
      WHERE lm.course_id = NEW.course_id 
      AND (lp.completion_percentage IS NULL OR lp.completion_percentage < 100)
    ) THEN
      -- Mark course as completed
      INSERT INTO public.learning_progress (user_id, course_id, completion_percentage, status, completed_at)
      VALUES (NEW.user_id, NEW.course_id, 100, 'completed', now())
      ON CONFLICT (user_id, course_id, module_id) 
      WHERE module_id IS NULL
      DO UPDATE SET 
        completion_percentage = 100,
        status = 'completed',
        completed_at = now(),
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for learning progress updates
CREATE TRIGGER update_learning_progress_trigger
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_learning_progress();

-- Create function to award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Award achievement for first course completion
  IF NEW.completion_percentage = 100 AND NEW.status = 'completed' AND NEW.module_id IS NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.learning_progress 
      WHERE user_id = NEW.user_id 
      AND completion_percentage = 100 
      AND status = 'completed' 
      AND module_id IS NULL 
      AND course_id != NEW.course_id
    ) THEN
      INSERT INTO public.learning_achievements (user_id, achievement_type, title, description, badge_icon, points_awarded)
      VALUES (
        NEW.user_id,
        'first_course',
        'First Course Complete!',
        'Congratulations on completing your first learning course',
        '🎓',
        100
      );
    END IF;
    
    -- Award achievement for course completion
    INSERT INTO public.learning_achievements (user_id, achievement_type, title, description, badge_icon, points_awarded)
    SELECT 
      NEW.user_id,
      'course_completion',
      'Course Completed: ' || lc.title,
      'Successfully completed ' || lc.title,
      '✅',
      50
    FROM public.learning_courses lc
    WHERE lc.id = NEW.course_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for achievement awards
CREATE TRIGGER award_achievements_trigger
  AFTER INSERT OR UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_award_achievements();