import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sanitizeText } from '@/utils/sanitize';
import { 
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle,
  Trash2,
  Edit,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  task: Task;
  assistants: Assistant[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
}

export default function TaskDetailModal({
  task,
  assistants,
  isOpen,
  onOpenChange,
  onTaskUpdated
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        'due-type': task['due-type'] || 'EoD',
        category: task.category || '',
        assigned_to: task.assigned_to || null,
        recurrence: task.recurrence || 'none',
        status: task.status || 'pending'
      });
    }
  }, [task]);

  const getAssistantName = (assistantId: string | null | undefined) => {
    if (!assistantId) return 'Unassigned';
    const assistant = assistants.find(a => a.id === assistantId);
    return assistant?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const handleSave = async () => {
    if (!editedTask.title?.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);
    try {
      const sanitizedTask = {
        title: sanitizeText(editedTask.title || ''),
        description: sanitizeText(editedTask.description || ''),
        category: sanitizeText(editedTask.category || ''),
        priority: editedTask.priority,
        'due-type': editedTask['due-type'],
        recurrence: editedTask.recurrence,
        assigned_to: editedTask.assigned_to,
        status: editedTask.status as TaskStatus
      };

      const { error } = await supabase
        .from('tasks')
        .update({
          ...sanitizedTask,
          completed_at: sanitizedTask.status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', task.id);

      if (error) throw error;

      toast.success('Task updated successfully');
      setIsEditing(false);
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast.success('Task deleted successfully');
      onOpenChange(false);
      onTaskUpdated();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {isEditing ? 'Edit Task' : 'Task Details'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update task information' : 'View and manage task details'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                {isEditing ? (
                  <Input
                    value={editedTask.title || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    placeholder="Task title"
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">{task.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                {isEditing ? (
                  <Select 
                    value={editedTask.status || 'pending'} 
                    onValueChange={(value: TaskStatus) => setEditedTask({ ...editedTask, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('-', ' ')}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  placeholder="Task description"
                  rows={3}
                />
              ) : (
                <p className="p-2 bg-muted rounded-md min-h-[60px]">
                  {task.description || 'No description provided'}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Assignment & Priority */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Assignment & Priority
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Assigned To</Label>
                {isEditing ? (
                  <Select 
                    value={editedTask.assigned_to || 'unassigned'} 
                    onValueChange={(value) => setEditedTask({ ...editedTask, assigned_to: value === 'unassigned' ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {assistants.map(assistant => (
                        <SelectItem key={assistant.id} value={assistant.id}>
                          {assistant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="p-2 bg-muted rounded-md">{getAssistantName(task.assigned_to)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                {isEditing ? (
                  <Select 
                    value={editedTask.priority || 'medium'} 
                    onValueChange={(value) => setEditedTask({ ...editedTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getPriorityColor(task.priority || 'medium')}>
                    <Flag className="w-3 h-3 mr-1" />
                    {task.priority}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                {isEditing ? (
                  <Input
                    value={editedTask.category || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
                    placeholder="Task category"
                  />
                ) : (
                  <p className="p-2 bg-muted rounded-md">{task.category || 'No category'}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Scheduling */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduling
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Type</Label>
                {isEditing ? (
                  <Select 
                    value={editedTask['due-type'] || 'EoD'} 
                    onValueChange={(value) => setEditedTask({ ...editedTask, 'due-type': value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Before Opening">Before Opening</SelectItem>
                      <SelectItem value="Before 1PM">Before 1PM</SelectItem>
                      <SelectItem value="EoD">End of Day</SelectItem>
                      <SelectItem value="EoW">End of Week</SelectItem>
                      <SelectItem value="EoM">End of Month</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {task['due-type']}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Recurrence</Label>
                {isEditing ? (
                  <Select 
                    value={editedTask.recurrence || 'none'} 
                    onValueChange={(value) => setEditedTask({ ...editedTask, recurrence: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No recurrence</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">
                    {task.recurrence === 'none' ? 'One-time' : task.recurrence}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold">Timeline</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Created: {task.created_at ? format(new Date(task.created_at), 'PPp') : 'Unknown'}</p>
              {task.completed_at && (
                <p>Completed: {format(new Date(task.completed_at), 'PPp')}</p>
              )}
              {task.custom_due_date && (
                <p>Due Date: {format(new Date(task.custom_due_date), 'PPp')}</p>
              )}
            </div>
          </div>

          {/* Checklist */}
          {task.checklist && Array.isArray(task.checklist) && task.checklist.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold">Checklist</h4>
                <div className="space-y-2">
                  {task.checklist.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-md">
                      <CheckCircle className={`w-4 h-4 mt-0.5 ${item.completed ? 'text-green-600' : 'text-slate-400'}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}