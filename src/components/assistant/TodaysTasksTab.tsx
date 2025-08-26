import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  CheckCircle2,
  User,
  AlertCircle,
  MessageSquare,
  Plus,
  ArrowLeft,
  Undo2,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  'due-type': string;
  category: string;
  assigned_to: string | null;
  created_at: string;
  completed_at?: string;
}

interface TodaysTasksTabProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getDueText = (dueType: string) => {
  switch (dueType) {
    case 'morning':
      return 'Before 12PM';
    case 'afternoon':
      return 'Before 5PM';
    case 'evening':
      return 'Before 9PM';
    case 'end-of-day':
      return 'End of Day';
    default:
      return 'No deadline';
  }
};

export default function TodaysTasksTab({ tasks, onTaskUpdate }: TodaysTasksTabProps) {
  const { user } = useAuth();
  const [noteDialog, setNoteDialog] = useState({ open: false, taskId: '', note: '' });

  const myTasks = useMemo(() => 
    tasks.filter(task => task.assigned_to === user?.id)
  , [tasks, user?.id]);

  const unassignedTasks = useMemo(() => 
    tasks.filter(task => !task.assigned_to)
  , [tasks]);

  const completedTasks = myTasks.filter(task => 
    ['completed', 'done'].includes(task.status?.toLowerCase())
  );

  const pendingTasks = myTasks.filter(task => 
    !['completed', 'done'].includes(task.status?.toLowerCase())
  );

  const pickTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: user?.id })
        .eq('id', taskId);

      if (error) throw error;
      
      toast({
        title: "Task Assigned",
        description: "Task has been added to your list"
      });
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error picking task:', error);
      toast({
        title: "Error",
        description: "Failed to assign task",
        variant: "destructive"
      });
    }
  };

  const markTaskDone = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_by: user?.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      
      toast({
        title: "Task Completed! 🎉",
        description: "Great job! Keep up the excellent work."
      });
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error marking task done:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    }
  };

  const markTaskUndone = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'pending',
          completed_by: null,
          completed_at: null
        })
        .eq('id', taskId);

      if (error) throw error;
      
      toast({
        title: "Task Reopened",
        description: "Task moved back to pending"
      });
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error reopening task:', error);
      toast({
        title: "Error",
        description: "Failed to reopen task",
        variant: "destructive"
      });
    }
  };

  const unassignTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: null })
        .eq('id', taskId);

      if (error) throw error;
      
      toast({
        title: "Task Returned",
        description: "Task moved to available tasks"
      });
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error unassigning task:', error);
      toast({
        title: "Error",
        description: "Failed to return task",
        variant: "destructive"
      });
    }
  };

  const saveNote = async () => {
    // This would typically save to a notes table
    toast({
      title: "Note Saved",
      description: "Your note has been saved for this task"
    });
    setNoteDialog({ open: false, taskId: '', note: '' });
  };

  const TaskCard = ({ task, showPickUp = false, showCompleted = false }: { task: Task; showPickUp?: boolean; showCompleted?: boolean }) => (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-2 hover:border-teal-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 mb-3 leading-relaxed">{task.description}</p>
            )}
            
            <div className="flex items-center space-x-2">
              <Badge className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority || 'Medium'}
              </Badge>
              {task['due-type'] && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {getDueText(task['due-type'])}
                </Badge>
              )}
            </div>
          </div>
          
          {!showPickUp && !showCompleted && (
            <div className="ml-4">
              <Checkbox
                checked={['completed', 'done'].includes(task.status?.toLowerCase())}
                onCheckedChange={(checked) => {
                  if (checked) {
                    markTaskDone(task.id);
                  } else {
                    markTaskUndone(task.id);
                  }
                }}
                className="w-6 h-6 border-2 border-teal-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {showPickUp && (
            <Button 
              onClick={() => pickTask(task.id)}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium h-11"
            >
              <Plus className="w-4 h-4 mr-2" />
              Pick Up Task
            </Button>
          )}
          
          {!showPickUp && !showCompleted && (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => unassignTask(task.id)}
                className="hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Return
              </Button>
              
              <Dialog 
                open={noteDialog.open && noteDialog.taskId === task.id} 
                onOpenChange={(open) => setNoteDialog(prev => ({ ...prev, open }))}
              >
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setNoteDialog({ open: true, taskId: task.id, note: '' })}
                    className="hover:bg-gray-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                    <DialogDescription>
                      Leave a note about this task for the practice owner
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="note">Note</Label>
                      <Textarea
                        id="note"
                        placeholder="Enter your note here..."
                        value={noteDialog.note}
                        onChange={(e) => setNoteDialog(prev => ({ ...prev, note: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setNoteDialog({ open: false, taskId: '', note: '' })}>
                        Cancel
                      </Button>
                      <Button onClick={saveNote}>
                        Save Note
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          {showCompleted && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => markTaskUndone(task.id)}
              className="hover:bg-gray-50"
            >
              <Undo2 className="w-4 h-4 mr-1" />
              Undo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Today's Tasks</h2>
        <p className="text-gray-600 text-lg">Manage your daily assignments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{myTasks.length}</p>
                <p className="text-sm text-gray-600">Total Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unassignedTasks.length}</p>
                <p className="text-sm text-gray-600">Available to Pick</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Active Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-teal-600" />
            My Tasks ({pendingTasks.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
            Completed Today ({completedTasks.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} showCompleted={true} />
            ))}
          </div>
        </div>
      )}

      {/* Available Tasks */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-teal-600" />
          Available Tasks ({unassignedTasks.length})
        </h3>
        
        {unassignedTasks.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No available tasks to pick up right now. Great work!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {unassignedTasks.map((task) => (
              <TaskCard key={task.id} task={task} showPickUp={true} />
            ))}
          </div>
        )}
      </div>

      {/* No Tasks Message */}
      {myTasks.length === 0 && unassignedTasks.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600">Tasks will appear here when they're created by your practice owner.</p>
          </CardContent>
        </Card>
      )}

      {/* Floating Leave Note Button */}
      <div className="fixed bottom-8 right-8">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave a Shift Note</DialogTitle>
              <DialogDescription>
                Leave a general note about your shift or any observations for the practice owner
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shift-note">Shift Note</Label>
                <Textarea
                  id="shift-note"
                  placeholder="Share any updates, observations, or feedback from your shift..."
                  rows={5}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button>
                  Save Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}