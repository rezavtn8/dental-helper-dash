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
      // Get the task details first to check for recurrence
      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (fetchError) throw fetchError;

      // Mark the current task as completed
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed' as TaskStatus,
          completed_by: user?.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Handle recurring tasks - create a new instance if task has recurrence
      if (taskData.recurrence && taskData.recurrence !== 'none') {
        const newTaskData = {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          'due-type': taskData['due-type'],
          category: taskData.category,
          recurrence: taskData.recurrence,
          owner_notes: taskData.owner_notes,
          clinic_id: taskData.clinic_id,
          created_by: taskData.created_by,
          assigned_to: null, // Reset assignment for new recurring task
          status: 'pending' as TaskStatus,
          custom_due_date: taskData.custom_due_date ? calculateNextDueDate(taskData.custom_due_date, taskData.recurrence) : null
        };

        const { error: createError } = await supabase
          .from('tasks')
          .insert([newTaskData]);

        if (createError) {
          console.error('Error creating recurring task:', createError);
        } else {
          toast.success('Recurring task created for next cycle');
        }
      }
      
      toast.success('Task completed! 🎉', {
        description: 'Great job! Keep up the excellent work.'
      });
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error marking task done:', error);
      toast.error('Failed to complete task');
    }
  };

  // Helper function to calculate next due date for recurring tasks
  const calculateNextDueDate = (currentDueDate: string, recurrence: string): string => {
    const date = new Date(currentDueDate);
    
    switch (recurrence) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        date.setDate(date.getDate() + 1); // Default to daily
    }
    
    return date.toISOString();
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
      <div className="bg-white rounded-lg border border-teal-100 hover:border-teal-200 hover:shadow-sm transition-all duration-200 p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {/* Checkbox for completion */}
              {!showPickUp && !showCompleted && (
                <Checkbox
                  checked={isCompleted(task.status)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      markTaskDone(task.id);
                    } else {
                      markTaskUndone(task.id);
                    }
                  }}
                  className="mt-0.5"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-sm ${isCompleted(task.status) ? 'text-gray-500 line-through' : 'text-gray-900'} mb-1`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {task.description}
                  </p>
                )}
                
                {/* Task Details in one line */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Badge variant="outline" className="h-5 text-xs px-2">
                    {task.priority || 'Medium'}
                  </Badge>
                  <Badge variant="outline" className="h-5 text-xs px-2">
                    {task['due-type']}
                  </Badge>
                  {task.recurrence && task.recurrence !== 'none' && (
                    <Badge variant="outline" className="h-5 text-xs px-2 bg-blue-50">
                      ↻ {task.recurrence}
                    </Badge>
                  )}
                  <span className="text-gray-400">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Task Note Preview - Compact */}
                {hasNote && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                    <p className="text-xs text-blue-700 line-clamp-1">
                      💬 {hasNote.note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant={hasNote ? "default" : "outline"}
              onClick={() => {
                setNoteTask(task);
                setShowNoteDialog(true);
              }}
              className="h-7 w-7 p-0"
              title={hasNote ? 'Edit Note' : 'Add Note'}
            >
              <FileText className="w-3 h-3" />
            </Button>

            {showPickUp && (
              <Button
                size="sm"
                onClick={() => pickTask(task.id)}
                className="h-7 text-xs bg-teal-600 hover:bg-teal-700 px-2"
              >
                Pick Up
              </Button>
            )}

            {!showPickUp && !showCompleted && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => returnTask(task.id)}
                className="h-7 text-xs px-2"
              >
                Return
              </Button>
            )}
          </div>
        </div>
      </div>
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
          <div className="grid gap-3 lg:grid-cols-1">
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
          <div className="grid gap-3 lg:grid-cols-1">
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
          <div className="grid gap-3 lg:grid-cols-1">
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