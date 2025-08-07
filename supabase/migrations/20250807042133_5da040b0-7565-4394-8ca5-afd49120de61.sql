-- Create user profile for the current authenticated user
INSERT INTO public.users (
    id,
    name,
    email,
    role,
    clinic_id,
    is_active
) VALUES (
    '9a24fac5-080d-416e-814e-b72d39cd8647',
    'Omid Dianat',
    'omid.dianat.dds@gmail.com',
    'owner',
    'b0b0785c-f460-45db-9f3d-9aa0179752e3', -- Using the same clinic_id from existing profile
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    clinic_id = EXCLUDED.clinic_id,
    is_active = EXCLUDED.is_active;