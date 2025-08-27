import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task, Assistant } from '@/types/task';

interface ReassignTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
  assistants: Assistant[];
}

export default function ReassignTaskDialog({ 
  task, 
  isOpen, 
  onOpenChange, 
  onTaskUpdated, 
  assistants 
}: ReassignTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          assigned_to: assignedTo === 'unassigned' ? null : assignedTo,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      const assignedAssistant = assistants.find(a => a.id === assignedTo);
      const assignmentText = assignedTo === 'unassigned' 
        ? 'Task unassigned successfully!'
        : `Task reassigned to ${assignedAssistant?.name}!`;

      toast.success(assignmentText);
      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error reassigning task:', error);
      toast.error('Failed to reassign task');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  const currentAssignee = assistants.find(a => a.id === task.assigned_to);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Reassign Task
          </DialogTitle>
          <DialogDescription>
            Change who this task is assigned to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm">{task.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Currently assigned to: {currentAssignee?.name || 'Unassigned'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select 
                value={assignedTo} 
                onValueChange={setAssignedTo}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee..." />
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

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !assignedTo} 
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Reassign'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}