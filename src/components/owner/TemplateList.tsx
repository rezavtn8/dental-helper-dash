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
  Files
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
import ApplyTemplateDialog from './ApplyTemplateDialog';

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
  const [applyDialog, setApplyDialog] = useState<TaskTemplate | null>(null);
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
      none: 'One-time',
    };
    return labels[recurrence as keyof typeof labels] || recurrence;
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
            Create your first task template to streamline repetitive workflows for your team.
          </p>
        </CardContent>
      </Card>
    );
  }

  const allSelected = templates.length > 0 && selectedTemplates.length === templates.length;
  const someSelected = selectedTemplates.length > 0 && selectedTemplates.length < templates.length;

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
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {template.title}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setApplyDialog(template)}>
                      <Play className="w-4 h-4 mr-2" />
                      Apply Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(template)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
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
                <p className="text-sm text-muted-foreground line-clamp-2">
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
                
                {template.recurrence && template.recurrence !== 'none' && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Repeat className="w-3 h-3" />
                    <span>{getRecurrenceLabel(template.recurrence)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckSquare className="w-3 h-3" />
                  <span>{getTaskCount(template.checklist)} tasks</span>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => setApplyDialog(template)}
                className="w-full"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Apply Template
              </Button>
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
              Are you sure you want to delete this template? This action cannot be undone.
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

      {/* Apply Template Dialog */}
      {applyDialog && (
        <ApplyTemplateDialog
          template={applyDialog}
          clinicId={clinicId}
          open={!!applyDialog}
          onOpenChange={(open) => !open && setApplyDialog(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}