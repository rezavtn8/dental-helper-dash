import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskStatus, isCompleted } from '@/lib/taskStatus';
import { getPriorityStyles } from '@/lib/taskUtils';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import TaskNoteDialog from './TaskNoteDialog';
import { 
  Calendar, 
  Clock, 
  CheckCircle2,
  User,
  Plus,
  ArrowLeft,
  Target,
  Sparkles,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface TodaysTasksTabProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

export default function TodaysTasksTab({ tasks, onTaskUpdate }: TodaysTasksTabProps) {
  const { user } = useAuth();
  const [taskNotes, setTaskNotes] = useState<Record<string, any>>({});
  const [noteTask, setNoteTask] = useState<Task | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);

  const myTasks = useMemo(() => 
    tasks.filter(task => task.assigned_to === user?.id)
  , [tasks, user?.id]);

  const unassignedTasks = useMemo(() => 
    tasks.filter(task => !task.assigned_to)
  , [tasks]);

  // Fetch task notes for user
  const fetchTaskNotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('task_notes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const notesMap = (data || []).reduce((acc, note) => {
        acc[note.task_id] = note;
        return acc;
      }, {});
      
      setTaskNotes(notesMap);
    } catch (error) {
      console.error('Error fetching task notes:', error);
    }
  };

  useEffect(() => {
    fetchTaskNotes();
  }, [user]);

  const completedTasks = myTasks.filter(task => 
    isCompleted(task.status)
  );

  const pendingTasks = myTasks.filter(task => 
    !isCompleted(task.status)
  );

  const pickTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'in-progress' as TaskStatus,
          assigned_to: user?.id 
        })
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
          status: 'completed' as TaskStatus,
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
          status: 'pending' as TaskStatus,
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

  const returnTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'pending' as TaskStatus,
          assigned_to: null 
        })
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success('Task returned to available tasks');
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error returning task:', error);
      toast.error('Failed to return task');
    }
  };

  const TaskCard = ({ task, showPickUp = false, showCompleted = false }: { task: Task; showPickUp?: boolean; showCompleted?: boolean }) => {
    const hasNote = taskNotes[task.id];
    
    return (
      <Card key={task.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-teal-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-semibold text-gray-900 mb-2">
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {task.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Task Actions */}
            <div className="flex items-center justify-between">
              {!showPickUp && !showCompleted && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isCompleted(task.status)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        markTaskDone(task.id);
                      } else {
                        markTaskUndone(task.id);
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700 select-none">
                    Mark as {isCompleted(task.status) ? 'pending' : 'complete'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {/* Note Button */}
                <Button
                  size="sm"
                  variant={hasNote ? "default" : "outline"}
                  onClick={() => {
                    setNoteTask(task);
                    setShowNoteDialog(true);
                  }}
                  className="h-7 text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  {hasNote ? 'Edit Note' : 'Add Note'}
                </Button>

                {/* Pick Up / Put Back Buttons */}
                {showPickUp && (
                  <Button
                    size="sm"
                    onClick={() => pickTask(task.id)}
                    className="h-7 text-xs bg-teal-600 hover:bg-teal-700"
                  >
                    Pick Up
                  </Button>
                )}

                {!showPickUp && !showCompleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => returnTask(task.id)}
                    className="h-7 text-xs"
                  >
                    Put Back
                  </Button>
                )}
              </div>
            </div>

            {/* Task Note Preview */}
            {hasNote && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <FileText className="w-3 h-3 mr-1 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">Your Note</span>
                </div>
                <p className="text-xs text-blue-700 line-clamp-2">
                  {hasNote.note}
                </p>
              </div>
            )}

            {/* Task Details */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-xs">
                  {task.priority || 'Medium'} Priority
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {task['due-type']}
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(task.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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

      {/* Task Note Dialog */}
      <TaskNoteDialog
        task={noteTask}
        isOpen={showNoteDialog}
        onOpenChange={setShowNoteDialog}
        onNoteSaved={() => {
          fetchTaskNotes();
          onTaskUpdate();
        }}
      />
    </div>
  );
}