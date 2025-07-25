-- Remove the problematic RLS policy first
DROP POLICY IF EXISTS "Users can insert their own profile during signup" ON public.users;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    clinic_uuid uuid;
BEGIN
    -- Extract clinic_id from user metadata (could be clinic_code that needs to be converted)
    IF NEW.raw_user_meta_data ->> 'clinic_code' IS NOT NULL THEN
        -- Look up clinic_id by clinic_code
        SELECT id INTO clinic_uuid 
        FROM public.clinics 
        WHERE clinic_code = NEW.raw_user_meta_data ->> 'clinic_code';
    ELSIF NEW.raw_user_meta_data ->> 'clinic_id' IS NOT NULL THEN
        -- Use clinic_id directly if provided
        clinic_uuid := (NEW.raw_user_meta_data ->> 'clinic_id')::uuid;
    END IF;

    -- Insert user profile
    INSERT INTO public.users (
        id,
        name,
        email,
        role,
        clinic_id
    ) VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'name',
        NEW.email,
        NEW.raw_user_meta_data ->> 'role',
        clinic_uuid
    );

    RETURN NEW;
END;
$$;

-- Create trigger that fires when a user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();