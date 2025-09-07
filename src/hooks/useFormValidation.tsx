import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  authSignInSchema,
  authSignUpSchema,
  clinicSetupSchema,
  joinClinicSchema,
  profileUpdateSchema,
  createTaskSchema,
  updateTaskSchema,
  taskNoteSchema,
  feedbackSchema,
  type AuthSignInData,
  type AuthSignUpData,
  type ClinicSetupData,
  type JoinClinicData,
  type ProfileUpdateData,
  type CreateTaskData,
  type UpdateTaskData,
  type TaskNoteData,
  type FeedbackData,
} from '@/lib/validation';

// Custom hook for auth sign in form
export const useAuthSignInForm = (defaultValues?: Partial<AuthSignInData>) => {
  return useForm<AuthSignInData>({
    resolver: zodResolver(authSignInSchema),
    defaultValues: {
      email: '',
      password: '',
      ...defaultValues,
    },
  });
};

// Custom hook for auth sign up form
export const useAuthSignUpForm = (defaultValues?: Partial<AuthSignUpData>) => {
  return useForm<AuthSignUpData>({
    resolver: zodResolver(authSignUpSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      ...defaultValues,
    },
  });
};

// Custom hook for clinic setup form
export const useClinicSetupForm = (defaultValues?: Partial<ClinicSetupData>) => {
  return useForm<ClinicSetupData>({
    resolver: zodResolver(clinicSetupSchema),
    defaultValues: {
      clinicName: '',
      clinicCode: '',
      ...defaultValues,
    },
  });
};

// Custom hook for join clinic form
export const useJoinClinicForm = (defaultValues?: Partial<JoinClinicData>) => {
  return useForm<JoinClinicData>({
    resolver: zodResolver(joinClinicSchema),
    defaultValues: {
      clinicCode: '',
      ...defaultValues,
    },
  });
};

// Custom hook for profile update form
export const useProfileUpdateForm = (defaultValues?: Partial<ProfileUpdateData>) => {
  return useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      ...defaultValues,
    },
  });
};

// Custom hook for create task form
export const useCreateTaskForm = (defaultValues?: Partial<CreateTaskData>) => {
  return useForm<CreateTaskData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      ...defaultValues,
    },
  });
};

// Custom hook for update task form
export const useUpdateTaskForm = (defaultValues?: Partial<UpdateTaskData>) => {
  return useForm<UpdateTaskData>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues,
  });
};

// Custom hook for task note form
export const useTaskNoteForm = (defaultValues?: Partial<TaskNoteData>) => {
  return useForm<TaskNoteData>({
    resolver: zodResolver(taskNoteSchema),
    defaultValues: {
      taskId: '',
      note: '',
      ...defaultValues,
    },
  });
};

// Custom hook for feedback form
export const useFeedbackForm = (defaultValues?: Partial<FeedbackData>) => {
  return useForm<FeedbackData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: '',
      message: '',
      feedbackType: 'general',
      ...defaultValues,
    },
  });
};

// Utility hook for handling form errors
export const useFormErrors = () => {
  const getFieldError = (error: any) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'Invalid input';
  };

  const hasFieldError = (error: any) => {
    return !!error;
  };

  return {
    getFieldError,
    hasFieldError,
  };
};