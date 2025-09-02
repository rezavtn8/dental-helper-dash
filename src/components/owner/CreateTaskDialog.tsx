import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { sanitizeText } from '@/utils/sanitize';

interface Assistant {
  id: string;
  name: string;
  email: string;
}

interface CreateTaskDialogProps {
  assistants: Assistant[];
  onTaskCreated: () => void;
  trigger?: React.ReactNode;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ assistants, onTaskCreated, trigger }) => {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    'due-type': 'EoD',
    category: '',
    assigned_to: 'unassigned',
    recurrence: 'none'
  });

  const [checklist, setChecklist] = useState<{ text: string; completed: boolean }[]>([]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Sanitize inputs to prevent XSS
    const sanitizedTask = {
      title: sanitizeText(newTask.title),
      description: sanitizeText(newTask.description),
      category: sanitizeText(newTask.category),
      priority: newTask.priority,
      'due-type': newTask['due-type'],
      recurrence: newTask.recurrence,
      assigned_to: newTask.assigned_to
    };
    
    // Validate required fields after sanitization
    if (!sanitizedTask.title) {
      toast.error('Task title is required');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          ...sanitizedTask,
          assigned_to: sanitizedTask.assigned_to === 'unassigned' ? null : sanitizedTask.assigned_to,
          clinic_id: userProfile?.clinic_id,
          created_by: user?.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          checklist: checklist.length > 0 ? checklist : null
        });

      if (error) throw error;

      toast.success("Task created successfully!");

      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        'due-type': 'EoD',
        category: '',
        assigned_to: 'unassigned',
        recurrence: 'none'
      });
      setChecklist([]);
      
      setIsOpen(false);
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task for your team
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={createTask} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
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
            <Label>Due Time</Label>
            <Select value={newTask['due-type']} onValueChange={(value) => setNewTask({ ...newTask, 'due-type': value })}>
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
          </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              placeholder="e.g., Patient Care, Cleaning, Administrative"
            />
          </div>

          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Leave unassigned" />
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
            <Label>Recurrence</Label>
            <Select value={newTask.recurrence} onValueChange={(value) => setNewTask({ ...newTask, recurrence: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No recurrence</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checklist Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Checklist (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setChecklist([...checklist, { text: '', completed: false }])}
                className="h-6 px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>
            
            {checklist.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item.text}
                      onChange={(e) => {
                        const updated = [...checklist];
                        updated[index].text = e.target.value;
                        setChecklist(updated);
                      }}
                      placeholder="Checklist item..."
                      className="flex-1 h-7 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setChecklist(checklist.filter((_, i) => i !== index))}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;