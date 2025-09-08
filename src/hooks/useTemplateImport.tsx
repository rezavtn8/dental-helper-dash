import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TemplateService } from '@/services/templateService';
import { TaskService } from '@/services/taskService';
import { CSVImportProcessor } from '@/services/importProcessors/csvImportProcessor';
import { ImportProcessor, ImportResult, ImportProgress } from '@/services/importProcessors/types';
import { sanitizeTemplateData, sanitizeTaskData } from '@/services/validators/importValidator';

interface UseTemplateImportOptions {
  clinicId: string;
  onSuccess?: () => void;
}

export function useTemplateImport({ clinicId, onSuccess }: UseTemplateImportOptions) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const { toast } = useToast();

  const processors: Record<string, ImportProcessor> = {
    csv: new CSVImportProcessor()
  };

  const updateProgress = useCallback((stage: ImportProgress['stage'], percentage: number, message: string, currentItem?: number, totalItems?: number) => {
    setProgress({ stage, percentage, message, currentItem, totalItems });
  }, []);

  const importFromFile = useCallback(async (file: File): Promise<boolean> => {
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive"
      });
      return false;
    }

    // Determine processor based on file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const processor = fileExtension === 'csv' ? processors.csv : null;

    if (!processor) {
      toast({
        title: "Unsupported Format",
        description: "Only CSV files are currently supported",
        variant: "destructive"
      });
      return false;
    }

    setIsImporting(true);
    setProgress(null);

    try {
      // Stage 1: Parse file
      updateProgress('parsing', 10, 'Parsing file...');
      const result: ImportResult = await processor.processFile(file);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to parse file');
      }

      // Stage 2: Validate data
      updateProgress('validating', 25, 'Validating data...');
      
      // Show warnings if any
      if (result.summary?.warnings && result.summary.warnings.length > 0) {
        toast({
          title: "Import Warnings",
          description: `${result.summary.warnings.length} warnings found. Import will continue.`,
          variant: "default"
        });
      }

      // Stage 3: Create template
      updateProgress('creating_template', 50, 'Creating template...');
      
      const sanitizedTemplate = sanitizeTemplateData({
        ...result.data.template,
        clinic_id: clinicId
      });

      const createdTemplate = await TemplateService.createTemplate(sanitizedTemplate);

      // Stage 4: Create tasks
      updateProgress('creating_tasks', 75, 'Creating tasks...', 0, result.data.tasks.length);

      const sanitizedTasks = result.data.tasks.map(task => sanitizeTaskData(task));
      const taskInputs = sanitizedTasks.map(task => ({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        'due-type': task['due-type'],
        'due-date': task['due-date'],
        custom_due_date: task.custom_due_date,
        recurrence: task.recurrence,
        owner_notes: task.owner_notes,
        assigned_to: task.assigned_to,
        checklist: task.checklist_items?.length ? task.checklist_items.map((item, idx) => ({
          id: `item-${idx + 1}`,
          title: item,
          completed: false
        })) : undefined,
        attachments: task.attachments,
        clinic_id: clinicId,
        created_by: createdTemplate.created_by
      }));

      const createdTasks = await TaskService.createTasksFromTemplate(
        createdTemplate,
        taskInputs,
        clinicId
      );

      // Stage 5: Complete
      updateProgress('complete', 100, 'Import completed successfully!');

      toast({
        title: "Import Successful",
        description: `Created template "${createdTemplate.title}" with ${createdTasks.length} tasks`,
      });

      onSuccess?.();
      return true;

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsImporting(false);
      setTimeout(() => setProgress(null), 2000); // Clear progress after 2 seconds
    }
  }, [clinicId, onSuccess, toast, updateProgress]);

  const downloadTemplate = useCallback((format: 'csv' = 'csv'): void => {
    const processor = processors[format];
    if (!processor || !processor.generateTemplate) {
      toast({
        title: "Error",
        description: "Template generation not supported for this format",
        variant: "destructive"
      });
      return;
    }

    try {
      const content = processor.generateTemplate();
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `task-import-template-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Template Downloaded",
        description: `${format.toUpperCase()} template downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate template file",
        variant: "destructive"
      });
    }
  }, [toast]);

  const getSupportedFormats = useCallback((): string[] => {
    return Object.values(processors).flatMap(processor => processor.getSupportedFormats());
  }, []);

  return {
    importFromFile,
    downloadTemplate,
    getSupportedFormats,
    isImporting,
    progress
  };
}