import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task } from '@/types/task';

interface DeleteTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskDeleted: () => void;
}

export default function DeleteTaskDialog({ 
  task, 
  isOpen, 
  onOpenChange, 
  onTaskDeleted 
}: DeleteTaskDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!task) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast.success('Task deleted successfully!');
      onTaskDeleted();
      onOpenChange(false);
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Delete Task
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete this task?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-sm text-red-900">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-red-700 mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>

          <div className="flex gap-3">
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
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Task'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}