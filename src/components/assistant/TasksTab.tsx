import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, ChevronLeft, ChevronRight, CheckCircle, Flag, CalendarDays, List } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
import { getTasksForDate, getPriorityStyles } from '@/lib/taskUtils';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
  startOfDay,
  addDays,
  subDays
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

  // Get week dates for weekly view
  const weekDates = useMemo(() => {
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

  const toggleTaskStatus = (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === 'completed' ? 'pending' : 
                      currentStatus === 'pending' ? 'in-progress' : 
                      'completed';
    onTaskStatusUpdate?.(taskId, nextStatus);
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

  const assignTask = (taskId: string) => {
    onTaskStatusUpdate?.(taskId, 'in-progress');
    onTaskUpdate?.();
  };

  // Group tasks by time periods based on due-type
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

  const TaskCard = ({ task }: { task: Task }) => {
    const isAssignedToMe = task.assigned_to === userProfile?.id;
    const isUnassigned = !task.assigned_to;
    
    return (
      <div
        className={`
          flex items-center justify-between p-4 border rounded-lg transition-all duration-200 cursor-pointer
          ${task.status === 'completed' ? 'bg-green-50/50 border-green-200' : 'bg-background border-border hover:bg-muted/30'}
        `}
        onClick={() => onTaskClick?.(task)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </h4>
            {task.priority === 'high' && (
              <Flag className="w-3 h-3 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.priority && (
              <Badge variant="outline" className={`text-xs h-5 ${getPriorityStyles(task.priority)}`}>
                {task.priority}
              </Badge>
            )}
            <span>{getAssistantName(task.assigned_to)}</span>
          </div>
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
    <div className="space-y-4">
      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="h-8"
              >
                <CalendarDays className="w-4 h-4 mr-1" />
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
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
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className={`text-center p-4 rounded-lg min-w-[160px] ${isToday(selectedDate) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <div className="text-sm font-medium">
                  {format(selectedDate, 'EEEE')}
                </div>
                <div className="text-2xl font-bold">
                  {format(selectedDate, 'MMM d, yyyy')}
                </div>
                <div className="text-sm mt-1">
                  {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">
                  {format(startOfWeek(selectedDate), 'MMM d')} - {format(endOfWeek(selectedDate), 'MMM d, yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map(date => {
                  const dayTasks = getTasksForDate(filteredTasks, date);
                  const isCurrentDay = isToday(date);
                  const isSelectedDay = isSameDay(date, selectedDate);
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all duration-200
                        ${isCurrentDay ? 'bg-primary text-primary-foreground border-primary' : 
                          isSelectedDay ? 'bg-muted border-primary' : 'bg-background border-border hover:bg-muted/50'}
                      `}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-lg font-bold">
                          {format(date, 'd')}
                        </div>
                        <div className="flex justify-center mt-1">
                          {dayTasks.length > 0 && (
                            <div className={`
                              text-xs px-2 py-1 rounded-full
                              ${isCurrentDay ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/20 text-primary'}
                            `}>
                              {dayTasks.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks for Selected Date */}
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
                <div className="space-y-2">
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