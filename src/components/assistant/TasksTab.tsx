import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, ChevronLeft, ChevronRight, CheckCircle, Clock, Circle, User, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
import { getTasksForDate, getTodaysTasks, getPriorityStyles } from '@/lib/taskUtils';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
  startOfDay
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
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Filter tasks to show only assigned to current user or unassigned
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.assigned_to === userProfile?.id || 
      task.assigned_to === null || 
      task.assigned_to === undefined
    );
  }, [tasks, userProfile?.id]);

  // Get today's tasks
  const todaysTasks = useMemo(() => {
    return getTodaysTasks(filteredTasks);
  }, [filteredTasks]);

  // Get week dates
  const weekDates = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(selectedWeek),
      end: endOfWeek(selectedWeek)
    });
  }, [selectedWeek]);

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

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Circle className="w-4 h-4 text-slate-400" />;
    }
  };

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

  const TaskItem = ({ task, compact = false }: { task: Task; compact?: boolean }) => (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg border transition-colors
        ${task.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-background border-border hover:bg-muted/50'}
        ${compact ? 'py-2' : ''}
      `}
      onClick={() => onTaskClick?.(task)}
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0 hover:bg-background/80"
        onClick={(e) => {
          e.stopPropagation();
          toggleTaskStatus(task.id, task.status);
        }}
      >
        {getStatusIcon(task.status)}
      </Button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''} ${compact ? 'text-sm' : ''}`}>
            {task.title}
          </h4>
          {task.priority === 'high' && (
            <Flag className="w-3 h-3 text-red-500" />
          )}
          {task.status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                undoTaskCompletion(task.id);
              }}
            >
              Undo
            </Button>
          )}
        </div>
        
        {!compact && task.description && (
          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getAssistantName(task.assigned_to)}</span>
          {task.priority && (
            <Badge variant="outline" className={`text-xs ${getPriorityStyles(task.priority)}`}>
              {task.priority}
            </Badge>
          )}
          {task['due-type'] && (
            <Badge variant="secondary" className="text-xs">
              {task['due-type']}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Weekly Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {format(startOfWeek(selectedWeek), 'MMM d')} - {format(endOfWeek(selectedWeek), 'MMM d, yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map(date => {
              const dayTasks = getTasksForDate(filteredTasks, date);
              const isCurrentDay = isToday(date);
              
              return (
                <div key={date.toISOString()} className="space-y-2">
                  <div className={`text-center p-2 rounded-lg ${isCurrentDay ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <div className="text-xs font-medium">
                      {format(date, 'EEE')}
                    </div>
                    <div className="text-lg font-bold">
                      {format(date, 'd')}
                    </div>
                  </div>
                  
                  <div className="space-y-1 min-h-[120px]">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className={`
                          text-xs p-2 rounded border-l-2 cursor-pointer transition-colors relative group
                          ${task.status === 'completed' ? 'bg-green-50 border-green-400' : 'bg-background border-primary hover:bg-muted/50'}
                        `}
                        onClick={() => onTaskClick?.(task)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-4 h-4 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskStatus(task.id, task.status);
                            }}
                          >
                            {getStatusIcon(task.status)}
                          </Button>
                          <span className={`font-medium truncate flex-1 ${task.status === 'completed' ? 'line-through' : ''}`}>
                            {task.title}
                          </span>
                          {task.status === 'completed' && (
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="h-4 w-8 p-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                undoTaskCompletion(task.id);
                              }}
                            >
                              ↶
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {task.priority === 'high' && (
                            <Flag className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today's Tasks</span>
            <Badge variant="secondary" className="text-sm">
              {todaysTasks.length} {todaysTasks.length === 1 ? 'task' : 'tasks'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysTasks.length > 0 ? (
            <div className="space-y-3">
              {todaysTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks for today. Great job!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}