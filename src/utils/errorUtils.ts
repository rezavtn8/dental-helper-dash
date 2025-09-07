import { 
  AppError, 
  AuthenticationError, 
  AuthorizationError, 
  ValidationError,
  DatabaseError,
  NetworkError,
  BusinessLogicError,
  SystemError,
  createErrorContext
} from '@/lib/errors';

/**
 * Utility functions for creating and handling specific error scenarios
 */

export const ErrorUtils = {
  /**
   * Authentication related errors
   */
  auth: {
    invalidCredentials: (context?: Record<string, any>) => 
      new AuthenticationError(
        'Invalid login credentials provided',
        'Invalid email or password. Please try again.',
        'INVALID_CREDENTIALS',
        createErrorContext('AuthWidget', 'login_attempt', context)
      ),
      
    emailNotConfirmed: (context?: Record<string, any>) => 
      new AuthenticationError(
        'Email address not confirmed',
        'Please check your email and click the verification link.',
        'EMAIL_NOT_CONFIRMED',
        createErrorContext('AuthWidget', 'email_confirmation', context)
      ),
      
    rateLimitExceeded: (context?: Record<string, any>) => 
      new AuthenticationError(
        'Too many login attempts',
        'Too many attempts. Please wait before trying again.',
        'RATE_LIMIT_EXCEEDED',
        createErrorContext('AuthWidget', 'rate_limit', context)
      ),
      
    sessionExpired: (context?: Record<string, any>) => 
      new AuthenticationError(
        'User session has expired',
        'Your session has expired. Please sign in again.',
        'SESSION_EXPIRED',
        createErrorContext('AuthProvider', 'session_check', context)
      ),

    profileNotFound: (context?: Record<string, any>) => 
      new AuthenticationError(
        'User profile not found',
        'Account setup incomplete. Please contact support.',
        'PROFILE_NOT_FOUND',
        createErrorContext('AuthProvider', 'profile_fetch', context)
      )
  },

  /**
   * Authorization related errors
   */
  authorization: {
    insufficientPermissions: (requiredRole: string, context?: Record<string, any>) => 
      new AuthorizationError(
        `User does not have required role: ${requiredRole}`,
        'You do not have permission to perform this action.',
        'INSUFFICIENT_PERMISSIONS',
        createErrorContext('PermissionGuard', 'permission_check', { requiredRole, ...context })
      ),
      
    clinicAccessDenied: (clinicId: string, context?: Record<string, any>) => 
      new AuthorizationError(
        `User not authorized to access clinic: ${clinicId}`,
        'You do not have access to this clinic.',
        'CLINIC_ACCESS_DENIED',
        createErrorContext('ClinicGuard', 'clinic_access', { clinicId, ...context })
      ),
      
    resourceAccessDenied: (resourceType: string, context?: Record<string, any>) => 
      new AuthorizationError(
        `Access denied to resource: ${resourceType}`,
        'You do not have permission to access this resource.',
        'RESOURCE_ACCESS_DENIED',
        createErrorContext('ResourceGuard', 'resource_access', { resourceType, ...context })
      )
  },

  /**
   * Validation related errors
   */
  validation: {
    invalidEmail: (email: string, context?: Record<string, any>) => 
      new ValidationError(
        `Invalid email format: ${email}`,
        'Please enter a valid email address.',
        'INVALID_EMAIL',
        createErrorContext('FormValidation', 'email_validation', context),
        'email',
        ['valid_email_format']
      ),
      
    passwordTooWeak: (context?: Record<string, any>) => 
      new ValidationError(
        'Password does not meet security requirements',
        'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
        'PASSWORD_TOO_WEAK',
        createErrorContext('FormValidation', 'password_validation', context),
        'password',
        ['min_8_chars', 'uppercase', 'lowercase', 'number']
      ),
      
    invalidClinicCode: (code: string, context?: Record<string, any>) => 
      new ValidationError(
        `Invalid clinic code format: ${code}`,
        'Clinic code must be 6-8 alphanumeric characters.',
        'INVALID_CLINIC_CODE',
        createErrorContext('ClinicSetup', 'clinic_code_validation', context),
        'clinicCode',
        ['6_8_chars', 'alphanumeric']
      ),
      
    requiredFieldMissing: (fieldName: string, context?: Record<string, any>) => 
      new ValidationError(
        `Required field missing: ${fieldName}`,
        `${fieldName} is required.`,
        'REQUIRED_FIELD_MISSING',
        createErrorContext('FormValidation', 'required_validation', context),
        fieldName,
        ['required']
      ),
      
    invalidPhoneNumber: (phone: string, context?: Record<string, any>) => 
      new ValidationError(
        `Invalid phone number format: ${phone}`,
        'Please enter a valid phone number.',
        'INVALID_PHONE',
        createErrorContext('FormValidation', 'phone_validation', context),
        'phone',
        ['valid_phone_format']
      )
  },

  /**
   * Database related errors
   */
  database: {
    connectionFailed: (context?: Record<string, any>) => 
      new DatabaseError(
        'Database connection failed',
        'Unable to connect to the database. Please try again later.',
        'DB_CONNECTION_FAILED',
        createErrorContext('DatabaseClient', 'connection', context)
      ),
      
    queryFailed: (query: string, context?: Record<string, any>) => 
      new DatabaseError(
        `Database query failed: ${query}`,
        'A database error occurred. Please try again.',
        'DB_QUERY_FAILED',
        createErrorContext('DatabaseClient', 'query_execution', { query, ...context })
      ),
      
    recordNotFound: (table: string, id: string, context?: Record<string, any>) => 
      new DatabaseError(
        `Record not found in ${table}: ${id}`,
        'The requested information could not be found.',
        'RECORD_NOT_FOUND',
        createErrorContext('DatabaseClient', 'record_fetch', { table, id, ...context })
      ),
      
    uniqueConstraintViolation: (field: string, context?: Record<string, any>) => 
      new DatabaseError(
        `Unique constraint violation on field: ${field}`,
        `This ${field} is already in use. Please choose a different one.`,
        'UNIQUE_CONSTRAINT_VIOLATION',
        createErrorContext('DatabaseClient', 'record_insert', { field, ...context })
      )
  },

  /**
   * Network related errors
   */
  network: {
    requestTimeout: (endpoint: string, context?: Record<string, any>) => 
      new NetworkError(
        `Request timeout for endpoint: ${endpoint}`,
        'Request timed out. Please check your connection and try again.',
        'REQUEST_TIMEOUT',
        createErrorContext('NetworkClient', 'request', context),
        408,
        endpoint
      ),
      
    serverError: (statusCode: number, endpoint: string, context?: Record<string, any>) => 
      new NetworkError(
        `Server error ${statusCode} for endpoint: ${endpoint}`,
        'A server error occurred. Please try again later.',
        'SERVER_ERROR',
        createErrorContext('NetworkClient', 'request', context),
        statusCode,
        endpoint
      ),
      
    networkUnavailable: (context?: Record<string, any>) => 
      new NetworkError(
        'Network connection unavailable',
        'No internet connection. Please check your connection and try again.',
        'NETWORK_UNAVAILABLE',
        createErrorContext('NetworkClient', 'connection_check', context)
      )
  },

  /**
   * Business logic errors
   */
  business: {
    clinicCodeExists: (code: string, context?: Record<string, any>) => 
      new BusinessLogicError(
        `Clinic code already exists: ${code}`,
        'This clinic code is already in use. Please choose a different one.',
        'CLINIC_CODE_EXISTS',
        createErrorContext('ClinicSetup', 'clinic_creation', { code, ...context })
      ),
      
    taskNotAssignable: (taskId: string, reason: string, context?: Record<string, any>) => 
      new BusinessLogicError(
        `Task ${taskId} cannot be assigned: ${reason}`,
        'This task cannot be assigned at this time.',
        'TASK_NOT_ASSIGNABLE',
        createErrorContext('TaskManagement', 'task_assignment', { taskId, reason, ...context })
      ),
      
    scheduleConflict: (startTime: string, endTime: string, context?: Record<string, any>) => 
      new BusinessLogicError(
        `Schedule conflict: ${startTime} - ${endTime}`,
        'This time slot conflicts with an existing schedule.',
        'SCHEDULE_CONFLICT',
        createErrorContext('ScheduleManagement', 'schedule_creation', { startTime, endTime, ...context })
      )
  },

  /**
   * System errors
   */
  system: {
    configurationError: (setting: string, context?: Record<string, any>) => 
      new SystemError(
        `System configuration error: ${setting}`,
        'A system configuration error occurred. Please contact support.',
        'CONFIGURATION_ERROR',
        createErrorContext('SystemConfig', 'config_load', { setting, ...context })
      ),
      
    serviceUnavailable: (service: string, context?: Record<string, any>) => 
      new SystemError(
        `Service unavailable: ${service}`,
        'A required service is temporarily unavailable. Please try again later.',
        'SERVICE_UNAVAILABLE',
        createErrorContext('ServiceClient', 'service_call', { service, ...context })
      )
  }
};

/**
 * Helper function to wrap async operations with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorFactory: (error: Error) => AppError
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw errorFactory(error as Error);
  }
}

/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(
  error: any,
  operation: string,
  context?: Record<string, any>
): AppError {
  if (!error) {
    return new SystemError('Unknown Supabase error', 'An unexpected error occurred');
  }

  // Handle specific Supabase error codes
  switch (error.code) {
    case 'PGRST116':
      return ErrorUtils.database.recordNotFound('record', 'unknown', context);
    case '23505': // unique_violation
      return ErrorUtils.database.uniqueConstraintViolation('field', context);
    case '23503': // foreign_key_violation
      return new DatabaseError(
        `Foreign key constraint violation during ${operation}`,
        'Related data not found. Please check your input.',
        'FOREIGN_KEY_VIOLATION',
        createErrorContext('SupabaseClient', operation, context)
      );
    default:
      return ErrorUtils.database.queryFailed(operation, { 
        supabaseError: error.message,
        ...context 
      });
  }
}