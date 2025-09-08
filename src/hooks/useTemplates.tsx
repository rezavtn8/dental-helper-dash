import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TemplateService } from '@/services/templateService';
import { TaskService } from '@/services/taskService';
import { TaskTemplate } from '@/types/template';

interface UseTemplatesOptions {
  clinicId: string;
  autoRefresh?: boolean;
}

export function useTemplates({ clinicId, autoRefresh = false }: UseTemplatesOptions) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    if (!clinicId) return;
    
    try {
      setLoading(true);
      
      // Import defaults if needed
      await TemplateService.importFromDefaults(clinicId);
      
      // Fetch templates
      const data = await TemplateService.getTemplates(clinicId);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [clinicId, toast]);

  const createTemplate = useCallback(async (templateData: any) => {
    try {
      await TemplateService.createTemplate({
        ...templateData,
        clinic_id: clinicId
      });
      
      toast({
        title: "Success",
        description: "Template created successfully"
      });
      
      await fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      });
      throw error;
    }
  }, [clinicId, fetchTemplates, toast]);

  const updateTemplate = useCallback(async (id: string, updates: any) => {
    try {
      await TemplateService.updateTemplate(id, updates);
      
      toast({
        title: "Success",
        description: "Template updated successfully"
      });
      
      await fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      });
      throw error;
    }
  }, [fetchTemplates, toast]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await TemplateService.deleteTemplate(id);
      
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
      
      setSelectedTemplates(prev => prev.filter(selectedId => selectedId !== id));
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
      throw error;
    }
  }, [fetchTemplates, toast]);

  const bulkDeleteTemplates = useCallback(async (ids: string[]) => {
    try {
      await TemplateService.bulkDeleteTemplates(ids);
      
      toast({
        title: "Success",
        description: `${ids.length} templates deleted successfully`
      });
      
      setSelectedTemplates([]);
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting templates:', error);
      toast({
        title: "Error",
        description: "Failed to delete templates",
        variant: "destructive"
      });
      throw error;
    }
  }, [fetchTemplates, toast]);

  const duplicateTemplate = useCallback(async (templateId: string) => {
    try {
      await TemplateService.duplicateTemplate(templateId, clinicId);
      
      toast({
        title: "Success",
        description: "Template duplicated successfully"
      });
      
      await fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive"
      });
      throw error;
    }
  }, [clinicId, fetchTemplates, toast]);

  const generateTasksFromTemplate = useCallback(async (templateId: string) => {
    try {
      const tasks = await TaskService.generateTasksFromTemplate(templateId);
      
      toast({
        title: "Success",
        description: `Generated ${tasks.length} tasks from template`
      });
      
      return tasks;
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate tasks from template",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const cleanupDuplicates = useCallback(async () => {
    try {
      const deletedIds = await TemplateService.cleanupDuplicates(templates);
      
      if (deletedIds.length === 0) {
        toast({
          title: "No Duplicates Found",
          description: "All templates are unique"
        });
      } else {
        toast({
          title: "Success",
          description: `Removed ${deletedIds.length} duplicate templates`
        });
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast({
        title: "Error",
        description: "Failed to clean duplicate templates",
        variant: "destructive"
      });
    }
  }, [templates, fetchTemplates, toast]);

  const toggleTemplateSelection = useCallback((templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  }, []);

  const selectAllTemplates = useCallback((selectAll: boolean) => {
    setSelectedTemplates(selectAll ? templates.map(t => t.id) : []);
  }, [templates]);

  const clearSelection = useCallback(() => {
    setSelectedTemplates([]);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && !loading) {
      interval = setInterval(fetchTemplates, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, loading, fetchTemplates]);

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
  }, [clinicId]);

  return {
    templates,
    loading,
    selectedTemplates,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    bulkDeleteTemplates,
    duplicateTemplate,
    generateTasksFromTemplate,
    cleanupDuplicates,
    toggleTemplateSelection,
    selectAllTemplates,
    clearSelection
  };
}