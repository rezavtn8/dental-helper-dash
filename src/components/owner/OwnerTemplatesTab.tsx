import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TemplateBuilder from './TemplateBuilder';
import TemplateList from './TemplateList';

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
}

export default function OwnerTemplatesTab({ clinicId }: OwnerTemplatesTabProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
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
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task Templates</h2>
          <p className="text-muted-foreground">Create and manage reusable task templates for your team</p>
        </div>
        <Button 
          onClick={() => setShowBuilder(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
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
      />
    </div>
  );
}