-- Re-initialize federal holidays for ALL existing clinics using the updated function
DO $$
DECLARE
  clinic_record RECORD;
BEGIN
  FOR clinic_record IN SELECT id FROM clinics WHERE is_active = true
  LOOP
    PERFORM initialize_federal_holidays(clinic_record.id);
  END LOOP;
END;
$$;

NOTIFY pgrst, 'reload schema';