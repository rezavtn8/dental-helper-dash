/**
 * Custom error classes for different application scenarios
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization', 
  VALIDATION = 'validation',
  DATABASE = 'database',
  NETWORK = 'network',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  USER_INPUT = 'user_input'
}

export interface ErrorContext {
  userId?: string;
  clinicId?: string;
  action?: string;
  component?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

export abstract class AppError extends Error {
  public readonly name: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly context: ErrorContext;
  public readonly isOperational: boolean;
  public readonly userMessage: string;

  constructor(
    message: string,
    userMessage: string,
    severity: ErrorSeverity,
    category: ErrorCategory,
    code: string,
    context: ErrorContext = {},
    isOperational = true
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.severity = severity;
    this.category = category;
    this.code = code;
    this.context = {
      ...context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };
    this.isOperational = isOperational;
    this.userMessage = userMessage;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message: string,
    userMessage: string = 'Authentication failed. Please try again.',
    code: string = 'AUTH_FAILED',
    context: ErrorContext = {}
  ) {
    super(message, userMessage, ErrorSeverity.HIGH, ErrorCategory.AUTHENTICATION, code, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string,
    userMessage: string = 'You do not have permission to perform this action.',
    code: string = 'AUTH_DENIED',
    context: ErrorContext = {}
  ) {
    super(message, userMessage, ErrorSeverity.HIGH, ErrorCategory.AUTHORIZATION, code, context);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly validationRules?: string[];

  constructor(
    message: string,
    userMessage: string = 'Please check your input and try again.',
    code: string = 'VALIDATION_FAILED',
    context: ErrorContext = {},
    field?: string,
    validationRules?: string[]
  ) {
    super(message, userMessage, ErrorSeverity.MEDIUM, ErrorCategory.VALIDATION, code, context);
    this.field = field;
    this.validationRules = validationRules;
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    userMessage: string = 'A database error occurred. Please try again later.',
    code: string = 'DB_ERROR',
    context: ErrorContext = {}
  ) {
    super(message, userMessage, ErrorSeverity.HIGH, ErrorCategory.DATABASE, code, context);
  }
}

export class NetworkError extends AppError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(
    message: string,
    userMessage: string = 'Network error. Please check your connection and try again.',
    code: string = 'NETWORK_ERROR',
    context: ErrorContext = {},
    statusCode?: number,
    endpoint?: string
  ) {
    super(message, userMessage, ErrorSeverity.MEDIUM, ErrorCategory.NETWORK, code, context);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

export class BusinessLogicError extends AppError {
  constructor(
    message: string,
    userMessage: string,
    code: string = 'BUSINESS_LOGIC_ERROR',
    context: ErrorContext = {}
  ) {
    super(message, userMessage, ErrorSeverity.MEDIUM, ErrorCategory.BUSINESS_LOGIC, code, context);
  }
}

export class SystemError extends AppError {
  constructor(
    message: string,
    userMessage: string = 'A system error occurred. Please try again later.',
    code: string = 'SYSTEM_ERROR',
    context: ErrorContext = {}
  ) {
    super(message, userMessage, ErrorSeverity.CRITICAL, ErrorCategory.SYSTEM, code, context);
  }
}

/**
 * Helper function to determine if an error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Helper function to extract user-safe message from any error
 */
export function getUserMessage(error: Error): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  
  // Sanitize generic errors
  const message = error.message.toLowerCase();
  
  // Don't expose internal details
  if (message.includes('database') || 
      message.includes('sql') || 
      message.includes('internal') ||
      message.includes('server') ||
      message.includes('function')) {
    return 'A system error occurred. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Helper to create error context from current state
 */
export function createErrorContext(
  component?: string,
  action?: string,
  additionalData?: Record<string, any>
): ErrorContext {
  return {
    component,
    action,
    additionalData,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
  };
}