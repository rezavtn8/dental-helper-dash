-- Fix RLS issue by updating the function to use SECURITY DEFINER properly
-- and ensuring it bypasses RLS when creating users

-- Drop and recreate the trigger to ensure it's working properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to have proper permissions
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

    -- Insert user profile (this will run with SECURITY DEFINER privileges)
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
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$function$;

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();