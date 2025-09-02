import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task, Assistant } from '@/types/task';
import { sanitizeText } from '@/utils/sanitize';

interface EditTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
  assistants: Assistant[];
}

export default function EditTaskDialog({ 
  task, 
  isOpen, 
  onOpenChange, 
  onTaskUpdated, 
  assistants 
}: EditTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    'due-type': 'EoD',
    category: '',
    assigned_to: 'unassigned',
    recurrence: 'none'
  });

  useEffect(() => {
    if (task && isOpen) {
      // Map due-type values from database to form options
      let dueType = 'EoD'; // default
      if (task['due-type'] === 'flexible') {
        dueType = 'EoW';
      } else if (task['due-type'] === 'custom') {
        dueType = 'ASAP';
      }
      
      // Convert recurrence to lowercase to match form options
      let recurrence = 'none';
      if (task.recurrence) {
        recurrence = task.recurrence.toLowerCase();
      }
      
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        'due-type': dueType,
        category: task.category || '',
        assigned_to: task.assigned_to || 'unassigned',
        recurrence: recurrence
      });
    } else if (!isOpen) {
      // Reset form when dialog is closed
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        'due-type': 'EoD',
        category: '',
        assigned_to: 'unassigned',
        recurrence: 'none'
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    setLoading(true);

    // Sanitize inputs to prevent XSS
    const sanitizedData = {
      title: sanitizeText(formData.title),
      description: sanitizeText(formData.description),
      category: sanitizeText(formData.category),
      priority: formData.priority,
      'due-type': formData['due-type'],
      recurrence: formData.recurrence,
      assigned_to: formData.assigned_to
    };
    
    // Validate required fields after sanitization
    if (!sanitizedData.title) {
      toast.error('Task title is required');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        ...sanitizedData,
        assigned_to: sanitizedData.assigned_to === 'unassigned' ? null : sanitizedData.assigned_to,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id);

      if (error) throw error;

      toast.success('Task updated successfully!');
      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details and assignment
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter task title"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter task description"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({...formData, priority: value})}
                disabled={loading}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-type">Due</Label>
              <Select 
                value={formData['due-type']} 
                onValueChange={(value) => setFormData({...formData, 'due-type': value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EoD">End of Day</SelectItem>
                  <SelectItem value="EoW">End of Week</SelectItem>
                  <SelectItem value="ASAP">ASAP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              placeholder="e.g., Cleaning, Admin, Patient Care"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assign To</Label>
            <Select 
              value={formData.assigned_to} 
              onValueChange={(value) => setFormData({...formData, assigned_to: value})}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select 
              value={formData.recurrence} 
              onValueChange={(value) => setFormData({...formData, recurrence: value})}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}