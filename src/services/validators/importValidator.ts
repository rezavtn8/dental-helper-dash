import { ImportableTaskTemplate, ImportableTask } from '@/types/template';
import { ParsedImportData } from '../importProcessors/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateImportData(data: ParsedImportData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate template
  const templateValidation = validateTemplate(data.template);
  errors.push(...templateValidation.errors);
  warnings.push(...templateValidation.warnings);

  // Validate tasks
  const tasksValidation = validateTasks(data.tasks);
  errors.push(...tasksValidation.errors);
  warnings.push(...tasksValidation.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function validateTemplate(template: ImportableTaskTemplate): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!template.title || template.title.trim().length < 2) {
    errors.push('Template title is required and must be at least 2 characters');
  }

  if (template.title && template.title.length > 200) {
    errors.push('Template title must be less than 200 characters');
  }

  // Validate category if provided
  const validCategories = ['operational', 'administrative', 'clinical', 'specialty', 'training', 'calendar'];
  if (template.category && !validCategories.includes(template.category)) {
    warnings.push(`Invalid category "${template.category}". Will default to "operational"`);
  }

  // Validate priority if provided
  const validPriorities = ['low', 'medium', 'high'];
  if (template.priority && !validPriorities.includes(template.priority)) {
    warnings.push(`Invalid priority "${template.priority}". Will default to "medium"`);
  }

  // Validate recurrence if provided
  const validRecurrences = ['once', 'daily', 'weekly', 'biweekly', 'monthly'];
  if (template.recurrence && !validRecurrences.includes(template.recurrence)) {
    warnings.push(`Invalid recurrence "${template.recurrence}". Will default to "once"`);
  }

  // Validate due-type if provided
  const validDueTypes = ['before_opening', 'before_1pm', 'end_of_day', 'end_of_week', 'anytime'];
  if (template['due-type'] && !validDueTypes.includes(template['due-type'])) {
    warnings.push(`Invalid due-type "${template['due-type']}". Will default to "anytime"`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

function validateTasks(tasks: ImportableTask[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!tasks || tasks.length === 0) {
    errors.push('At least one task is required');
    return { isValid: false, errors, warnings };
  }

  tasks.forEach((task, index) => {
    const taskNumber = index + 1;

    // Required fields
    if (!task.title || task.title.trim().length < 2) {
      errors.push(`Task ${taskNumber}: Title is required and must be at least 2 characters`);
    }

    if (task.title && task.title.length > 255) {
      errors.push(`Task ${taskNumber}: Title must be less than 255 characters`);
    }

    // Validate optional fields
    if (task.description && task.description.length > 1000) {
      warnings.push(`Task ${taskNumber}: Description is quite long (${task.description.length} characters)`);
    }

    if (task.owner_notes && task.owner_notes.length > 500) {
      warnings.push(`Task ${taskNumber}: Owner notes are quite long (${task.owner_notes.length} characters)`);
    }

    // Validate checklist items
    if (task.checklist_items && task.checklist_items.length > 20) {
      warnings.push(`Task ${taskNumber}: Has many checklist items (${task.checklist_items.length}). Consider splitting into multiple tasks`);
    }

    // Validate dates
    if (task['due-date'] && !isValidISODate(task['due-date'])) {
      warnings.push(`Task ${taskNumber}: Invalid due date format. Should be ISO 8601 format`);
    }

    if (task.custom_due_date && !isValidISODate(task.custom_due_date)) {
      warnings.push(`Task ${taskNumber}: Invalid custom due date format. Should be ISO 8601 format`);
    }

    // Validate assigned_to (should be a valid UUID or email)
    if (task.assigned_to && !isValidUUIDOrEmail(task.assigned_to)) {
      warnings.push(`Task ${taskNumber}: assigned_to should be a valid user ID or email address`);
    }
  });

  // Check for duplicate task titles
  const titles = tasks.map(task => task.title?.toLowerCase().trim()).filter(Boolean);
  const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
  if (duplicateTitles.length > 0) {
    warnings.push(`Found duplicate task titles: ${[...new Set(duplicateTitles)].join(', ')}`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString.includes('T');
}

function isValidUUIDOrEmail(value: string): boolean {
  // UUID pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  // Email pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return uuidPattern.test(value) || emailPattern.test(value);
}

export function sanitizeTemplateData(template: ImportableTaskTemplate): ImportableTaskTemplate {
  return {
    ...template,
    title: template.title?.trim(),
    description: template.description?.trim(),
    category: template.category || 'operational',
    priority: template.priority || 'medium',
    'due-type': template['due-type'] || 'anytime',
    recurrence: template.recurrence || 'once',
    owner_notes: template.owner_notes?.trim()
  };
}

export function sanitizeTaskData(task: ImportableTask): ImportableTask {
  return {
    ...task,
    title: task.title?.trim(),
    description: task.description?.trim(),
    category: task.category || 'operational',
    priority: task.priority || 'medium',
    'due-type': task['due-type'] || 'anytime',
    recurrence: task.recurrence || 'once',
    owner_notes: task.owner_notes?.trim(),
    checklist_items: task.checklist_items?.filter(item => item.trim().length > 0)
  };
}