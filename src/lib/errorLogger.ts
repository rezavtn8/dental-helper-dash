import { AppError, ErrorSeverity, isOperationalError } from './errors';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorLogEntry {
  id?: string;
  error_message: string;
  user_message: string;
  severity: ErrorSeverity;
  category: string;
  error_code: string;
  user_id?: string;
  clinic_id?: string;
  component?: string;
  action?: string;
  stack_trace?: string;
  context: Record<string, any>;
  timestamp: string;
  environment: 'development' | 'production';
  session_id?: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private sessionId: string;
  private environment: 'development' | 'production';
  private userContext?: { userId: string; clinicId?: string };
  
  private constructor() {
    this.sessionId = this.generateSessionId();
    this.environment = import.meta.env.MODE === 'production' ? 'production' : 'development';
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.logError(new Error(event.message), {
        component: 'GlobalErrorHandler',
        action: 'uncaught_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'GlobalErrorHandler',
          action: 'unhandled_promise_rejection'
        }
      );
    });
  }

  public async logError(
    error: Error,
    context: {
      userId?: string;
      clinicId?: string;
      component?: string;
      action?: string;
      additionalData?: Record<string, any>;
    } = {}
  ): Promise<void> {
    try {
      const errorEntry: ErrorLogEntry = this.createErrorLogEntry(error, context);
      
      // In development, always log to console
      if (this.environment === 'development') {
        this.logToConsole(errorEntry);
      }
      
      // Log to external service based on severity
      if (this.shouldLogToService(error)) {
        await this.logToService(errorEntry);
      }
      
      // Log to database for all AppErrors or critical system errors
      if (error instanceof AppError || this.shouldLogToDatabase(error)) {
        await this.logToDatabase(errorEntry);
      }
      
    } catch (loggingError) {
      // Fallback logging - don't let logging errors break the app
      console.error('Error logging failed:', loggingError);
      console.error('Original error:', error);
    }
  }

  private shouldLogToDatabase(error: Error): boolean {
    // Log all errors in production
    if (this.environment === 'production') {
      return true;
    }
    
    // In development, log medium and above severity errors
    if (error instanceof AppError) {
      return error.severity !== ErrorSeverity.LOW;
    }
    
    // Log all non-AppError exceptions in development too
    return true;
  }

  private createErrorLogEntry(
    error: Error,
    context: {
      userId?: string;
      clinicId?: string;
      component?: string;
      action?: string;
      additionalData?: Record<string, any>;
    }
  ): ErrorLogEntry {
    const appError = error instanceof AppError ? error : null;
    
    // Use provided context or fall back to stored user context
    const userId = context.userId || this.userContext?.userId;
    const clinicId = context.clinicId || this.userContext?.clinicId;
    
    return {
      error_message: error.message,
      user_message: appError?.userMessage || 'An unexpected error occurred',
      severity: appError?.severity || ErrorSeverity.MEDIUM,
      category: appError?.category || 'unknown',
      error_code: appError?.code || 'UNKNOWN_ERROR',
      user_id: userId,
      clinic_id: clinicId,
      component: context.component || appError?.context.component,
      action: context.action || appError?.context.action,
      stack_trace: error.stack,
      context: {
        ...context.additionalData,
        ...(appError?.context || {}),
        isOperational: isOperationalError(error),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      timestamp: new Date().toISOString(),
      environment: this.environment,
      session_id: this.sessionId
    };
  }

  private shouldLogToService(error: Error): boolean {
    // Always log in production
    if (this.environment === 'production') {
      return true;
    }
    
    // In development, only log high/critical severity errors
    if (error instanceof AppError) {
      return error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL;
    }
    
    return false;
  }

  private logToConsole(errorEntry: ErrorLogEntry): void {
    const logLevel = this.getConsoleLogLevel(errorEntry.severity);
    console[logLevel]('🚨 Error logged:', {
      message: errorEntry.error_message,
      userMessage: errorEntry.user_message,
      severity: errorEntry.severity,
      category: errorEntry.category,
      code: errorEntry.error_code,
      component: errorEntry.component,
      action: errorEntry.action,
      context: errorEntry.context,
      timestamp: errorEntry.timestamp
    });
    
    if (errorEntry.stack_trace) {
      console[logLevel]('Stack trace:', errorEntry.stack_trace);
    }
  }

  private getConsoleLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'error';
    }
  }

  private async logToService(errorEntry: ErrorLogEntry): Promise<void> {
    // In a real application, this would send to external services like:
    // - Sentry
    // - LogRocket
    // - Datadog
    // - Custom logging endpoint
    
    // For now, we'll simulate external logging
    if (this.environment === 'production') {
      // Example: Send to hypothetical logging service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorEntry)
      // });
    }
  }

  private async logToDatabase(errorEntry: ErrorLogEntry): Promise<void> {
    try {
      // Log critical errors to database
      const { error } = await supabase
        .from('error_logs')
        .insert([{
          error_message: errorEntry.error_message,
          user_message: errorEntry.user_message,
          severity: errorEntry.severity,
          category: errorEntry.category,
          error_code: errorEntry.error_code,
          user_id: errorEntry.user_id,
          clinic_id: errorEntry.clinic_id,
          component: errorEntry.component,
          action: errorEntry.action,
          context: errorEntry.context,
          stack_trace: errorEntry.stack_trace,
          timestamp: errorEntry.timestamp,
          environment: errorEntry.environment
        }]);
      
      if (error) {
        console.warn('Failed to log error to database:', error);
      } else {
        console.log('Error successfully logged to database');
      }
    } catch (dbError) {
      console.warn('Database logging failed:', dbError);
    }
  }

  public setUserContext(userId: string, clinicId?: string): void {
    // Store user context for future error logs
    this.sessionId = `session_${userId}_${Date.now()}`;
    // Store context for automatic inclusion in error logs
    this.userContext = { userId, clinicId };
  }

  public clearUserContext(): void {
    this.sessionId = this.generateSessionId();
    this.userContext = undefined;
  }

  // Test method for verifying error logging functionality
  public async testErrorLogging(): Promise<void> {
    console.log('🧪 Testing error logging functionality...');
    
    try {
      // Test 1: Log a simple error
      const testError = new Error('Test error for logging verification');
      await this.logError(testError, {
        component: 'ErrorLogger',
        action: 'test_logging',
        additionalData: { test: true, timestamp: new Date().toISOString() }
      });
      
      // Test 2: Log a ValidationError (concrete AppError implementation)
      const { ValidationError } = await import('./errors');
      const validationError = new ValidationError(
        'Test ValidationError for database logging',
        'This is a test validation error to verify database logging functionality',
        'LOGGER_TEST',
        { component: 'ErrorLogger', action: 'test_validation_error' }
      );
      await this.logError(validationError);
      
      console.log('✅ Error logging test completed. Check console and database for logged entries.');
    } catch (error) {
      console.error('❌ Error logging test failed:', error);
    }
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Make test method available globally in development
if (import.meta.env.MODE === 'development') {
  (window as any).testErrorLogging = () => errorLogger.testErrorLogging();
  console.log('🧪 Error logging test available: Run testErrorLogging() in console');
}