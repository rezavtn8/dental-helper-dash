
CREATE OR REPLACE FUNCTION initialize_federal_holidays(p_clinic_id UUID)
RETURNS void AS $$
BEGIN
  -- Delete existing federal holidays for this clinic to avoid duplicates
  DELETE FROM holiday_settings 
  WHERE clinic_id = p_clinic_id AND is_federal_holiday = true;

  -- 2026 Federal Holidays
  INSERT INTO holiday_settings (clinic_id, holiday_name, holiday_date, is_federal_holiday, is_custom, is_enabled) VALUES
    (p_clinic_id, 'New Year''s Day', '2026-01-01', true, false, true),
    (p_clinic_id, 'Martin Luther King Jr. Day', '2026-01-19', true, false, true),
    (p_clinic_id, 'Presidents'' Day', '2026-02-16', true, false, true),
    (p_clinic_id, 'Memorial Day', '2026-05-25', true, false, true),
    (p_clinic_id, 'Juneteenth', '2026-06-19', true, false, true),
    (p_clinic_id, 'Independence Day (observed)', '2026-07-03', true, false, true),
    (p_clinic_id, 'Labor Day', '2026-09-07', true, false, true),
    (p_clinic_id, 'Columbus Day', '2026-10-12', true, false, true),
    (p_clinic_id, 'Veterans Day', '2026-11-11', true, false, true),
    (p_clinic_id, 'Thanksgiving Day', '2026-11-26', true, false, true),
    (p_clinic_id, 'Christmas Day', '2026-12-25', true, false, true),

  -- 2027 Federal Holidays
    (p_clinic_id, 'New Year''s Day', '2027-01-01', true, false, true),
    (p_clinic_id, 'Martin Luther King Jr. Day', '2027-01-18', true, false, true),
    (p_clinic_id, 'Presidents'' Day', '2027-02-15', true, false, true),
    (p_clinic_id, 'Memorial Day', '2027-05-31', true, false, true),
    (p_clinic_id, 'Juneteenth (observed)', '2027-06-18', true, false, true),
    (p_clinic_id, 'Independence Day (observed)', '2027-07-05', true, false, true),
    (p_clinic_id, 'Labor Day', '2027-09-06', true, false, true),
    (p_clinic_id, 'Columbus Day', '2027-10-11', true, false, true),
    (p_clinic_id, 'Veterans Day', '2027-11-11', true, false, true),
    (p_clinic_id, 'Thanksgiving Day', '2027-11-25', true, false, true),
    (p_clinic_id, 'Christmas Day (observed)', '2027-12-24', true, false, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
