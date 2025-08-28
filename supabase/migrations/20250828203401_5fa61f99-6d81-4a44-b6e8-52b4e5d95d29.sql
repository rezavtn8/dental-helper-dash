-- Create test clinic
INSERT INTO public.clinics (
  name, 
  clinic_code, 
  domain_slug, 
  address, 
  phone, 
  email,
  subscription_status,
  is_active
) VALUES (
  'Test Clinic',
  'TEST123',
  'test-clinic',
  '123 Test Street, Test City, TC 12345',
  '+1-555-0123',
  'admin@testclinic.com',
  'active',
  true
);

-- Note: The actual auth.users accounts need to be created through the signup process
-- After this migration, you can:
-- 1. Go to /setup and create an owner account with clinic code: TEST123
-- 2. Or manually sign up users and they'll be linked to this clinic