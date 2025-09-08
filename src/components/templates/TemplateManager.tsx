import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Upload, Trash2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTemplates } from '@/hooks/useTemplates';
import { TaskTemplate } from '@/types/template';
import TemplateBuilder from '../owner/TemplateBuilder';
import TemplateList from '../owner/TemplateList';
import { ImportDialog } from './ImportDialog';

interface TemplateManagerProps {
  clinicId: string;
}

export function TemplateManager({ clinicId }: TemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const {
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
  } = useTemplates({ clinicId });

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));

  const handleTemplateCreated = () => {
    setShowBuilder(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setShowBuilder(true);
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteTemplates(selectedTemplates);
      setDeleteConfirmOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable task templates for your team
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className="bg-background">
              {templates.length} Total Templates
            </Badge>
            <Badge variant="outline" className="bg-background">
              {templates.filter(t => t.is_enabled).length} Active
            </Badge>
            {selectedTemplates.length > 0 && (
              <Badge variant="secondary">
                {selectedTemplates.length} Selected
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={cleanupDuplicates} 
            className="flex items-center gap-2"
            disabled={loading}
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
            Import from File
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
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(searchQuery || categoryFilter !== 'all' || selectedTemplates.length > 0) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  clearSelection();
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <TemplateList
        templates={filteredTemplates}
        loading={loading}
        onEdit={handleEditTemplate}
        onDelete={deleteTemplate}
        onRefresh={fetchTemplates}
        clinicId={clinicId}
        selectedTemplates={selectedTemplates}
        onToggleSelect={toggleTemplateSelection}
        onSelectAll={selectAllTemplates}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        clinicId={clinicId}
        onImportComplete={fetchTemplates}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Templates</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTemplates.length} selected template{selectedTemplates.length !== 1 ? 's' : ''}? 
              This action cannot be undone and will also remove any associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
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