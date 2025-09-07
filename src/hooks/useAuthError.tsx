import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  AuthenticationError, 
  ValidationError,
  createErrorContext 
} from '@/lib/errors';
import { ErrorUtils } from '@/utils/errorUtils';
import { errorLogger } from '@/lib/errorLogger';

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

    // Sanitize error messages to prevent information disclosure
    const sanitizeErrorMessage = (msg: string) => {
      // Don't expose internal system details
      const sensitivePatterns = [
        /database/i,
        /internal/i,
        /server/i,
        /sql/i,
        /function/i
      ];
      
      for (const pattern of sensitivePatterns) {
        if (pattern.test(msg)) {
          return 'A system error occurred. Please try again later.';
        }
      }
      return msg;
    };

    // Handle specific Supabase auth errors with enhanced security
    switch (error?.message || error) {
      case 'Invalid login credentials':
      case 'Email not confirmed':
      case 'Invalid email or password':
        // Use generic message to prevent email enumeration
        userMessage = 'Invalid email or password';
        details = 'Please check your credentials and try again';
        break;
      case 'Email not confirmed':
        userMessage = 'Email not verified';
        details = 'Please check your email and click the verification link';
        break;
      case 'Too many requests':
      case 'Rate limit exceeded':
        userMessage = 'Too many attempts';
        details = 'Please wait before trying again for security';
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
      case 'Password should be at least 6 characters':
        userMessage = 'Password too weak';
        details = 'Please use a stronger password with at least 6 characters';
        break;
      case 'Invalid email format':
        userMessage = 'Invalid email';
        details = 'Please enter a valid email address';
        break;
      default:
        if (error?.message) {
          userMessage = sanitizeErrorMessage(error.message);
        } else {
          userMessage = 'Authentication failed';
        }
        details = 'Please try again or contact support if the problem persists';
    }

    // Log security events for monitoring
    if (error?.message && (
      error.message.includes('Too many') || 
      error.message.includes('Rate limit') ||
      error.message.includes('Invalid login')
    )) {
      console.warn('Security event detected:', {
        type: 'auth_security_event',
        code,
        timestamp: new Date().toISOString(),
        // Don't log sensitive details
      });
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