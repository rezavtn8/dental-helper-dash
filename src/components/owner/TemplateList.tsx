import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Play,
  Clock,
  Repeat,
  CheckSquare,
  Files,
  Power,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface TemplateListProps {
  templates: TaskTemplate[];
  loading: boolean;
  onEdit: (template: TaskTemplate) => void;
  onDelete: (templateId: string) => void;
  onRefresh: () => void;
  clinicId: string;
  selectedTemplates: string[];
  onToggleSelect: (templateId: string) => void;
  onSelectAll: (selectAll: boolean) => void;
}

export default function TemplateList({ 
  templates, 
  loading, 
  onEdit, 
  onDelete,
  onRefresh,
  clinicId,
  selectedTemplates,
  onToggleSelect,
  onSelectAll
}: TemplateListProps) {
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const { toast } = useToast();

  const getCategoryColor = (category?: string) => {
    const colors = {
      specialty: 'bg-blue-100 text-blue-800 border-blue-200',
      operational: 'bg-green-100 text-green-800 border-green-200', 
      training: 'bg-purple-100 text-purple-800 border-purple-200',
      calendar: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getScenarioLabel = (specialty?: string) => {
    const labels = {
      startup_day: 'Startup Day',
      monthly_maintenance: 'Monthly Maintenance',
      new_hire_week1: 'New Hire Week 1',
      weekly_deep_clean: 'Weekly Deep Clean',
      daily_opening: 'Daily Opening',
      daily_closing: 'Daily Closing',
      equipment_check: 'Equipment Check',
    };
    return labels[specialty as keyof typeof labels] || specialty;
  };

  const getTimeOfDayLabel = (timeOfDay?: string) => {
    const labels = {
      before_opening: 'Before Opening',
      before_1pm: 'Before 1PM',
      end_of_day: 'End of Day',
      end_of_week: 'End of Week',
      anytime: 'Anytime',
    };
    return labels[timeOfDay as keyof typeof labels] || timeOfDay;
  };

  const getRecurrenceLabel = (recurrence?: string) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      biweekly: 'Biweekly',
      once: 'One-time',
    };
    return labels[recurrence as keyof typeof labels] || recurrence;
  };

  const handleToggleEnabled = async (template: TaskTemplate) => {
    try {
      const { error } = await supabase
        .from('task_templates')
        .update({ is_enabled: !template.is_enabled })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Template ${template.is_enabled ? 'disabled' : 'enabled'} successfully`,
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error toggling template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const handleGenerateTasks = async (template: TaskTemplate) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // If template has no checklist, create a single task
      if (!template.checklist || !Array.isArray(template.checklist) || template.checklist.length === 0) {
        const taskData = {
          title: template.title,
          description: template.description,
          category: template.category,
          'due-type': template['due-type'],
          recurrence: template.recurrence,
          priority: 'medium' as const,
          owner_notes: template.owner_notes,
          clinic_id: clinicId,
          created_by: user.user.id,
          status: 'pending' as const,
          template_id: template.id
        };

        const { error } = await supabase
          .from('tasks')
          .insert(taskData);

        if (error) throw error;

        toast({
          title: "Task Created",
          description: `Created 1 task from template "${template.title}"`,
        });
      } else {
        // Create individual tasks from checklist items
        const tasks = template.checklist.map((item: any) => ({
          title: item.title || item.description || 'Checklist Item',
          description: item.description || '',
          category: template.category,
          'due-type': template['due-type'],
          recurrence: 'once',
          priority: 'medium' as const,
          owner_notes: item.owner_notes || template.owner_notes,
          clinic_id: clinicId,
          created_by: user.user.id,
          status: 'pending' as const,
          template_id: template.id
        }));

        const { error } = await supabase
          .from('tasks')
          .insert(tasks);

        if (error) throw error;

        toast({
          title: "Tasks Created",
          description: `Created ${tasks.length} tasks from template "${template.title}"`,
        });
      }
      
      onRefresh();
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate tasks from template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (template: TaskTemplate) => {
    try {
      const { error } = await supabase
        .from('task_templates')
        .insert({
          title: `${template.title} (Copy)`,
          description: template.description,
          category: template.category,
          specialty: template.specialty,
          checklist: template.checklist,
          'due-type': template['due-type'],
          recurrence: template.recurrence,
          owner_notes: template.owner_notes,
          clinic_id: clinicId,
          is_enabled: template.is_enabled,
          start_date: template.start_date,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    }
  };

  const getTaskCount = (checklist: any) => {
    if (!checklist) return 0;
    if (Array.isArray(checklist)) return checklist.length;
    return 0;
  };

  const allSelected = templates.length > 0 && selectedTemplates.length === templates.length;
  const someSelected = selectedTemplates.length > 0 && selectedTemplates.length < templates.length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Files className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Templates Created</h3>
          <p className="text-muted-foreground mb-6">
            Create your first task template to automate recurring workflows for your team.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {templates.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            className={someSelected ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary" : ""}
          />
          <span className="text-sm text-muted-foreground">
            {selectedTemplates.length > 0 
              ? `${selectedTemplates.length} selected`
              : 'Select all templates'
            }
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className={`hover:shadow-lg transition-shadow ${selectedTemplates.includes(template.id) ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedTemplates.includes(template.id)}
                    onCheckedChange={() => onToggleSelect(template.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {template.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${template.is_enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className={`text-xs ${template.is_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {template.is_enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(template)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Template
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleGenerateTasks(template)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Tasks
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleToggleEnabled(template)}
                    >
                      {template.is_enabled ? (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Disable Template
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Enable Template
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setDeleteDialog(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {template.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {template.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Category and Scenario Tags */}
              <div className="flex flex-wrap gap-2">
                {template.category && (
                  <Badge variant="outline" className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                )}
                {template.specialty && (
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                    {getScenarioLabel(template.specialty)}
                  </Badge>
                )}
              </div>

              {/* Template Details */}
              <div className="space-y-2 text-sm">
                {template['due-type'] && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeOfDayLabel(template['due-type'])}</span>
                  </div>
                )}
                
                {template.recurrence && template.recurrence !== 'once' && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Repeat className="w-3 h-3" />
                    <span>{getRecurrenceLabel(template.recurrence)} generation</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckSquare className="w-3 h-3" />
                  <span>{getTaskCount(template.checklist)} tasks in checklist</span>
                </div>

                {template.next_generation_date && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Clock className="w-3 h-3" />
                    <span>Next: {new Date(template.next_generation_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Status Information */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Schedule:</strong> {getRecurrenceLabel(template.recurrence)}
                  {template.recurrence === 'once' && template.start_date && (
                    <span> on {new Date(template.start_date).toLocaleDateString()}</span>
                  )}
                </p>
                {template.last_generated_date && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Last generated:</strong> {new Date(template.last_generated_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This will stop automatic task generation from this template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog) {
                  onDelete(deleteDialog);
                  setDeleteDialog(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}