import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskStatus, isCompleted } from '@/lib/taskStatus';
import { getPriorityStyles } from '@/lib/taskUtils';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import TaskNoteDialog from './TaskNoteDialog';
import { TaskActionButton } from '@/components/ui/task-action-button';
import { 
  Calendar, 
  Clock, 
  CheckCircle2,
  User,
  Plus,
  ArrowLeft,
  Target,
  Sparkles,
  FileText,
  ListChecks,
  Flag,
  Undo2,
  ArrowUp
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
          custom_due_date: taskData.custom_due_date ? calculateNextDueDate(taskData.custom_due_date, taskData.recurrence) : null,
          checklist: taskData.checklist && Array.isArray(taskData.checklist) 
            ? taskData.checklist.map((item: any) => ({ ...item, completed: false })) 
            : null
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
    const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});
    
    // Initialize checklist state from task data
    useEffect(() => {
      if (task.checklist && Array.isArray(task.checklist)) {
        const initialState: Record<number, boolean> = {};
        task.checklist.forEach((item: any, index: number) => {
          initialState[index] = item.completed || false;
        });
        setChecklistState(initialState);
      }
    }, [task.checklist]);

    const handleChecklistToggle = async (itemIndex: number) => {
      const newState = { ...checklistState, [itemIndex]: !checklistState[itemIndex] };
      setChecklistState(newState);

      // Update the task's checklist in the database
      if (task.checklist && Array.isArray(task.checklist)) {
        const updatedChecklist = task.checklist.map((item: any, index: number) => ({
          ...item,
          completed: newState[index] || false
        }));

        try {
          const { error } = await supabase
            .from('tasks')
            .update({ checklist: updatedChecklist })
            .eq('id', task.id);

          if (error) throw error;
        } catch (error) {
          console.error('Error updating checklist:', error);
          // Revert state on error
          setChecklistState(checklistState);
          toast.error('Failed to update checklist');
        }
      }
    };

    const isChecklistComplete = task.checklist && Array.isArray(task.checklist) 
      ? task.checklist.every((item: any, index: number) => checklistState[index] || item.completed)
      : true;
    
    return (
      <div className="relative overflow-hidden bg-white rounded-lg border border-blue-100 hover:border-blue-200 hover:shadow-sm transition-all duration-500 p-3 cursor-pointer group animate-fade-in">
        {/* Rotating Border Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg opacity-0 group-hover:opacity-20 transition-all duration-700 group-hover:animate-pulse" />
        
        {/* Content */}
        <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {/* Task Action Button */}
              {!showPickUp && !showCompleted && (
                <TaskActionButton
                  status={task.status}
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCompleted(task.status)) {
                      markTaskUndone(task.id);
                    } else {
                      markTaskDone(task.id);
                    }
                  }}
                  className="mt-0.5"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-medium text-sm transition-all duration-200 ${isCompleted(task.status) ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  {task.priority === 'high' && (
                    <Flag className="w-3 h-3 text-red-500 animate-pulse" />
                  )}
                  {isCompleted(task.status) && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 animate-scale-in">
                      ✓ Done
                    </Badge>
                  )}
                </div>
                
                {task.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {task.description}
                  </p>
                )}
                
                {/* Task Details in one line */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Badge variant="outline" className="h-4 text-xs px-1.5">
                    {task.priority || 'Medium'}
                  </Badge>
                  <Badge variant="outline" className="h-4 text-xs px-1.5">
                    {task['due-type']}
                  </Badge>
                  {task.recurrence && task.recurrence !== 'none' && (
                    <Badge variant="outline" className="h-4 text-xs px-1.5 bg-blue-50">
                      ↻ {task.recurrence}
                    </Badge>
                  )}
                  {task.checklist && Array.isArray(task.checklist) && task.checklist.length > 0 && (
                    <Badge variant="outline" className="h-4 text-xs px-1.5 bg-green-50 flex items-center gap-1">
                      <ListChecks className="h-2 w-2" />
                      {task.checklist.filter((item: any, index: number) => 
                        checklistState[index] || item.completed
                      ).length}/{task.checklist.length}
                    </Badge>
                  )}
                  <span className="text-gray-400">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Checklist Items */}
                {task.checklist && Array.isArray(task.checklist) && task.checklist.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-2">
                    <div className="space-y-1">
                      {task.checklist.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Checkbox
                            checked={checklistState[index] || item.completed || false}
                            onCheckedChange={() => handleChecklistToggle(index)}
                            className="h-3 w-3"
                            disabled={showPickUp || showCompleted}
                          />
                          <span className={`text-xs ${
                            checklistState[index] || item.completed 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-700'
                          }`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    {task.checklist.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        {task.checklist.filter((item: any, index: number) => 
                          checklistState[index] || item.completed
                        ).length} / {task.checklist.length} completed
                      </div>
                    )}
                  </div>
                )}

                {/* Task Note Preview - Compact */}
                {hasNote && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-1.5 mb-2">
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
              className="h-6 w-6 p-0"
              title={hasNote ? 'Edit Note' : 'Add Note'}
            >
              <FileText className="w-3 h-3" />
            </Button>

            {showPickUp && (
              <TaskActionButton
                status={task.status}
                action="pickup"
                size="sm"
                showLabel={true}
                onClick={(e) => {
                  e.stopPropagation();
                  pickTask(task.id);
                }}
                className="h-6 px-2 bg-blue-600 hover:bg-blue-700 text-white"
              />
            )}

            {!showPickUp && !showCompleted && (
              <>
                {isCompleted(task.status) && (
                  <TaskActionButton
                    status={task.status}
                    action="undo"
                    size="sm" 
                    showLabel={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      markTaskUndone(task.id);
                    }}
                    className="h-6 px-2 border-green-200 text-green-700 hover:bg-green-50"
                    variant="outline"
                  />
                )}
                
                <TaskActionButton
                  status={task.status}
                  action="return"
                  size="sm"
                  showLabel={true}
                  onClick={(e) => {
                    e.stopPropagation();
                    returnTask(task.id);
                  }}
                  className="h-6 px-2"
                  variant="outline"
                />
              </>
            )}
        </div>
      </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-blue-900 mb-3">Today's Tasks</h1>
        <p className="text-blue-600 text-lg">Manage your daily assignments and pick up new tasks</p>
      </div>

      {/* Interactive Wheel-Style Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
          <CardContent className="p-0">
            {/* Animated Background Wheel */}
            <div className="absolute inset-0 bg-blue-50 transition-opacity duration-300 opacity-50 hover:opacity-100" />
            
            {/* Rotating Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg opacity-20 transition-all duration-700 hover:animate-pulse hover:opacity-40" />
            
            {/* Content */}
            <div className="relative p-4 z-10">
              <div className="flex items-center space-x-3">
                {/* Rotating Icon Wheel */}
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg transform transition-all duration-500 hover:rotate-180 hover:scale-110">
                  {/* Inner rotating circle */}
                  <div className="absolute inset-1 rounded-full bg-white/20 transition-all duration-700 hover:rotate-[-180deg]" />
                  <Target className="w-5 h-5 text-white z-10 transition-all duration-500 hover:scale-125" />
                </div>
                
                <div>
                  <p className="text-xl font-bold text-blue-900 transition-all duration-300 hover:scale-110">{myTasks.length}</p>
                  <p className="text-xs text-blue-700 font-medium">My Tasks</p>
                </div>
              </div>
              
              {/* Progress ring effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 hover:h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
          <CardContent className="p-0">
            {/* Animated Background Wheel */}
            <div className="absolute inset-0 bg-green-50 transition-opacity duration-300 opacity-50 hover:opacity-100" />
            
            {/* Rotating Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-green-600 rounded-lg opacity-20 transition-all duration-700 hover:animate-pulse hover:opacity-40" />
            
            {/* Content */}
            <div className="relative p-4 z-10">
              <div className="flex items-center space-x-3">
                {/* Rotating Icon Wheel */}
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg transform transition-all duration-500 hover:rotate-180 hover:scale-110">
                  {/* Inner rotating circle */}
                  <div className="absolute inset-1 rounded-full bg-white/20 transition-all duration-700 hover:rotate-[-180deg]" />
                  <CheckCircle2 className="w-5 h-5 text-white z-10 transition-all duration-500 hover:scale-125" />
                </div>
                
                <div>
                  <p className="text-xl font-bold text-green-900 transition-all duration-300 hover:scale-110">{completedTasks.length}</p>
                  <p className="text-xs text-green-700 font-medium">Completed</p>
                </div>
              </div>
              
              {/* Progress ring effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 hover:h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
          <CardContent className="p-0">
            {/* Animated Background Wheel */}
            <div className="absolute inset-0 bg-blue-50 transition-opacity duration-300 opacity-50 hover:opacity-100" />
            
            {/* Rotating Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg opacity-20 transition-all duration-700 hover:animate-pulse hover:opacity-40" />
            
            {/* Content */}
            <div className="relative p-4 z-10">
              <div className="flex items-center space-x-3">
                {/* Rotating Icon Wheel */}
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg transform transition-all duration-500 hover:rotate-180 hover:scale-110">
                  {/* Inner rotating circle */}
                  <div className="absolute inset-1 rounded-full bg-white/20 transition-all duration-700 hover:rotate-[-180deg]" />
                  <Plus className="w-5 h-5 text-white z-10 transition-all duration-500 hover:scale-125" />
                </div>
                
                <div>
                  <p className="text-xl font-bold text-blue-900 transition-all duration-300 hover:scale-110">{unassignedTasks.length}</p>
                  <p className="text-xs text-blue-700 font-medium">Available</p>
                </div>
              </div>
              
              {/* Progress ring effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 hover:h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Active Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
            <User className="w-6 h-6 mr-3 text-blue-600" />
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
        <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
          <Sparkles className="w-6 h-6 mr-3 text-blue-600" />
          Available Tasks ({unassignedTasks.length})
        </h2>
        
        {unassignedTasks.length === 0 ? (
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">All caught up!</h3>
              <p className="text-blue-700">No available tasks to pick up right now. Great work!</p>
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
          <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-3">No tasks yet</h3>
            <p className="text-blue-700">Tasks will appear here when they're created by your practice owner.</p>
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