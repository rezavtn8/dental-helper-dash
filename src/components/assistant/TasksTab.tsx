import React, { useState, useMemo } from 'react';
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

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
    return getTasksForDate(filteredTasks, selectedDate);
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

  const assignTask = (taskId: string) => {
    onTaskStatusUpdate?.(taskId, 'in-progress');
    onTaskUpdate?.();
  };

  const undoTaskCompletion = (taskId: string) => {
    onTaskStatusUpdate?.(taskId, 'pending');
    onTaskUpdate?.();
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
    const isOverdue = isRecurringInstance(task) && task.isOverdue;
    
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
          {/* Unassigned tasks - only Start button */}
          {isUnassigned && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                assignTask(task.id);
              }}
            >
              Start
            </Button>
          )}

          {/* Assigned tasks that are not completed - Show Start + Done buttons */}
          {isAssignedToMe && task.status !== 'completed' && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskStatusUpdate?.(task.id, 'in-progress');
                  onTaskUpdate?.();
                }}
              >
                Start
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskStatusUpdate?.(task.id, 'completed');
                  onTaskUpdate?.();
                }}
              >
                Done
              </Button>
            </>
          )}

          {/* Completed tasks - only Undo button */}
          {isAssignedToMe && task.status === 'completed' && (
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
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Day Overview */}
              <div className={`p-6 rounded-lg border-2 ${isToday(selectedDate) ? 'bg-primary/5 border-primary/50' : 'bg-muted/30 border-border'}`}>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'Task' : 'Tasks'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Month/Week Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h4 className="font-semibold text-lg min-w-[200px] text-center">
                  {format(selectedDate, 'MMMM yyyy')}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Calendar Grid */}
              <div className="space-y-2">
                {/* Week headers */}
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar dates */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDates.map(date => {
                    const dayTasks = getTasksForDate(filteredTasks, date);
                    const isCurrentDay = isToday(date);
                    const isSelectedDay = isSameDay(date, selectedDate);
                    const isCurrentMonth = isSameMonth(date, selectedDate);
                    const isInCurrentWeek = currentWeekDates.some(weekDate => isSameDay(weekDate, date));
                    
                    return (
                      <div
                        key={date.toISOString()}
                        className={`
                          min-h-[80px] p-2 rounded-lg border cursor-pointer transition-all duration-200 relative
                          ${isCurrentDay ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 
                            isSelectedDay ? 'bg-muted border-primary ring-2 ring-primary/30' : 
                            isInCurrentWeek ? 'bg-primary/5 border-primary/30' :
                            isCurrentMonth ? 'bg-background border-border hover:bg-muted/50' : 
                            'bg-muted/30 border-muted text-muted-foreground'}
                        `}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="flex flex-col h-full">
                          {/* Date number */}
                          <div className={`
                            flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold mb-1
                            ${isCurrentDay ? 'bg-primary-foreground/20' : ''}
                          `}>
                            {format(date, 'd')}
                          </div>
                          
                          {/* Task indicators */}
                          <div className="flex-1 space-y-1">
                            {dayTasks.slice(0, 3).map((task, index) => (
                              <div
                                key={task.id}
                                className={`
                                  w-full h-1.5 rounded-full
                                  ${task.status === 'completed' ? 'bg-green-500' :
                                    task.priority === 'high' ? 'bg-red-500' :
                                    task.priority === 'medium' ? 'bg-orange-500' :
                                    'bg-blue-500'}
                                `}
                              />
                            ))}
                            
                            {dayTasks.length > 3 && (
                              <div className="text-xs text-center font-medium">
                                +{dayTasks.length - 3}
                              </div>
                            )}
                          </div>
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

      {/* Tasks List */}
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
        
        {selectedDateTasks.length === 0 && (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks for {format(selectedDate, 'MMMM d, yyyy')}. Great job!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}