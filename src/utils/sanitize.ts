/**
 * Utility functions for sanitizing user input to prevent XSS attacks
 * Enhanced with server-side validation integration for maximum security
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Synchronous text sanitization for immediate use (client-side only)
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
};

/**
 * Enhanced async text sanitization with server-side validation
 */
export const sanitizeTextAsync = async (input: string): Promise<string> => {
  if (!input) return '';
  
  try {
    // Use server-side sanitization function for enhanced security
    const { data, error } = await supabase.rpc('sanitize_and_validate_input', {
      input_type: 'name',
      input_value: input
    });
    
    if (error) {
      console.warn('Server-side sanitization failed, using client-side fallback:', error);
      return sanitizeText(input);
    }
    
    return data || '';
  } catch (error) {
    console.warn('Sanitization error, using fallback:', error);
    return sanitizeText(input);
  }
};

/**
 * Sanitizes HTML content by encoding special characters
 */
export const encodeHtml = (input: string): string => {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Synchronous clinic code sanitization for immediate use
 */
export const sanitizeClinicCode = (input: string): string => {
  if (!input) return '';
  
  const sanitized = input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  
  return sanitized;
};

/**
 * Enhanced async clinic code sanitization with server-side validation
 */
export const sanitizeClinicCodeAsync = async (input: string): Promise<string> => {
  if (!input) return '';
  
  try {
    const { data, error } = await supabase.rpc('sanitize_and_validate_input', {
      input_type: 'clinic_code',
      input_value: input
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || '';
  } catch (error) {
    // Fallback to client-side validation
    const sanitized = sanitizeClinicCode(input);
    
    if (sanitized.length < 4 || sanitized.length > 10) {
      throw new Error('Clinic code must be 4-10 alphanumeric characters');
    }
    
    return sanitized;
  }
};

/**
 * Synchronous email sanitization for immediate use
 */
export const sanitizeEmail = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '');
};

/**
 * Enhanced async email validation and sanitization with server-side validation
 */
export const sanitizeEmailAsync = async (input: string): Promise<string> => {
  if (!input) return '';
  
  try {
    const { data, error } = await supabase.rpc('sanitize_and_validate_input', {
      input_type: 'email',
      input_value: input
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || '';
  } catch (error) {
    // Basic client-side validation as fallback
    const sanitized = sanitizeEmail(input);
    
    // Basic email regex validation
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    return sanitized;
  }
};

// Legacy compatibility exports
export const isValidEmail = (email: string): boolean => {
  const sanitized = sanitizeEmail(email);
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(sanitized);
};

export const isValidClinicCode = (code: string): boolean => {
  const sanitized = sanitizeClinicCode(code);
  return sanitized.length >= 4 && sanitized.length <= 10;
};

export const sanitizeAndValidateInput = async (type: string, value: string): Promise<string> => {
  switch (type) {
    case 'email':
      return sanitizeEmailAsync(value);
    case 'clinic_code':
      return sanitizeClinicCodeAsync(value);
    case 'name':
      return sanitizeTextAsync(value);
    default:
      return sanitizeText(value);
  }
};

/**
 * Sanitizes numeric input to prevent injection
 */
export const sanitizeNumeric = (input: string): string => {
  if (!input) return '';
  
  return input.replace(/[^0-9]/g, '');
};

/**
 * Sanitizes phone numbers with server-side validation
 */
export const sanitizePhone = async (input: string): Promise<string> => {
  if (!input) return '';
  
  try {
    const { data, error } = await supabase.rpc('sanitize_and_validate_input', {
      input_type: 'phone',
      input_value: input
    });
    
    if (error) {
      console.warn('Server-side phone sanitization failed, using fallback');
    } else {
      return data || '';
    }
  } catch (error) {
    console.warn('Phone sanitization error, using fallback:', error);
  }
  
  // Fallback to client-side sanitization
  const sanitized = input.replace(/[^0-9+\-\(\)\s]/g, '');
  if (sanitized.length > 20) {
    throw new Error('Phone number too long');
  }
  return sanitized;
};

/**
 * Rate limiting check for sensitive operations
 */
export const checkRateLimit = async (operation: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      operation_name: operation
    });
    
    if (error) {
      console.warn('Rate limit check failed:', error);
      return true; // Allow operation if check fails
    }
    
    return data;
  } catch (error) {
    console.warn('Rate limit error:', error);
    return true; // Allow operation if check fails
  }
};

/**
 * Log security events for monitoring
 */
export const logSecurityEvent = async (
  eventType: string, 
  details: Record<string, any> = {},
  severity: 'info' | 'warn' | 'error' = 'info'
): Promise<void> => {
  try {
    await supabase.rpc('log_security_event', {
      event_type: eventType,
      event_details: details,
      severity
    });
  } catch (error) {
    console.warn('Security event logging failed:', error);
  }
};