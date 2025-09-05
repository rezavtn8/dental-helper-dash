-- Create clinic scheduling settings table
CREATE TABLE public.clinic_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  weekends_are_workdays BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_clinic_settings_clinic FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE,
  CONSTRAINT unique_clinic_settings UNIQUE (clinic_id)
);

-- Create holiday settings table for federal holidays and custom closures
CREATE TABLE public.holiday_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  holiday_name TEXT NOT NULL,
  holiday_date DATE NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_federal_holiday BOOLEAN NOT NULL DEFAULT true,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  end_date DATE, -- For multi-day closures
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_holiday_settings_clinic FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clinic_settings
CREATE POLICY "Owners can manage their clinic settings"
ON public.clinic_settings
FOR ALL
USING (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner')
WITH CHECK (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner');

CREATE POLICY "Clinic members can view settings"
ON public.clinic_settings
FOR SELECT
USING (clinic_id = get_current_user_clinic_id());

-- Create RLS policies for holiday_settings
CREATE POLICY "Owners can manage holiday settings"
ON public.holiday_settings
FOR ALL
USING (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner')
WITH CHECK (clinic_id = get_current_user_clinic_id() AND get_current_user_role() = 'owner');

CREATE POLICY "Clinic members can view holiday settings"
ON public.holiday_settings
FOR SELECT
USING (clinic_id = get_current_user_clinic_id());

-- Create indexes for better performance
CREATE INDEX idx_clinic_settings_clinic_id ON public.clinic_settings(clinic_id);
CREATE INDEX idx_holiday_settings_clinic_id ON public.holiday_settings(clinic_id);
CREATE INDEX idx_holiday_settings_date ON public.holiday_settings(holiday_date);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_clinic_settings_updated_at
BEFORE UPDATE ON public.clinic_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_holiday_settings_updated_at
BEFORE UPDATE ON public.holiday_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert default US Federal Holidays for 2024-2025 (owners can enable/disable as needed)
CREATE OR REPLACE FUNCTION public.initialize_federal_holidays(p_clinic_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 2024 Federal Holidays
  INSERT INTO public.holiday_settings (clinic_id, holiday_name, holiday_date, is_enabled, is_federal_holiday) VALUES
  (p_clinic_id, 'New Year''s Day', '2024-01-01', false, true),
  (p_clinic_id, 'Martin Luther King Jr. Day', '2024-01-15', false, true),
  (p_clinic_id, 'Presidents Day', '2024-02-19', false, true),
  (p_clinic_id, 'Memorial Day', '2024-05-27', false, true),
  (p_clinic_id, 'Independence Day', '2024-07-04', false, true),
  (p_clinic_id, 'Labor Day', '2024-09-02', false, true),
  (p_clinic_id, 'Columbus Day', '2024-10-14', false, true),
  (p_clinic_id, 'Veterans Day', '2024-11-11', false, true),
  (p_clinic_id, 'Thanksgiving Day', '2024-11-28', false, true),
  (p_clinic_id, 'Christmas Day', '2024-12-25', false, true),
  
  -- 2025 Federal Holidays
  (p_clinic_id, 'New Year''s Day', '2025-01-01', false, true),
  (p_clinic_id, 'Martin Luther King Jr. Day', '2025-01-20', false, true),
  (p_clinic_id, 'Presidents Day', '2025-02-17', false, true),
  (p_clinic_id, 'Memorial Day', '2025-05-26', false, true),
  (p_clinic_id, 'Independence Day', '2025-07-04', false, true),
  (p_clinic_id, 'Labor Day', '2025-09-01', false, true),
  (p_clinic_id, 'Columbus Day', '2025-10-13', false, true),
  (p_clinic_id, 'Veterans Day', '2025-11-11', false, true),
  (p_clinic_id, 'Thanksgiving Day', '2025-11-27', false, true),
  (p_clinic_id, 'Christmas Day', '2025-12-25', false, true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get working days settings for a clinic
CREATE OR REPLACE FUNCTION public.get_clinic_working_days_settings(p_clinic_id UUID)
RETURNS TABLE(weekends_are_workdays BOOLEAN, holidays DATE[])
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  weekend_setting BOOLEAN := false;
  holiday_list DATE[];
BEGIN
  -- Get weekend setting
  SELECT COALESCE(cs.weekends_are_workdays, false) INTO weekend_setting
  FROM public.clinic_settings cs
  WHERE cs.clinic_id = p_clinic_id;
  
  -- Get enabled holidays
  SELECT ARRAY_AGG(hs.holiday_date) INTO holiday_list
  FROM public.holiday_settings hs
  WHERE hs.clinic_id = p_clinic_id AND hs.is_enabled = true;
  
  RETURN QUERY SELECT weekend_setting, COALESCE(holiday_list, ARRAY[]::DATE[]);
END;
$$;

-- Function to check if a date is a working day for a clinic
CREATE OR REPLACE FUNCTION public.is_working_day(p_clinic_id UUID, p_date DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  weekend_setting BOOLEAN := false;
  is_weekend BOOLEAN;
  is_holiday BOOLEAN := false;
  day_of_week INTEGER;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week := EXTRACT(DOW FROM p_date);
  is_weekend := (day_of_week = 0 OR day_of_week = 6);
  
  -- Get weekend setting
  SELECT COALESCE(cs.weekends_are_workdays, false) INTO weekend_setting
  FROM public.clinic_settings cs
  WHERE cs.clinic_id = p_clinic_id;
  
  -- If weekends are not workdays and this is a weekend, return false
  IF NOT weekend_setting AND is_weekend THEN
    RETURN false;
  END IF;
  
  -- Check if date is an enabled holiday
  SELECT EXISTS(
    SELECT 1 FROM public.holiday_settings hs
    WHERE hs.clinic_id = p_clinic_id 
      AND hs.is_enabled = true
      AND (
        (hs.end_date IS NULL AND hs.holiday_date = p_date) -- Single day holiday
        OR (hs.end_date IS NOT NULL AND p_date BETWEEN hs.holiday_date AND hs.end_date) -- Multi-day closure
      )
  ) INTO is_holiday;
  
  -- If it's a holiday, return false
  IF is_holiday THEN
    RETURN false;
  END IF;
  
  -- Otherwise it's a working day
  RETURN true;
END;
$$;