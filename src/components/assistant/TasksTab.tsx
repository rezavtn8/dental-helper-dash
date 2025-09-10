import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, ChevronLeft, ChevronRight, CheckCircle, Flag, CalendarDays, List, AlertCircle, Repeat } from 'lucide-react';
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
}

export default function TasksTab({ 
  tasks, 
  assistants, 
  onTaskUpdate, 
  onTaskClick,
  onTaskStatusUpdate,
  onTaskReschedule 
}: TasksTabProps) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  // Set the date to Tuesday, Sep 9, 2025 as requested
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 9)); // Month is 0-indexed, so 8 = September
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Filter tasks to show only assigned to current user or unassigned
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.assigned_to === userProfile?.id || 
      task.assigned_to === null || 
      task.assigned_to === undefined
    );
  }, [tasks, userProfile?.id]);

  // Force re-render when tasks change to ensure UI updates
  useEffect(() => {
    // This ensures the component updates when tasks prop changes from realtime updates
  }, [tasks]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    const tasksForDate = getTasksForDate(filteredTasks, selectedDate);
    console.log('📋 TasksTab - Tasks for selected date:', {
      selectedDate: selectedDate.toISOString().split('T')[0],
      filteredTasksCount: filteredTasks.length,
      tasksForDateCount: tasksForDate.length,
      recurring: tasksForDate.filter(t => t.recurrence && t.recurrence !== 'none').length,
      withDueType: tasksForDate.filter(t => t['due-type'] && t['due-type'] !== 'none').length
    });
    return tasksForDate;
  }, [filteredTasks, selectedDate]);

  // Get calendar dates for proper calendar view
  const calendarDates = useMemo(() => {
    if (viewMode === 'day') {
      return [selectedDate];
    } else {
      // For week view, show full calendar month but highlight the week
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      
      return eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd
      });
    }
  }, [viewMode, selectedDate]);

  // Get current week dates for highlighting
  const currentWeekDates = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(selectedDate),
      end: endOfWeek(selectedDate)
    });
  }, [selectedDate]);

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
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase.from('tasks')
        .update({ 
          assigned_to: userProfile?.id,
          claimed_by: userProfile?.id // Track who claimed it
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      toast.success('Task claimed!');
    } catch (error) {
      console.error('Error claiming task:', error);
      toast.error('Failed to claim task');
    }
  };

  const startTask = async (taskId: string) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'in-progress' as TaskStatus
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      onTaskStatusUpdate?.(dbTaskId, 'in-progress');
      toast.success('Task started!');
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start task');
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed' as TaskStatus,
          completed_by: userProfile?.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      onTaskStatusUpdate?.(dbTaskId, 'completed');
      toast.success('Task completed! 🎉');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const undoTaskCompletion = async (taskId: string) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'pending' as TaskStatus,
          completed_by: null,
          completed_at: null
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      onTaskStatusUpdate?.(dbTaskId, 'pending');
      toast.success('Task reopened');
    } catch (error) {
      console.error('Error reopening task:', error);
      toast.error('Failed to reopen task');
    }
  };

  const unstartTask = async (taskId: string) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase.from('tasks')
        .update({ 
          status: 'pending' as TaskStatus
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      onTaskStatusUpdate?.(dbTaskId, 'pending');
      toast.success('Task reset to pending');
    } catch (error) {
      console.error('Error resetting task:', error);
      toast.error('Failed to reset task');
    }
  };

  const returnTask = async (taskId: string) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase.from('tasks')
        .update({ 
          assigned_to: null,
          claimed_by: null,
          status: 'pending' as TaskStatus
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      toast.success('Task returned to available tasks');
    } catch (error) {
      console.error('Error returning task:', error);
      toast.error('Failed to return task');
    }
  };

  const getAssistantName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    const assistant = assistants.find(a => a.id === assignedTo);
    return assistant?.name || 'Unknown';
  };

  // Group tasks by time periods
  const groupTasksByTime = (tasks: Task[]) => {
    const groups = {
      'Before Opening': [] as Task[],
      'Before 1 PM': [] as Task[],
      'End of Day': [] as Task[],
      'Flexible': [] as Task[]
    };

    tasks.forEach(task => {
      const dueType = task['due-type']?.toLowerCase();
      
      if (dueType === 'morning' || dueType === 'before-opening') {
        groups['Before Opening'].push(task);
      } else if (dueType === 'afternoon' || dueType === 'before-1pm') {
        groups['Before 1 PM'].push(task);
      } else if (dueType === 'evening' || dueType === 'end-of-day' || dueType === 'eod') {
        groups['End of Day'].push(task);
      } else {
        groups['Flexible'].push(task);
      }
    });

    return groups;
  };

  const groupedTasks = useMemo(() => {
    return groupTasksByTime(selectedDateTasks);
  }, [selectedDateTasks]);

  const TaskCard = ({ task }: { task: Task | RecurringTaskInstance }) => {
    const isAssignedToMe = task.assigned_to === userProfile?.id;
    const isUnassigned = !task.assigned_to;
    const isAssignedToOther = task.assigned_to && task.assigned_to !== userProfile?.id;
    const isOverdue = isRecurringInstance(task) && task.isOverdue;
    const wasClaimedByMe = task.claimed_by === userProfile?.id; // Track if user claimed vs owner assigned
    
    console.log('📋 TaskCard rendering:', {
      taskId: task.id,
      taskTitle: task.title,
      isAssignedToMe,
      isUnassigned,
      isAssignedToOther,
      status: task.status,
      claimed_by: task.claimed_by,
      assigned_to: task.assigned_to,
      userProfileId: userProfile?.id
    });
    
    return (
      <div
        className={`
          flex items-center justify-between p-4 border rounded-lg transition-all duration-200 cursor-pointer
          ${task.status === 'completed' ? 'bg-green-50/50 border-green-200' : 
            isOverdue ? 'bg-red-50/50 border-red-200' : 
            'bg-background border-border hover:bg-muted/30'}
        `}
        onClick={() => onTaskClick?.(task)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isOverdue && (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <h4 className={`font-medium text-sm ${
              task.status === 'completed' ? 'line-through text-muted-foreground' : 
              isOverdue ? 'text-red-700' : ''
            }`}>
              {task.title}
            </h4>
            {task.priority === 'high' && (
              <Flag className="w-3 h-3 text-red-500" />
            )}
            {isRecurringInstance(task) && (
              <Repeat className="w-3 h-3 text-primary" />
            )}
            {/* Status Indicators */}
            {task.status === 'completed' && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                ✓ Done
              </Badge>
            )}
            {task.assigned_to === userProfile?.id && task.status === 'in-progress' && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                Started
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.priority && (
              <Badge variant="outline" className={`text-xs h-5 ${getPriorityStyles(task.priority)}`}>
                {task.priority}
              </Badge>
            )}
            {isOverdue && (
              <Badge className="text-xs h-5 bg-red-100 text-red-700 border-red-200">
                OVERDUE
              </Badge>
            )}
            <span>{getAssistantName(task.assigned_to)}</span>
          </div>
          
          {isOverdue && isRecurringInstance(task) && task.overdueReason && (
            <p className="text-xs text-red-600 mt-1">{task.overdueReason}</p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {/* 1. UNASSIGNED TASKS - Show Claim button */}
          {isUnassigned && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                claimTask(task.id);
              }}
            >
              Claim
            </Button>
          )}

          {/* 2. ASSIGNED TO ME - Show appropriate buttons based on status */}
          {isAssignedToMe && (
            <>
              {/* PENDING state - Show Start, Done, and Put Back (only if claimed by me) */}
              {task.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      startTask(task.id);
                    }}
                  >
                    Start
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTask(task.id);
                    }}
                  >
                    Done
                  </Button>
                  {/* Put Back only if task was claimed by me (not owner-assigned) */}
                  {wasClaimedByMe && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full px-4 h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        returnTask(task.id);
                      }}
                    >
                      Put Back
                    </Button>
                  )}
                </>
              )}

              {/* IN-PROGRESS state - Show Started label, Done, and Unstart */}
              {task.status === 'in-progress' && (
                <>
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 px-3 h-7">
                    Started
                  </Badge>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      completeTask(task.id);
                    }}
                  >
                    Done
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full px-4 h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      unstartTask(task.id);
                    }}
                  >
                    Unstart
                  </Button>
                </>
              )}

              {/* COMPLETED state - Show only Undo button */}
              {task.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full px-4 h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    undoTaskCompletion(task.id);
                  }}
                >
                  Undo
                </Button>
              )}
            </>
          )}

          {/* 3. ASSIGNED TO OTHERS - No buttons shown */}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Task Calendar
            </CardTitle>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === 'day' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('day')}
                className="h-8"
              >
                <CalendarDays className="w-4 h-4 mr-1" />
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('week')}
                className="h-8"
              >
                <List className="w-4 h-4 mr-1" />
                Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'day' ? (
            <div>
              {/* Day Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h4 className="font-semibold text-lg min-w-[200px] text-center">
                  {format(selectedDate, 'EEEE, MMM d, yyyy')}
                  {isToday(selectedDate) && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">Today</Badge>
                  )}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Day Calendar View */}
              <div className="space-y-4">
                {/* Tasks Count */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'Task' : 'Tasks'} {isToday(selectedDate) ? 'Today' : 'Scheduled'}
                  </div>
                </div>

                {/* All Day / Flexible Tasks */}
                {groupedTasks['Flexible'].length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <h5 className="text-sm font-semibold text-muted-foreground mb-2">All Day / Flexible</h5>
                    <div className="space-y-2">
                      {groupedTasks['Flexible'].map((task) => (
                        <div key={task.id} className="flex items-center gap-2 p-2 bg-background border border-border rounded text-sm">
                          <div className={`w-3 h-3 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <TaskCard task={task} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Slots */}
                <div className="space-y-3">
                  {Object.entries(groupedTasks).filter(([time]) => time !== 'Flexible').map(([timeSlot, tasks]) => (
                    <div key={timeSlot}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-sm font-semibold text-muted-foreground min-w-[120px]">
                          {timeSlot}
                        </div>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      {tasks.length > 0 ? (
                        <div className="grid gap-2 ml-[132px]">
                          {tasks.map((task) => (
                            <div key={task.id} className={`
                              p-3 rounded-lg border-l-4 bg-background border shadow-sm
                              ${task.priority === 'high' ? 'border-l-red-500 bg-red-50/50' : 
                                task.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50/50' : 
                                'border-l-green-500 bg-green-50/50'}
                            `}>
                              <TaskCard task={task} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="ml-[132px] text-sm text-muted-foreground italic">
                          No tasks scheduled
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {selectedDateTasks.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">No tasks scheduled</h3>
                    <p className="text-sm text-muted-foreground">
                      {isToday(selectedDate) ? "You're all caught up for today!" : `No tasks on ${format(selectedDate, 'MMM d')}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h4 className="font-semibold text-lg min-w-[300px] text-center">
                  {format(startOfWeek(selectedDate), 'MMM d')} - {format(endOfWeek(selectedDate), 'MMM d, yyyy')}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Week Calendar Grid */}
              <div className="space-y-4">
                {/* Week Headers */}
                <div className="grid grid-cols-7 gap-2">
                  {currentWeekDates.map(date => {
                    const dayTasks = getTasksForDate(filteredTasks, date);
                    const isCurrentDay = isToday(date);
                    
                    return (
                      <div key={date.toISOString()} className="text-center">
                        <div className={`
                          p-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors
                          ${isCurrentDay ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}
                        `}
                        onClick={() => setSelectedDate(date)}
                        >
                          <div>{format(date, 'EEE')}</div>
                          <div className="text-lg">{format(date, 'd')}</div>
                          {dayTasks.length > 0 && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {dayTasks.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Week Tasks Overview */}
                <div className="grid grid-cols-7 gap-2">
                  {currentWeekDates.map(date => {
                    const dayTasks = getTasksForDate(filteredTasks, date);
                    const isCurrentDay = isToday(date);
                    
                    return (
                      <div key={date.toISOString()} className={`
                        min-h-[200px] p-2 rounded-lg border transition-all duration-200
                        ${isCurrentDay ? 'bg-primary/5 border-primary/30' : 'bg-background border-border'}
                      `}>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 4).map((task) => (
                            <div key={task.id} className={`
                              p-1.5 rounded text-xs border-l-2 bg-background/80 cursor-pointer hover:bg-muted/50
                              ${task.priority === 'high' ? 'border-l-red-500' : 
                                task.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'}
                            `}
                            onClick={() => {
                              setSelectedDate(date);
                              setViewMode('day');
                            }}
                            >
                              <div className="font-medium truncate">{task.title}</div>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="outline" className="text-xs h-4 px-1">
                                  {task.priority || 'medium'}
                                </Badge>
                                {task.status === 'completed' && (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                )}
                                {task.assigned_to === userProfile?.id && task.status === 'pending' && (
                                  <Badge variant="secondary" className="text-xs h-4 px-1 bg-blue-100 text-blue-700">
                                    Claimed
                                  </Badge>
                                )}
                                {task.assigned_to === userProfile?.id && task.status === 'in-progress' && (
                                  <Badge variant="secondary" className="text-xs h-4 px-1 bg-orange-100 text-orange-700">
                                    Started
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                          {dayTasks.length > 4 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{dayTasks.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks List for Selected Date */}
      {selectedDateTasks.length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([timeGroup, tasks]) => (
            tasks.length > 0 && (
              <Card key={timeGroup}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{timeGroup}</span>
                    <Badge variant="secondary" className="text-sm">
                      {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
}