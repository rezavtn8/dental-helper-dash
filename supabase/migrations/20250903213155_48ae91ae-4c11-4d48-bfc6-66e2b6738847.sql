-- Fix session data exposure by creating secure session monitoring function
CREATE OR REPLACE FUNCTION public.get_secure_session_metrics()
RETURNS TABLE(metric text, value bigint, period text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  -- Only return essential session metrics, no sensitive data
  SELECT
    'active_sessions'::text as metric,
    count(*) as value,
    'current'::text as period  
  FROM public.user_sessions s
  JOIN public.users u ON s.user_id = u.id
  WHERE s.is_active = true 
    AND s.expires_at > now()
    AND u.clinic_id = get_current_user_clinic_id()
    AND get_current_user_role() = 'owner'
  UNION ALL
  SELECT
    'total_team_members'::text as metric,
    count(*) as value,
    'current'::text as period
  FROM public.users
  WHERE clinic_id = get_current_user_clinic_id()
    AND is_active = true
    AND get_current_user_role() = 'owner'
  UNION ALL
  SELECT
    'recent_logins'::text as metric,
    count(*) as value,
    'last_24h'::text as period
  FROM public.users
  WHERE clinic_id = get_current_user_clinic_id()
    AND last_login > (now() - interval '24 hours')
    AND get_current_user_role() = 'owner';
$function$;

-- Update security metrics function to use secure session data
CREATE OR REPLACE FUNCTION public.get_security_metrics()
RETURNS TABLE(metric text, value bigint, period text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  -- Only owners can access security metrics
  SELECT 
    'failed_logins'::text as metric,
    count(*) as value,
    'last_hour'::text as period
  FROM public.rate_limits 
  WHERE operation = 'login_attempt' 
    AND created_at > (now() - interval '1 hour')
    AND get_current_user_role() = 'owner'
  UNION ALL
  SELECT 
    'invitation_attempts'::text as metric,
    count(*) as value, 
    'last_hour'::text as period
  FROM public.rate_limits
  WHERE operation = 'create_invitation'
    AND created_at > (now() - interval '1 hour')
    AND get_current_user_role() = 'owner'
  UNION ALL
  SELECT
    'secure_active_sessions'::text as metric,
    count(*) as value,
    'current'::text as period  
  FROM public.user_sessions s
  JOIN public.users u ON s.user_id = u.id
  WHERE s.is_active = true 
    AND s.expires_at > now()
    AND u.clinic_id = get_current_user_clinic_id()
    AND get_current_user_role() = 'owner'
  UNION ALL
  SELECT
    'pending_invitations'::text as metric,
    count(*) as value,
    'current'::text as period
  FROM public.invitations 
  WHERE status = 'pending' 
    AND expires_at > now()
    AND clinic_id = get_current_user_clinic_id()
    AND get_current_user_role() = 'owner';
$function$;