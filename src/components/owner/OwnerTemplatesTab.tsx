import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Search, Upload, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import TemplateBuilder from './TemplateBuilder';
import TemplateList from './TemplateList';
import ImportTemplatesDialog from './ImportTemplatesDialog';

interface OwnerTemplatesTabProps {
  clinicId: string;
}

interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  category?: string;
  specialty?: string;
  checklist?: any;
  'due-type'?: string;
  recurrence?: string;
  owner_notes?: string;
  created_at: string;
  is_active: boolean;
  is_enabled?: boolean;
  start_date?: string;
  next_generation_date?: string;
  last_generated_date?: string;
}

export default function OwnerTemplatesTab({ clinicId }: OwnerTemplatesTabProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();

  const importDefaultTemplates = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get default templates
      const { data: defaultTemplates, error: defaultError } = await supabase
        .from('default_task_templates')
        .select('*')
        .eq('is_active', true);

      if (defaultError) throw defaultError;

      if (defaultTemplates && defaultTemplates.length > 0) {
        // Convert default templates to clinic templates
        const clinicTemplates = defaultTemplates.map(template => ({
          title: template.title,
          description: template.description,
          category: template.category,
          specialty: template.specialty,
          'due-type': template['due-type'],
          recurrence: template.recurrence,
          owner_notes: template.owner_notes,
          checklist: template.checklist,
          clinic_id: clinicId,
          created_by: user.user.id,
          is_active: true
        }));

        // Insert clinic templates
        const { error: insertError } = await supabase
          .from('task_templates')
          .insert(clinicTemplates);

        if (insertError) throw insertError;

        // Mark clinic as having defaults imported
        const { error: updateError } = await supabase
          .from('clinics')
          .update({ defaults_imported: true })
          .eq('id', clinicId);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: `Successfully imported ${defaultTemplates.length} default templates`,
        });
      }
    } catch (error) {
      console.error('Error importing default templates:', error);
      toast({
        title: "Error",
        description: "Failed to import default templates",
        variant: "destructive",
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      // Check if defaults have been imported
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('defaults_imported')
        .eq('id', clinicId)
        .maybeSingle();

      if (clinicError) throw clinicError;

      // If defaults haven't been imported, import them first
      if (!clinic?.defaults_imported) {
        await importDefaultTemplates();
      }

      // Fetch templates
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [clinicId]);

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateCreated = () => {
    setShowBuilder(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setShowBuilder(true);
  };

  const cleanupDuplicates = async () => {
    try {
      // Find duplicates by title and checklist content
      const duplicateGroups = templates.reduce((groups, template) => {
        const key = `${template.title}_${JSON.stringify(template.checklist)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(template);
        return groups;
      }, {} as Record<string, TaskTemplate[]>);

      const duplicatesToDelete = Object.values(duplicateGroups)
        .filter(group => group.length > 1)
        .flatMap(group => group.slice(1)); // Keep first, delete rest

      if (duplicatesToDelete.length === 0) {
        toast({
          title: "No Duplicates Found",
          description: "All templates are unique",
        });
        return;
      }

      const { error } = await supabase
        .from('task_templates')
        .update({ is_active: false })
        .in('id', duplicatesToDelete.map(t => t.id));

      if (error) throw error;

      toast({
        title: "Success",
        description: `Removed ${duplicatesToDelete.length} duplicate templates`,
      });
      
      fetchTemplates();
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast({
        title: "Error",
        description: "Failed to clean duplicate templates",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('task_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      
      fetchTemplates();
      setSelectedTemplates(prev => prev.filter(id => id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('task_templates')
        .update({ is_active: false })
        .in('id', selectedTemplates);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedTemplates.length} templates deleted successfully`,
      });
      
      setSelectedTemplates([]);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting templates:', error);
      toast({
        title: "Error",
        description: "Failed to delete templates",
        variant: "destructive",
      });
    }
  };

  const handleToggleSelect = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    setSelectedTemplates(selectAll ? filteredTemplates.map(t => t.id) : []);
  };

  if (showBuilder) {
    return (
      <TemplateBuilder
        clinicId={clinicId}
        template={editingTemplate}
        onSave={handleTemplateCreated}
        onCancel={() => {
          setShowBuilder(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task Templates</h2>
          <p className="text-muted-foreground">Create and manage reusable task templates for your team</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={cleanupDuplicates} 
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clean Duplicates
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowImportDialog(true)} 
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>
          {selectedTemplates.length > 0 && (
            <Button
              onClick={() => setDeleteConfirmOpen(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedTemplates.length})
            </Button>
          )}
          <Button 
            onClick={() => setShowBuilder(true)} 
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search templates by name, category, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
        <TemplateList
          templates={filteredTemplates}
          loading={loading}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          onRefresh={fetchTemplates}
          clinicId={clinicId}
          selectedTemplates={selectedTemplates}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />

      {/* Import Dialog */}
        <ImportTemplatesDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          clinicId={clinicId}
          onImportComplete={fetchTemplates}
          templates={templates}
        />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Templates</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTemplates.length} selected template{selectedTemplates.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleBulkDelete();
                setDeleteConfirmOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedTemplates.length} Template{selectedTemplates.length !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}