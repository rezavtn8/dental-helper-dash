-- Fix search_path security warnings for existing functions
ALTER FUNCTION public.validate_email SET search_path = 'public';
ALTER FUNCTION public.validate_clinic_code SET search_path = 'public';
ALTER FUNCTION public.sanitize_text_input SET search_path = 'public';
ALTER FUNCTION public.validate_user_input SET search_path = 'public';
ALTER FUNCTION public.validate_clinic_input SET search_path = 'public';