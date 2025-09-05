-- Fix search path security warnings for the new functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';