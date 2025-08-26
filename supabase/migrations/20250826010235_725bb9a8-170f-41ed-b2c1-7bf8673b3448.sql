CREATE OR REPLACE FUNCTION public.set_assistant_pin(p_clinic_id uuid, p_first_name text, p_pin text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.users 
  SET 
    pin = p_pin,
    pin_changed_at = now(),
    must_change_pin = false,
    pin_attempts = 0,
    pin_locked_until = NULL
  WHERE 
    clinic_id = p_clinic_id
    AND role = 'assistant'
    AND is_active = true
    AND LOWER(TRIM(split_part(name, ' ', 1))) = LOWER(TRIM(p_first_name))
    AND (pin IS NULL OR pin = '');
    
  RETURN FOUND;
END;
$function$;