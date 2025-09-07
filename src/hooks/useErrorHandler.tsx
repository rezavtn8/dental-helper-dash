import { useCallback } from 'react';
import { toast } from 'sonner';
import { AppError, getUserMessage, createErrorContext } from '@/lib/errors';
import { errorLogger } from '@/lib/errorLogger';
import { useAuth } from './useAuth';

export interface UseErrorHandlerOptions {
  component?: string;
  showToast?: boolean;
  logToService?: boolean;
}

export interface UseErrorHandlerReturn {
  handleError: (
    error: Error,
    action?: string,
    additionalContext?: Record<string, any>
  ) => Promise<void>;
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    action?: string,
    options?: { showSuccessToast?: boolean; successMessage?: string }
  ) => Promise<T | null>;
}

/**
 * Centralized error handling hook
 */
export const useErrorHandler = (options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn => {
  const { userProfile } = useAuth();
  const {
    component,
    showToast = true,
    logToService = true
  } = options;

  const handleError = useCallback(async (
    error: Error,
    action?: string,
    additionalContext?: Record<string, any>
  ): Promise<void> => {
    try {
      // Create error context
      const context = createErrorContext(component, action, additionalContext);
      
      // Add user context if available
      if (userProfile) {
        context.userId = userProfile.id;
        context.clinicId = userProfile.clinic_id || undefined;
      }

      // Log the error
      if (logToService) {
        await errorLogger.logError(error, {
          userId: context.userId,
          clinicId: context.clinicId,
          component: context.component,
          action: context.action,
          additionalData: context.additionalData
        });
      }

      // Show user-friendly toast message
      if (showToast) {
        const userMessage = getUserMessage(error);
        toast.error(userMessage, {
          description: error instanceof AppError ? error.context.action : undefined,
          duration: 5000,
        });
      }

    } catch (handlingError) {
      // Fallback error handling
      console.error('Error handler failed:', handlingError);
      console.error('Original error:', error);
      
      if (showToast) {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  }, [component, showToast, logToService, userProfile]);

  const handleAsyncOperation = useCallback(
    async (
      operation: () => Promise<any>,
      action?: string,
      options?: { showSuccessToast?: boolean; successMessage?: string }
    ): Promise<any> => {
      try {
        const result = await operation();
        
        // Show success toast if requested
        if (options?.showSuccessToast && options?.successMessage) {
          toast.success(options.successMessage);
        }
        
        return result;
      } catch (error) {
        await handleError(error as Error, action);
        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncOperation: handleAsyncOperation as <T>(
      operation: () => Promise<T>,
      action?: string,
      options?: { showSuccessToast?: boolean; successMessage?: string }
    ) => Promise<T | null>
  };
};

/**
 * Higher-order component wrapper for error handling
 */
export function withErrorHandling<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName?: string
): React.ComponentType<T> {
  return function ErrorHandledComponent(props: T) {
    return (
      <Component 
        {...props}
        errorHandler={useErrorHandler({ component: componentName })}
      />
    );
  };
}

/**
 * Error boundary hook for functional components
 */
export const useErrorBoundary = () => {
  const { handleError } = useErrorHandler();
  
  return {
    captureError: handleError
  };
};