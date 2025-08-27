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