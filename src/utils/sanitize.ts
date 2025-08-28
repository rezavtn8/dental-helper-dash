/**
 * Utility functions for sanitizing user input to prevent XSS attacks
 */

/**
 * Sanitizes text input by removing potentially dangerous HTML characters
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
 * Sanitizes HTML content by encoding special characters
 */
export const encodeHtml = (input: string): string => {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Sanitizes clinic code to only allow alphanumeric characters
 */
export const sanitizeClinicCode = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
};

/**
 * Validates and sanitizes email addresses
 */
export const sanitizeEmail = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '');
};

/**
 * Sanitizes numeric input to prevent injection
 */
export const sanitizeNumeric = (input: string): string => {
  if (!input) return '';
  
  return input.replace(/[^0-9]/g, '');
};