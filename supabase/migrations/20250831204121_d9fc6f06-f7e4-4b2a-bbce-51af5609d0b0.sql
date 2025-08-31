-- Create certifications table for global assistant certifications
CREATE TABLE public.certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  certification_type text NOT NULL, -- CPR, OSHA, HIPAA, etc.
  file_url text,
  expiry_date date,
  issued_date date,
  issuing_organization text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create schedules table for monthly schedule management
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2024),
  title text,
  notes text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, month, year)
);

-- Create shifts table for individual assistant shifts
CREATE TABLE public.shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id uuid NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  break_minutes integer DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, user_id, date, start_time)
);

-- Create feedback table for owner-to-assistant feedback
CREATE TABLE public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  assistant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  feedback_type text NOT NULL DEFAULT 'general', -- general, milestone, improvement, praise
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create milestones table for tracking assistant achievements
CREATE TABLE public.milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  badge_type text NOT NULL, -- patients_100, streak_30, certification_complete, etc.
  badge_color text DEFAULT 'blue',
  achieved_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certifications (global to user, not clinic-specific)
CREATE POLICY "Users can manage their own certifications"
ON public.certifications
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for schedules
CREATE POLICY "Owners can manage schedules in their clinic"
ON public.schedules
FOR ALL
USING (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner')
WITH CHECK (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner');

CREATE POLICY "Clinic members can view published schedules"
ON public.schedules
FOR SELECT
USING (clinic_id = get_current_user_clinic_id() AND is_published = true);

-- RLS Policies for shifts
CREATE POLICY "Owners can manage all shifts in their clinic"
ON public.shifts
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.schedules s 
  WHERE s.id = shifts.schedule_id 
  AND s.clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.schedules s 
  WHERE s.id = shifts.schedule_id 
  AND s.clinic_id = get_current_user_clinic_id() 
  AND get_current_user_role() = 'owner'
));

CREATE POLICY "Assistants can view their own shifts"
ON public.shifts
FOR SELECT
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.schedules s 
  WHERE s.id = shifts.schedule_id 
  AND s.clinic_id = get_current_user_clinic_id()
  AND s.is_published = true
));

-- RLS Policies for feedback
CREATE POLICY "Owners can manage feedback in their clinic"
ON public.feedback
FOR ALL
USING (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner')
WITH CHECK (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner');

CREATE POLICY "Assistants can view their own feedback"
ON public.feedback
FOR SELECT
USING (assistant_id = auth.uid() AND is_visible = true);

-- RLS Policies for milestones
CREATE POLICY "Users can view their own milestones"
ON public.milestones
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Owners can manage milestones for their clinic assistants"
ON public.milestones
FOR ALL
USING (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner')
WITH CHECK (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner');

-- Create updated_at triggers
CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_certifications_user_id ON public.certifications(user_id);
CREATE INDEX idx_certifications_expiry_date ON public.certifications(expiry_date);
CREATE INDEX idx_schedules_clinic_month_year ON public.schedules(clinic_id, month, year);
CREATE INDEX idx_shifts_schedule_user ON public.shifts(schedule_id, user_id);
CREATE INDEX idx_shifts_date ON public.shifts(date);
CREATE INDEX idx_feedback_assistant_id ON public.feedback(assistant_id);
CREATE INDEX idx_milestones_user_id ON public.milestones(user_id);