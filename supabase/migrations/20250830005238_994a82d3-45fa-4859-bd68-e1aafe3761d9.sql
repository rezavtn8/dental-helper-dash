-- Fix search_path security warnings for existing functions
ALTER FUNCTION public.create_simple_invitation SET search_path = 'public';
ALTER FUNCTION public.accept_simple_invitation SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column SET search_path = 'public';
ALTER FUNCTION public.get_current_user_role SET search_path = 'public';
ALTER FUNCTION public.get_current_user_clinic_id SET search_path = 'public';