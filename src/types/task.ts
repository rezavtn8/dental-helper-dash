import { TaskStatus } from '@/lib/taskStatus';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: TaskStatus;
  'due-type': string;
  'due-date'?: string;
  category?: string;
  assigned_to: string | null;
  claimed_by?: string | null; // Track who claimed the task
  recurrence?: string;
  created_at: string;
  updated_at?: string;
  custom_due_date?: string;
  completed_by?: string | null;
  completed_at?: string;
  clinic_id?: string;
  created_by?: string;
  owner_notes?: string;
  checklist?: any;
  attachments?: any;
  template_id?: string;
  generated_date?: string; // Date when task was generated from template
  target_role?: string; // Role targeting for front desk vs assistant
}

export interface Assistant {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}