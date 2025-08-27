import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task } from '@/types/task';
import { useAuth } from '@/hooks/useAuth';

interface TaskNoteDialogProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteSaved: () => void;
}

export default function TaskNoteDialog({ 
  task, 
  isOpen, 
  onOpenChange, 
  onNoteSaved 
}: TaskNoteDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [existingNote, setExistingNote] = useState<any>(null);

  useEffect(() => {
    if (task && user && isOpen) {
      fetchExistingNote();
    }
  }, [task, user, isOpen]);

  const fetchExistingNote = async () => {
    if (!task || !user) return;

    try {
      const { data, error } = await supabase
        .from('task_notes')
        .select('*')
        .eq('task_id', task.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setExistingNote(data);
      setNote(data?.note || '');
    } catch (error) {
      console.error('Error fetching task note:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !user || !note.trim()) return;
    
    setLoading(true);

    try {
      if (existingNote) {
        // Update existing note
        const { error } = await supabase
          .from('task_notes')
          .update({ 
            note: note.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingNote.id);

        if (error) throw error;
        toast.success('Note updated successfully!');
      } else {
        // Create new note
        const { error } = await supabase
          .from('task_notes')
          .insert({
            task_id: task.id,
            user_id: user.id,
            note: note.trim()
          });

        if (error) throw error;
        toast.success('Note added successfully!');
      }

      onNoteSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving task note:', error);
      toast.error('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingNote) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('task_notes')
        .delete()
        .eq('id', existingNote.id);

      if (error) throw error;

      toast.success('Note deleted successfully!');
      setNote('');
      setExistingNote(null);
      onNoteSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting task note:', error);
      toast.error('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {existingNote ? 'Edit Note' : 'Add Note'}
          </DialogTitle>
          <DialogDescription>
            Add your personal note for this task
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Your Note</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add your notes about this task..."
                rows={4}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                This note is only visible to you and clinic owners.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              {existingNote && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !note.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    existingNote ? 'Update Note' : 'Add Note'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}