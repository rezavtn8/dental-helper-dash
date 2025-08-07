-- Remove PIN-related columns from users table since we're moving to email/password authentication only
ALTER TABLE public.users 
DROP COLUMN IF EXISTS pin,
DROP COLUMN IF EXISTS pin_attempts,
DROP COLUMN IF EXISTS pin_locked_until,
DROP COLUMN IF EXISTS must_change_pin,
DROP COLUMN IF EXISTS pin_changed_at,
DROP COLUMN IF EXISTS display_order;

-- Update the handle_new_user function to work with the simplified approach
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    clinic_uuid uuid;
BEGIN
    -- Extract clinic_id from user metadata
    IF NEW.raw_user_meta_data ->> 'clinic_id' IS NOT NULL THEN
        clinic_uuid := (NEW.raw_user_meta_data ->> 'clinic_id')::uuid;
    END IF;

    -- Insert user profile
    INSERT INTO public.users (
        id,
        name,
        email,
        role,
        clinic_id,
        is_active
    ) VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'name',
        NEW.email,
        NEW.raw_user_meta_data ->> 'role',
        clinic_uuid,
        true
    );

    RETURN NEW;
END;
$function$;