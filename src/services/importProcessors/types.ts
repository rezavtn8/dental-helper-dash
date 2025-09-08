import { ImportableTaskTemplate, ImportableTask } from '@/types/template';

export interface ParsedImportData {
  template: ImportableTaskTemplate;
  tasks: ImportableTask[];
}

export interface ImportResult {
  success: boolean;
  data: ParsedImportData | null;
  error?: string;
  summary?: ImportSummary;
}

export interface ImportSummary {
  totalTasks: number;
  validTasks: number;
  invalidTasks: number;
  templateName: string;
  warnings?: string[];
}

export interface ImportProcessor {
  processFile(file: File): Promise<ImportResult>;
  getSupportedFormats(): string[];
  generateTemplate?(): string;
  getTemplateHeaders?(): string[];
}

export interface ImportProgress {
  stage: 'parsing' | 'validating' | 'creating_template' | 'creating_tasks' | 'complete';
  percentage: number;
  message: string;
  currentItem?: number;
  totalItems?: number;
}