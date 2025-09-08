export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  category?: string;
  specialty?: string;
  'due-type'?: string;
  recurrence?: string;
  priority?: string;
  owner_notes?: string;
  checklist?: any;
  attachments?: any;
  clinic_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  is_enabled?: boolean;
  start_date?: string;
  next_generation_date?: string;
  last_generated_date?: string;
  tasks_count?: number;
  source_type?: string;
}

export interface TaskTemplateInput {
  title: string;
  description?: string;
  category?: string;
  specialty?: string;
  'due-type'?: string;
  recurrence?: string;
  priority?: string;
  owner_notes?: string;
  checklist?: any;
  attachments?: any;
  clinic_id: string;
  start_date?: string;
  is_enabled?: boolean;
  source_type?: string;
}

export interface ImportableTaskTemplate extends TaskTemplateInput {
  tasks?: ImportableTask[];
}

export interface ImportableTask {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  'due-type'?: string;
  'due-date'?: string;
  custom_due_date?: string;
  recurrence?: string;
  owner_notes?: string;
  assigned_to?: string;
  checklist_items?: string[];
  attachments?: any;
}

export interface TemplateGenerationSettings {
  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  enabled: boolean;
  start_date?: string;
  end_date?: string;
  working_days_only?: boolean;
}

export interface TemplateMetrics {
  total_templates: number;
  active_templates: number;
  tasks_generated_today: number;
  tasks_generated_this_week: number;
  most_used_template?: TaskTemplate;
}