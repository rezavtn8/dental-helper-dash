import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CheckSquare, Clock, Repeat, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TaskStatus } from '@/lib/taskStatus';

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
}

interface Assistant {
  id: string;
  name: string;
  email: string;
}

interface ApplyTemplateDialogProps {
  template: TaskTemplate;
  clinicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function ApplyTemplateDialog({
  template,
  clinicId,
  open,
  onOpenChange,
  onSuccess,
}: ApplyTemplateDialogProps) {
  const [assignTo, setAssignTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState('medium');
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('clinic_id', clinicId)
          .eq('role', 'assistant')
          .eq('is_active', true);

        if (error) throw error;
        setAssistants(data || []);
      } catch (error) {
        console.error('Error fetching assistants:', error);
      }
    };

    if (open) {
      fetchAssistants();
    }
  }, [open, clinicId]);

  const getTaskCount = (checklist: any) => {
    if (!checklist) return 0;
    if (Array.isArray(checklist)) return checklist.length;
    return 0;
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

  const handleApplyTemplate = async () => {
    if (!assignTo) {
      toast({
        title: "Error",
        description: "Please select an assistant to assign tasks to",
        variant: "destructive",
      });
      return;
    }

    if (!dueDate) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const tasks = Array.isArray(template.checklist) ? template.checklist : [];
      const currentUser = await supabase.auth.getUser();

      const tasksToCreate = tasks.map((task: any) => ({
        title: task.title || task.text || 'Untitled Task',
        description: task.description || `From template: ${template.title}`,
        priority: priority,
        status: 'pending' as TaskStatus,
        'due-type': 'custom',
        'custom_due_date': dueDate.toISOString(),
        category: template.category || 'general',
        assigned_to: assignTo,
        recurrence: template.recurrence || 'none',
        clinic_id: clinicId,
        created_by: currentUser.data.user?.id,
        owner_notes: `Generated from template: ${template.title}`,
        checklist: task.checklist || null,
      }));

      const { error } = await supabase
        .from('tasks')
        .insert(tasksToCreate);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Created ${tasksToCreate.length} tasks from template`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">{template.title}</h3>
            {template.description && (
              <p className="text-sm text-muted-foreground">{template.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {template.category && (
                <Badge variant="outline">{template.category}</Badge>
              )}
              {template['due-type'] && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {getTimeOfDayLabel(template['due-type'])}
                </div>
              )}
              {template.recurrence && template.recurrence !== 'none' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Repeat className="w-3 h-3" />
                  {getRecurrenceLabel(template.recurrence)}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckSquare className="w-3 h-3" />
                {getTaskCount(template.checklist)} tasks
              </div>
            </div>
          </div>

          {/* Assignment Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignTo">Assign To *</Label>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an assistant" />
                </SelectTrigger>
                <SelectContent>
                  {assistants.map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {assistant.name}
                      </div>
                    </SelectItem>
                  ))}
                  {assistants.length === 0 && (
                    <SelectItem value="" disabled>
                      No assistants available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyTemplate} disabled={loading}>
            {loading ? 'Creating Tasks...' : 'Apply Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}