-- Create an RPC to fetch a user's join requests with safe clinic info, bypassing RLS issues
CREATE OR REPLACE FUNCTION public.get_user_join_requests()
RETURNS TABLE (
  id uuid,
  status text,
  requested_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  denial_reason text,
  clinic_id uuid,
  clinic_name text,
  clinic_code text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    jr.id,
    jr.status,
    jr.requested_at,
    jr.reviewed_at,
    jr.denial_reason,
    jr.clinic_id,
    c.name AS clinic_name,
    c.clinic_code
  FROM public.join_requests jr
  LEFT JOIN public.clinics c ON c.id = jr.clinic_id
  WHERE jr.user_id = auth.uid()
  ORDER BY jr.requested_at DESC;
$function$;