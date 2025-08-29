/**
 * Enhanced security utilities for sanitizing user input and preventing attacks
 * Now integrated with database-level validation functions
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Comprehensive input validation and sanitization using database functions
 */
export const sanitizeAndValidateInput = async (
  inputType: 'email' | 'clinic_code' | 'name' | 'phone' | 'text',
  inputValue: string
): Promise<{ sanitized: string; isValid: boolean; error?: string }> => {
  if (!inputValue) {
    return { sanitized: '', isValid: false, error: 'Input is required' };
  }

  try {
    const { data, error } = await supabase.rpc('sanitize_and_validate_input', {
      input_type: inputType,
      input_value: inputValue
    });

    if (error) {
      return { sanitized: inputValue, isValid: false, error: error.message };
    }

    return { sanitized: data, isValid: true };
  } catch (error) {
    console.error('Sanitization error:', error);
    return { sanitized: inputValue, isValid: false, error: 'Validation failed' };
  }
};

/**
 * Client-side sanitization for immediate feedback (before server validation)
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ''); // Remove non-printable characters
};

/**
 * Enhanced HTML encoding with XSS protection
 */
export const encodeHtml = (input: string): string => {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Client-side clinic code validation with immediate feedback
 */
export const sanitizeClinicCode = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 10); // Enforce maximum length
};

/**
 * Enhanced email validation with comprehensive checks
 */
export const sanitizeEmail = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '')
    .substring(0, 254); // RFC 5321 limit
};

/**
 * Validate email format client-side
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate clinic code format client-side
 */
export const isValidClinicCode = (code: string): boolean => {
  const codeRegex = /^[A-Z0-9]{4,10}$/;
  return codeRegex.test(code);
};

/**
 * Enhanced password strength validation
 */
export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[];
  strength: 'weak' | 'medium' | 'strong'
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  const isValid = errors.length === 0;
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (isValid) {
    const hasExtraLength = password.length >= 12;
    const hasMultipleSpecial = (password.match(/[^A-Za-z0-9]/g) || []).length >= 2;
    const hasNumbers = (password.match(/[0-9]/g) || []).length >= 2;
    
    if (hasExtraLength && hasMultipleSpecial && hasNumbers) {
      strength = 'strong';
    } else if (hasExtraLength || (hasMultipleSpecial && hasNumbers)) {
      strength = 'medium';
    }
  }
  
  return { isValid, errors, strength };
};

/**
 * Sanitize phone number input
 */
export const sanitizePhone = (input: string): string => {
  if (!input) return '';
  
  return input.replace(/[^0-9+\-\(\)\s]/g, '').substring(0, 20);
};

/**
 * Sanitizes numeric input to prevent injection
 */
export const sanitizeNumeric = (input: string): string => {
  if (!input) return '';
  
  return input.replace(/[^0-9]/g, '');
};

/**
 * Security event logging
 */
export const logSecurityEvent = async (
  eventType: string,
  details: Record<string, any> = {},
  severity: 'info' | 'warn' | 'error' = 'info'
) => {
  try {
    await supabase.rpc('log_security_event', {
      event_type: eventType,
      event_details: details,
      severity
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};