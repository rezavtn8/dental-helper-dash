CREATE OR REPLACE FUNCTION public.check_assistant_exists(p_clinic_id uuid, p_first_name text)
 RETURNS TABLE(user_id uuid, user_name text, user_email text, has_pin boolean, must_create_pin boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    (u.pin IS NOT NULL AND u.pin != '') as has_pin,
    (u.pin IS NULL OR u.pin = '') as must_create_pin
  FROM public.users u
  WHERE 
    u.clinic_id = p_clinic_id
    AND u.role = 'assistant'
    AND u.is_active = true
    AND LOWER(TRIM(split_part(u.name, ' ', 1))) = LOWER(TRIM(p_first_name));
END;
$function$;