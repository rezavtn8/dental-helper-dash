import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  MessageSquare,
  Plus,
  ArrowLeft,
  Undo2,
  Target,
  Sparkles,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
      return 'bg-red-50 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-teal-50 text-teal-700 border-teal-200';
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
      return 'Flexible';
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
      
      toast.success('Task assigned to you!', {
        description: 'The task has been added to your list.'
      });
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error picking task:', error);
      toast.error('Failed to assign task');
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
      
      toast.success('Task completed! 🎉', {
        description: 'Great job! Keep up the excellent work.'
      });
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error marking task done:', error);
      toast.error('Failed to complete task');
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
      
      toast.success('Task reopened');
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error reopening task:', error);
      toast.error('Failed to reopen task');
    }
  };

  const unassignTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: null })
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success('Task returned to available tasks');
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error unassigning task:', error);
      toast.error('Failed to return task');
    }
  };

  const saveNote = async () => {
    toast.success('Note saved! 📝', {
      description: 'Your note has been saved for this task'
    });
    setNoteDialog({ open: false, taskId: '', note: '' });
  };

  const TaskCard = ({ task, showPickUp = false, showCompleted = false }: { task: Task; showPickUp?: boolean; showCompleted?: boolean }) => (
    <Card className="group transition-all duration-300 hover:shadow-xl hover:shadow-teal-100/50 border-2 hover:border-teal-200 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-teal-900 text-lg mb-2 group-hover:text-teal-700 transition-colors">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-teal-700 mb-4 leading-relaxed text-sm">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-xs font-semibold px-3 py-1.5 ${getPriorityColor(task.priority)}`}>
                {task.priority || 'Normal'}
              </Badge>
              {task['due-type'] && (
                <Badge variant="outline" className="text-xs border-teal-200 text-teal-700 bg-teal-50/50">
                  <Clock className="w-3 h-3 mr-1" />
                  {getDueText(task['due-type'])}
                </Badge>
              )}
            </div>
          </div>
          
          {!showPickUp && !showCompleted && (
            <div className="ml-4 flex-shrink-0">
              <Checkbox
                checked={['completed', 'done'].includes(task.status?.toLowerCase())}
                onCheckedChange={(checked) => {
                  if (checked) {
                    markTaskDone(task.id);
                  } else {
                    markTaskUndone(task.id);
                  }
                }}
                className="w-7 h-7 border-2 border-teal-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 rounded-lg"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 pt-2">
          {showPickUp && (
            <Button 
              onClick={() => pickTask(task.id)}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold h-12 shadow-lg shadow-teal-500/25"
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
                className="hover:bg-teal-50 border-teal-200 text-teal-700 h-10 px-4"
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
                    className="hover:bg-blue-50 border-blue-200 text-blue-700 h-10 px-4"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center text-teal-900">
                      <FileText className="w-5 h-5 mr-2 text-teal-600" />
                      Add Task Note
                    </DialogTitle>
                    <DialogDescription>
                      Leave a note about this task for the practice owner
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="note" className="text-teal-900 font-medium">Note</Label>
                      <Textarea
                        id="note"
                        placeholder="Enter your note here..."
                        value={noteDialog.note}
                        onChange={(e) => setNoteDialog(prev => ({ ...prev, note: e.target.value }))}
                        rows={4}
                        className="mt-2 border-teal-200 focus:border-teal-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setNoteDialog({ open: false, taskId: '', note: '' })}>
                        Cancel
                      </Button>
                      <Button onClick={saveNote} className="bg-teal-600 hover:bg-teal-700">
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
              className="hover:bg-gray-50 h-10 px-4"
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
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-teal-900 mb-3">Today's Tasks</h1>
        <p className="text-teal-600 text-lg">Manage your daily assignments and pick up new tasks</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-900">{myTasks.length}</p>
                <p className="text-sm text-blue-700 font-medium">My Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-900">{completedTasks.length}</p>
                <p className="text-sm text-green-700 font-medium">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-teal-900">{unassignedTasks.length}</p>
                <p className="text-sm text-teal-700 font-medium">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Active Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center">
            <User className="w-6 h-6 mr-3 text-teal-600" />
            My Tasks ({pendingTasks.length})
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Available Tasks */}
      <div>
        <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center">
          <Sparkles className="w-6 h-6 mr-3 text-teal-600" />
          Available Tasks ({unassignedTasks.length})
        </h2>
        
        {unassignedTasks.length === 0 ? (
          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-teal-900 mb-3">All caught up!</h3>
              <p className="text-teal-700">No available tasks to pick up right now. Great work!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {unassignedTasks.map((task) => (
              <TaskCard key={task.id} task={task} showPickUp={true} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center">
            <CheckCircle2 className="w-6 h-6 mr-3 text-green-600" />
            Completed Today ({completedTasks.length})
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} showCompleted={true} />
            ))}
          </div>
        </div>
      )}

      {/* No Tasks Message */}
      {myTasks.length === 0 && unassignedTasks.length === 0 && (
        <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-teal-900 mb-3">No tasks yet</h3>
            <p className="text-teal-700">Tasks will appear here when they're created by your practice owner.</p>
          </CardContent>
        </Card>
      )}

      {/* Floating Leave Note Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-110"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center text-teal-900">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Leave a Shift Note
              </DialogTitle>
              <DialogDescription>
                Share any updates, observations, or feedback from your shift with the practice owner
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shift-note" className="text-teal-900 font-medium">Shift Note</Label>
                <Textarea
                  id="shift-note"
                  placeholder="Share any updates, observations, or feedback from your shift..."
                  rows={5}
                  className="mt-2 border-teal-200 focus:border-teal-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
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