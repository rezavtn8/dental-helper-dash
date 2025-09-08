import { ImportableTaskTemplate, ImportableTask } from '@/types/template';
import { ImportProcessor, ImportResult, ParsedImportData } from './types';
import { validateImportData } from '../validators/importValidator';

export class CSVImportProcessor implements ImportProcessor {
  async processFile(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV must contain at least a header row and one data row');
      }

      const headers = this.parseCSVRow(lines[0]).map(h => h.replace(/"/g, '').toLowerCase().trim());
      
      if (!headers.includes('title')) {
        throw new Error('CSV must contain at least a "title" column');
      }

      const tasks: ImportableTask[] = [];
      const templateSettings = this.extractTemplateSettings();

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVRow(lines[i]).map(v => v.replace(/"/g, '').trim());
        
        if (values.every(v => !v)) continue; // Skip empty rows

        const task = this.parseTaskFromRow(headers, values, i);
        if (task) {
          tasks.push(task);
          // Use first row's settings for template defaults
          if (i === 1) {
            this.updateTemplateSettings(templateSettings, task);
          }
        }
      }

      if (tasks.length === 0) {
        throw new Error('No valid tasks found in CSV');
      }

      const template: ImportableTaskTemplate = {
        title: `Imported Template - ${new Date().toLocaleDateString()}`,
        description: `Bulk imported template with ${tasks.length} tasks from ${file.name}`,
        ...templateSettings,
        clinic_id: '', // Will be set by the hook
        source_type: 'csv_import',
        tasks
      };

      const validationResult = validateImportData({ template, tasks });
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      return {
        success: true,
        data: { template, tasks },
        summary: {
          totalTasks: tasks.length,
          validTasks: tasks.length,
          invalidTasks: 0,
          templateName: template.title
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown import error',
        data: null
      };
    }
  }

  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private parseTaskFromRow(headers: string[], values: string[], rowIndex: number): ImportableTask | null {
    const task: Partial<ImportableTask> = {};
    
    // Normalize headers (handle both underscores and hyphens)
    const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/_/g, '-'));

    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      if (!value) return;
      
      const normalizedHeader = header.toLowerCase().replace(/_/g, '-');

      switch (normalizedHeader) {
        case 'title':
          task.title = value;
          break;
        case 'description':
          task.description = value;
          break;
        case 'category':
          task.category = value;
          break;
        case 'priority':
          task.priority = value;
          break;
        case 'due-type':
        case 'duetype':
          task['due-type'] = value;
          break;
        case 'due-date':
        case 'duedate':
          if (this.isValidDate(value)) {
            task['due-date'] = new Date(value).toISOString();
          }
          break;
        case 'custom-due-date':
        case 'customduedate':
          if (this.isValidDate(value)) {
            task.custom_due_date = new Date(value).toISOString();
          }
          break;
        case 'recurrence':
          task.recurrence = value;
          break;
        case 'owner-notes':
        case 'ownernotes':
          task.owner_notes = value;
          break;
        case 'assigned-to':
        case 'assignedto':
          task.assigned_to = value;
          break;
        case 'checklist-items':
        case 'checklistitems':
        case 'checklist':
          task.checklist_items = value.split('|').filter(item => item.trim());
          break;
        case 'attachments':
          try {
            task.attachments = JSON.parse(value);
          } catch {
            task.attachments = value;
          }
          break;
      }
    });

    if (!task.title || task.title.length < 2) {
      console.warn(`Skipping row ${rowIndex} - invalid or missing title`);
      return null;
    }

    return {
      title: task.title,
      description: task.description || '',
      category: task.category || 'operational',
      priority: task.priority || 'medium',
      'due-type': task['due-type'] || 'anytime',
      'due-date': task['due-date'],
      custom_due_date: task.custom_due_date,
      recurrence: task.recurrence || 'once',
      owner_notes: task.owner_notes || '',
      assigned_to: task.assigned_to,
      checklist_items: task.checklist_items || [],
      attachments: task.attachments
    };
  }

  private extractTemplateSettings() {
    return {
      category: 'operational',
      specialty: 'general',
      'due-type': 'anytime',
      recurrence: 'once',
      priority: 'medium',
      source_type: 'import'
    };
  }

  private updateTemplateSettings(settings: any, task: ImportableTask) {
    if (task.category) settings.category = task.category;
    if (task['due-type']) settings['due-type'] = task['due-type'];
    if (task.recurrence) settings.recurrence = task.recurrence;
    if (task.priority) settings.priority = task.priority;
  }

  private isValidDate(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  getSupportedFormats(): string[] {
    return ['.csv', 'text/csv'];
  }

  getTemplateHeaders(): string[] {
    return [
      'title',
      'description', 
      'category',
      'priority',
      'due-type',
      'due-date',
      'custom-due-date',
      'recurrence',
      'owner-notes',
      'assigned-to',
      'checklist-items',
      'attachments'
    ];
  }

  generateTemplate(): string {
    const headers = this.getTemplateHeaders();
    const sampleData = [
      ['Morning Opening Routine', 'Complete checklist for opening the clinic', 'operational', 'high', 'before-opening', '2024-01-15T09:00:00Z', '', 'daily', 'Must be completed before first patient', '', 'Unlock doors|Turn on lights|Check temperature', ''],
      ['Equipment Check', 'Daily equipment maintenance check', 'operational', 'medium', 'anytime', '', '', 'daily', 'Check all equipment is functioning', '', 'Test X-ray machine|Check suction units|Verify autoclave', ''],
      ['Weekly Deep Clean', 'Thorough cleaning of all areas', 'operational', 'medium', 'end-of-week', '', '', 'weekly', 'Schedule for Friday evenings', 'Dr. Smith', 'Deep clean operatories|Sanitize equipment|Mop floors', '']
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }
}