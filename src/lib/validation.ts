import { z } from 'zod';
import { parsePhoneNumber } from 'libphonenumber-js';

// Email validation with proper regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Base schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .regex(emailRegex, 'Email format is invalid')
  .min(5, 'Email must be at least 5 characters')
  .max(100, 'Email must not exceed 100 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
  .trim();

export const clinicCodeSchema = z
  .string()
  .min(4, 'Clinic code must be at least 4 characters')
  .max(20, 'Clinic code must not exceed 20 characters')
  .regex(/^[A-Z0-9]+$/, 'Clinic code can only contain uppercase letters and numbers')
  .trim();

export const clinicNameSchema = z
  .string()
  .min(2, 'Clinic name must be at least 2 characters')
  .max(100, 'Clinic name must not exceed 100 characters')
  .regex(/^[a-zA-Z0-9\s\-'\.&()]+$/, 'Clinic name contains invalid characters')
  .trim();

// Phone number validation using libphonenumber-js
export const phoneSchema = z
  .string()
  .optional()
  .refine((phone) => {
    if (!phone || phone.trim() === '') return true; // Optional field
    try {
      const phoneNumber = parsePhoneNumber(phone, 'US'); // Default to US, but accepts international
      return phoneNumber.isValid();
    } catch {
      return false;
    }
  }, 'Please enter a valid phone number');

// Task-related schemas
export const taskTitleSchema = z
  .string()
  .min(1, 'Task title is required')
  .max(200, 'Task title must not exceed 200 characters')
  .trim();

export const taskDescriptionSchema = z
  .string()
  .max(2000, 'Task description must not exceed 2000 characters')
  .optional();

export const taskCategorySchema = z
  .string()
  .max(50, 'Category must not exceed 50 characters')
  .optional();

export const taskPrioritySchema = z
  .enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Priority must be low, medium, high, or urgent' })
  });

export const taskStatusSchema = z
  .enum(['pending', 'in_progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid task status' })
  });

// Note and feedback schemas
export const noteSchema = z
  .string()
  .min(1, 'Note is required')
  .max(5000, 'Note must not exceed 5000 characters')
  .trim();

export const feedbackTitleSchema = z
  .string()
  .min(1, 'Feedback title is required')
  .max(100, 'Feedback title must not exceed 100 characters')
  .trim();

export const feedbackMessageSchema = z
  .string()
  .min(1, 'Feedback message is required')
  .max(2000, 'Feedback message must not exceed 2000 characters')
  .trim();

// Date and time schemas
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed >= new Date('1900-01-01');
  }, 'Invalid date');

export const timeSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format');

// Composite schemas for forms
export const authSignUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const authSignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const clinicSetupSchema = z.object({
  clinicName: clinicNameSchema,
  clinicCode: clinicCodeSchema,
});

export const joinClinicSchema = z.object({
  clinicCode: clinicCodeSchema,
});

export const profileUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  category: taskCategorySchema,
  priority: taskPrioritySchema,
  due_date: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  recurrence: z.enum(['daily', 'weekly', 'monthly', 'none']).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
  status: taskStatusSchema.optional(),
});

export const taskNoteSchema = z.object({
  taskId: z.string().uuid(),
  note: noteSchema,
});

export const feedbackSchema = z.object({
  title: feedbackTitleSchema,
  message: feedbackMessageSchema,
  feedbackType: z.enum(['general', 'bug', 'feature', 'improvement']).optional(),
});

// Utility function to validate and sanitize input
export const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): { success: boolean; data?: T; error?: string } => {
  try {
    const result = schema.safeParse(input);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        error: result.error.errors.map(err => err.message).join(', ')
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Validation failed due to unexpected error'
    };
  }
};

// Type exports for TypeScript
export type AuthSignUpData = z.infer<typeof authSignUpSchema>;
export type AuthSignInData = z.infer<typeof authSignInSchema>;
export type ClinicSetupData = z.infer<typeof clinicSetupSchema>;
export type JoinClinicData = z.infer<typeof joinClinicSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;
export type TaskNoteData = z.infer<typeof taskNoteSchema>;
export type FeedbackData = z.infer<typeof feedbackSchema>;