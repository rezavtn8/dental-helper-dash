import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, ChevronLeft, ChevronRight, CheckCircle, Flag, CalendarDays, List, AlertCircle, Repeat, Clock, User, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
import { getTasksForDate, getPriorityStyles, isRecurringInstance, RecurringTaskInstance } from '@/lib/taskUtils';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isToday,
  addDays,
  subDays,
  isSameMonth
} from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TasksTabProps {
  tasks: Task[];
  assistants: Assistant[];
  onTaskUpdate?: () => void;
  onTaskClick?: (task: Task) => void;
  onTaskStatusUpdate?: (taskId: string, newStatus: TaskStatus) => void;
  onTaskReschedule?: (taskId: string, newDate: Date) => void;
  setTasks?: (tasks: Task[]) => void;
}

export default function TasksTab({ 
  tasks, 
  assistants, 
  onTaskUpdate, 
  onTaskClick,
  onTaskStatusUpdate,
  onTaskReschedule,
  setTasks
}: TasksTabProps) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Filter tasks to show only assigned to current user or unassigned
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.assigned_to === userProfile?.id || 
      task.assigned_to === null || 
      task.assigned_to === undefined
    );
  }, [tasks, userProfile?.id]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    const tasksForDate = getTasksForDate(filteredTasks, selectedDate);
    console.log('📋 TasksTab - Tasks for selected date:', {
      selectedDate: selectedDate.toISOString().split('T')[0],
      filteredTasksCount: filteredTasks.length,
      tasksForDateCount: tasksForDate.length,
      recurring: tasksForDate.filter(t => t.recurrence && t.recurrence !== 'none').length,
      instances: tasksForDate.filter(t => 'isRecurringInstance' in t && t.isRecurringInstance).length,
      withDueType: tasksForDate.filter(t => t['due-type'] && t['due-type'] !== 'none').length,
      withSpecificDates: tasksForDate.filter(t => t.custom_due_date || t['due-date']).length
    });
    return tasksForDate;
  }, [filteredTasks, selectedDate]);

  // Show connect to clinic message if no clinic access
  if (!userProfile?.clinic_id) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect to a Clinic</h3>
            <p className="text-muted-foreground mb-4">
              To view and manage your tasks, you need to join a clinic first.
            </p>
            <Button onClick={() => navigate('/join')} className="mb-2">
              Join a Clinic
            </Button>
            <Button variant="outline" onClick={() => navigate('/hub')}>
              Go to Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const claimTask = async (taskId: string) => {
    if (isProcessing) return; // Prevent multiple simultaneous operations
    
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    setIsProcessing(taskId);
    
    try {
      const { error } = await supabase.from('tasks')
        .update({ 
          assigned_to: userProfile?.id,
          claimed_by: userProfile?.id
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      
      toast.success('Task claimed!');
      
      // Wait a bit before allowing next operation and refresh
      setTimeout(() => {
        onTaskUpdate?.();
        setIsProcessing(null);
      }, 500);
      
    } catch (error) {
      console.error('Error claiming task:', error);
      toast.error('Failed to claim task');
      setIsProcessing(null);
    }
  };

  const startTask = async (taskId: string) => {
    if (isProcessing) return;
    
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    setIsProcessing(taskId);
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'in-progress' as TaskStatus
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      
      toast.success('Task started!');
      onTaskStatusUpdate?.(dbTaskId, 'in-progress');
      
      setTimeout(() => {
        onTaskUpdate?.();
        setIsProcessing(null);
      }, 500);
      
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start task');
      setIsProcessing(null);
    }
  };

  const completeTask = async (taskId: string) => {
    if (isProcessing) return;
    
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    setIsProcessing(taskId);
    
    try {
      const completedAt = new Date().toISOString();
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed' as TaskStatus,
          completed_by: userProfile?.id,
          completed_at: completedAt
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      
      toast.success('Task completed! 🎉');
      onTaskStatusUpdate?.(dbTaskId, 'completed');
      
      setTimeout(() => {
        onTaskUpdate?.();
        setIsProcessing(null);
      }, 500);
      
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
      setIsProcessing(null);
    }
  };

  const undoTaskCompletion = async (taskId: string) => {
    if (isProcessing) return;
    
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    setIsProcessing(taskId);
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'pending' as TaskStatus,
          completed_by: null,
          completed_at: null
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      
      toast.success('Task reopened');
      onTaskStatusUpdate?.(dbTaskId, 'pending');
      
      setTimeout(() => {
        onTaskUpdate?.();
        setIsProcessing(null);
      }, 500);
      
    } catch (error) {
      console.error('Error reopening task:', error);
      toast.error('Failed to reopen task');
      setIsProcessing(null);
    }
  };

  const unstartTask = async (taskId: string) => {
    if (isProcessing) return;
    
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    setIsProcessing(taskId);
    
    try {
      const { error } = await supabase.from('tasks')
        .update({ 
          status: 'pending' as TaskStatus
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      
      toast.success('Task reset to pending');
      onTaskStatusUpdate?.(dbTaskId, 'pending');
      
      setTimeout(() => {
        onTaskUpdate?.();
        setIsProcessing(null);
      }, 500);
      
    } catch (error) {
      console.error('Error resetting task:', error);
      toast.error('Failed to reset task');
      setIsProcessing(null);
    }
  };

  const returnTask = async (taskId: string) => {
    if (isProcessing) return;
    
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    setIsProcessing(taskId);
    
    try {
      const { error } = await supabase.from('tasks')
        .update({ 
          assigned_to: null,
          claimed_by: null,
          status: 'pending' as TaskStatus
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      
      toast.success('Task returned to available tasks');
      
      setTimeout(() => {
        onTaskUpdate?.();
        setIsProcessing(null);
      }, 500);
      
    } catch (error) {
      console.error('Error returning task:', error);
      toast.error('Failed to return task');
      setIsProcessing(null);
    }
  };

  const getAssistantName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    const assistant = assistants.find(a => a.id === assignedTo);
    return assistant?.name || 'Unknown';
  };

  // Compact Task Card Component
  const TaskCard = ({ task }: { task: Task | RecurringTaskInstance }) => {
    const isAssignedToMe = task.assigned_to === userProfile?.id;
    const isUnassigned = !task.assigned_to;
    const isOverdue = isRecurringInstance(task) && task.isOverdue;
    const wasClaimedByMe = task.claimed_by === userProfile?.id;
    
    return (
      <div className={`
        flex items-center justify-between p-3 border rounded-lg transition-all hover:shadow-sm
        ${task.status === 'completed' ? 'bg-green-50 border-green-200' : 
          isOverdue ? 'bg-red-50 border-red-200' : 
          isUnassigned ? 'bg-blue-50 border-blue-200' :
          'bg-gray-50 border-gray-200'}
      `}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
            <h4 className={`font-medium text-sm ${
              task.status === 'completed' ? 'line-through text-muted-foreground' : 
              isOverdue ? 'text-red-700' : ''
            }`}>
              {task.title}
            </h4>
            {task.priority === 'high' && <Flag className="w-3 h-3 text-red-500" />}
            {isRecurringInstance(task) && <Repeat className="w-3 h-3 text-primary" />}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.priority && (
              <Badge variant="outline" className={`text-xs h-4 px-1 ${getPriorityStyles(task.priority)}`}>
                {task.priority}
              </Badge>
            )}
            {task['due-type'] && (
              <Badge variant="outline" className="text-xs h-4 px-1">
                {task['due-type']?.replace('-', ' ')}
              </Badge>
            )}
            <span className="text-xs">{getAssistantName(task.assigned_to)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Show task status for debugging */}
          <Badge variant="secondary" className="text-xs">
            {task.status || 'no-status'}
          </Badge>
          
          {/* Unassigned Tasks - Show Claim button */}
          {isUnassigned && task.status !== 'completed' && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('🎯 Claiming task:', task.id);
                claimTask(task.id);
              }}
              className="h-8 px-3 text-xs"
              disabled={isProcessing !== null}
            >
              {isProcessing === task.id ? (
                <div className="w-3 h-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
              ) : (
                <Target className="w-3 h-3 mr-1" />
              )}
              {isProcessing === task.id ? 'Claiming...' : 'Claim'}
            </Button>
          )}

          {/* Assigned to Me - Show action buttons */}
          {isAssignedToMe && (
            <>
              {task.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('▶️ Starting task:', task.id);
                      startTask(task.id);
                    }}
                    className="h-8 px-3 text-xs"
                    disabled={isProcessing !== null}
                  >
                    {isProcessing === task.id ? (
                      <div className="w-3 h-3 animate-spin rounded-full border-2 border-primary border-t-transparent mr-1" />
                    ) : null}
                    {isProcessing === task.id ? 'Starting...' : 'Start'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('✅ Completing task:', task.id);
                      completeTask(task.id);
                    }}
                    className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
                    disabled={isProcessing !== null}
                  >
                    {isProcessing === task.id ? (
                      <div className="w-3 h-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
                    ) : null}
                    {isProcessing === task.id ? 'Completing...' : 'Done'}
                  </Button>
                  {wasClaimedByMe && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('↩️ Returning task:', task.id);
                        returnTask(task.id);
                      }}
                      className="h-8 px-3 text-xs"
                      disabled={isProcessing !== null}
                    >
                      Return
                    </Button>
                  )}
                </>
              )}

              {task.status === 'in-progress' && (
                <>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('✅ Completing in-progress task:', task.id);
                      completeTask(task.id);
                    }}
                    className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
                    disabled={isProcessing !== null}
                  >
                    Done
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🔄 Resetting task:', task.id);
                      unstartTask(task.id);
                    }}
                    className="h-8 px-3 text-xs"
                    disabled={isProcessing !== null}
                  >
                    Reset
                  </Button>
                </>
              )}

              {task.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('↺ Undoing task completion:', task.id);
                    undoTaskCompletion(task.id);
                  }}
                  className="h-8 px-3 text-xs"
                  disabled={isProcessing !== null}
                >
                  Undo
                </Button>
              )}
            </>
          )}
          
          {/* Show no buttons case for debugging */}
          {!isUnassigned && !isAssignedToMe && (
            <Badge variant="outline" className="text-xs">
              Assigned to other
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Task Calendar</h2>
            <Badge variant="secondary">
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-md">
            <Button
              variant={viewMode === 'day' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('day')}
              className="h-7 px-3"
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('week')}
              className="h-7 px-3"
            >
              Week
            </Button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(viewMode === 'day' ? subDays(selectedDate, 1) : subWeeks(selectedDate, 1))}
              className="h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="h-8 px-3 text-xs"
              disabled={isToday(selectedDate) && viewMode === 'day'}
            >
              Today
            </Button>
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold">
              {viewMode === 'day' 
                ? format(selectedDate, 'EEEE, MMM d, yyyy')
                : `${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`
              }
            </h3>
            {isToday(selectedDate) && viewMode === 'day' && (
              <Badge className="mt-1 bg-primary text-primary-foreground text-xs">Today</Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(viewMode === 'day' ? addDays(selectedDate, 1) : addWeeks(selectedDate, 1))}
            className="h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Processing indicator */}
      {isProcessing && (
        <Card className="p-2 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 text-orange-700">
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            <span className="text-sm">Processing task action...</span>
          </div>
        </Card>
      )}

      {/* Tasks Display */}
      {viewMode === 'day' ? (
        <div className="space-y-3">
          {selectedDateTasks.length > 0 ? (
            selectedDateTasks.map((task, index) => (
              <TaskCard key={`${task.id}-${index}`} task={task} />
            ))
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks for today</h3>
                <p className="text-sm text-muted-foreground">
                  Enjoy your free time or check other dates for upcoming tasks.
                </p>
              </div>
            </Card>
          )}
        </div>
      ) : (
        // Week view
        <div className="grid grid-cols-7 gap-2">
          {eachDayOfInterval({
            start: startOfWeek(selectedDate),
            end: endOfWeek(selectedDate)
          }).map((date) => {
            const dayTasks = getTasksForDate(filteredTasks, date);
            const isCurrentDate = isSameDay(date, selectedDate);
            const isCurrentMonth = isSameMonth(date, selectedDate);
            
            return (
              <Card 
                key={date.toISOString()} 
                className={`p-2 cursor-pointer transition-colors hover:shadow-md ${
                  isCurrentDate ? 'ring-2 ring-primary' : ''
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="text-center">
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(date) ? 'text-primary font-semibold' : 
                    isCurrentDate ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-lg font-semibold mb-2 ${
                    isToday(date) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' :
                    isCurrentDate ? 'text-primary' : ''
                  }`}>
                    {format(date, 'd')}
                  </div>
                  {dayTasks.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayTasks.length}
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}