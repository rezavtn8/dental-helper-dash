import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AuthError {
  code?: string;
  message: string;
  details?: string;
  timestamp: Date;
}

interface UseAuthErrorReturn {
  errors: AuthError[];
  addError: (message: string, code?: string, details?: string) => void;
  clearErrors: () => void;
  handleAuthError: (error: any) => string;
}

export const useAuthError = (): UseAuthErrorReturn => {
  const [errors, setErrors] = useState<AuthError[]>([]);

  const addError = useCallback((message: string, code?: string, details?: string) => {
    const error: AuthError = {
      code,
      message,
      details,
      timestamp: new Date(),
    };
    
    setErrors(prev => [error, ...prev.slice(0, 9)]); // Keep last 10 errors
    console.error('Auth Error:', error);
    
    // Show user-friendly toast
    toast.error(message, {
      description: details,
      duration: 5000,
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleAuthError = useCallback((error: any): string => {
    let userMessage = 'An authentication error occurred';
    let code = error?.code || 'unknown';
    let details = '';

    // Handle specific Supabase auth errors
    switch (error?.message || error) {
      case 'Invalid login credentials':
        userMessage = 'Invalid email or password';
        details = 'Please check your credentials and try again';
        break;
      case 'Email not confirmed':
        userMessage = 'Email not verified';
        details = 'Please check your email and click the verification link';
        break;
      case 'Too many requests':
        userMessage = 'Too many login attempts';
        details = 'Please wait a few minutes before trying again';
        break;
      case 'User already registered':
        userMessage = 'Email already in use';
        details = 'An account with this email already exists';
        break;
      case 'Signup disabled':
        userMessage = 'Registration is currently disabled';
        details = 'Please contact support for assistance';
        break;
      case 'Profile fetch timeout':
        userMessage = 'Connection timeout';
        details = 'Please check your internet connection and try again';
        break;
      default:
        if (error?.message) {
          userMessage = error.message;
        }
        details = error?.details || '';
    }

    addError(userMessage, code, details);
    return userMessage;
  }, [addError]);

  return {
    errors,
    addError,
    clearErrors,
    handleAuthError,
  };
};