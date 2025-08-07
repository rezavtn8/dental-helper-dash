-- Update the handle_new_user function to handle both email signup and OAuth properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    clinic_uuid uuid;
    user_role text;
    user_name text;
BEGIN
    -- Extract clinic_id from user metadata
    IF NEW.raw_user_meta_data ->> 'clinic_id' IS NOT NULL THEN
        clinic_uuid := (NEW.raw_user_meta_data ->> 'clinic_id')::uuid;
    END IF;

    -- Determine role - default to 'assistant' if not specified
    user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'assistant');
    
    -- Determine name - try various metadata fields
    user_name := COALESCE(
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'full_name',
        split_part(NEW.email, '@', 1),
        'User'
    );

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
        user_name,
        NEW.email,
        user_role,
        clinic_uuid,
        true
    );

    RETURN NEW;
END;
$function$;