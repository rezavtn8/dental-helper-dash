import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
import { RecurringTaskInstance, getTasksForDate as getTasksForDateUtil, getTasksForDateRange, isRecurringInstance } from '@/lib/taskUtils';
import TaskBlock from './TaskBlock';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isToday,
  isSameMonth
} from 'date-fns';

interface TaskCalendarProps {
  tasks: Task[];
  assistants: Assistant[];
  viewMode: 'daily' | 'weekly' | 'monthly';
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTaskClick: (task: Task | RecurringTaskInstance) => void;
  onDayClick: (date: Date) => void;
  onTaskStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
  onTaskReschedule: (taskId: string, newDate: Date) => void;
}

export default function TaskCalendar({
  tasks,
  assistants,
  viewMode,
  selectedDate,
  onDateSelect,
  onTaskClick,
  onDayClick,
  onTaskStatusUpdate,
  onTaskReschedule
}: TaskCalendarProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Generate assistant colors with modern gradients
  const getAssistantColor = (assistantId: string | null | undefined) => {
    if (!assistantId) return 'bg-gradient-to-br from-muted/50 to-muted/70 border-muted text-muted-foreground';
    
    const colors = [
      'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-blue-800',
      'bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-green-800',
      'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-purple-800',
      'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 text-orange-800',
      'bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300 text-pink-800',
      'bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-300 text-indigo-800',
      'bg-gradient-to-br from-cyan-100 to-cyan-200 border-cyan-300 text-cyan-800',
      'bg-gradient-to-br from-teal-100 to-teal-200 border-teal-300 text-teal-800',
    ];
    
    const index = assistants.findIndex(a => a.id === assistantId);
    return colors[index % colors.length];
  };

  // Calculate date range for the current view mode
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'daily':
        return [selectedDate];
      case 'weekly':
        return eachDayOfInterval({
          start: startOfWeek(selectedDate),
          end: endOfWeek(selectedDate)
        });
      case 'monthly':
        return eachDayOfInterval({
          start: startOfWeek(startOfMonth(selectedDate)),
          end: endOfWeek(endOfMonth(selectedDate))
        });
      default:
        return [selectedDate];
    }
  }, [viewMode, selectedDate]);

  // Get tasks for a specific date using the utility function that handles recurrence
  const getTasksForDate = (date: Date): (Task | RecurringTaskInstance)[] => {
    return getTasksForDateUtil(tasks, date);
  };

  // Navigation handlers
  const navigatePrevious = () => {
    switch (viewMode) {
      case 'daily':
        onDateSelect(subDays(selectedDate, 1));
        break;
      case 'weekly':
        onDateSelect(subWeeks(selectedDate, 1));
        break;
      case 'monthly':
        onDateSelect(subMonths(selectedDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case 'daily':
        onDateSelect(addDays(selectedDate, 1));
        break;
      case 'weekly':
        onDateSelect(addWeeks(selectedDate, 1));
        break;
      case 'monthly':
        onDateSelect(addMonths(selectedDate, 1));
        break;
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedTask) {
      onTaskReschedule(draggedTask.id, targetDate);
      setDraggedTask(null);
    }
  };

  const headerFormat = viewMode === 'monthly' ? 'MMMM yyyy' : 
                      viewMode === 'weekly' ? "'Week of' MMM d, yyyy" : 
                      'EEEE, MMM d, yyyy';

  return (
    <div className="space-y-6">
      {/* Header with navigation - Enhanced Design */}
      <div className="bg-gradient-to-r from-muted/20 via-background to-muted/20 p-6 rounded-2xl border border-border/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-background/80 rounded-xl p-2 shadow-sm border border-border/50">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={navigatePrevious}
                className="w-10 h-10 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h4 className="font-bold text-xl min-w-[280px] text-center px-4 py-2">
                {format(selectedDate, headerFormat)}
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={navigateNext}
                className="w-10 h-10 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDateSelect(new Date())}
            className="flex items-center gap-2 h-10 px-4 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 rounded-xl transition-all duration-200 font-semibold"
          >
            <CalendarIcon className="w-4 h-4" />
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Grid - Enhanced Design */}
      <div className={`grid gap-4 ${
        viewMode === 'monthly' ? 'grid-cols-7' :
        viewMode === 'weekly' ? 'grid-cols-7' :
        'grid-cols-1'
      }`}>
        {/* Week headers for weekly/monthly view */}
        {(viewMode === 'weekly' || viewMode === 'monthly') && (
          ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className="p-4 text-center text-sm font-bold text-foreground bg-gradient-to-b from-muted/50 to-muted/30 rounded-t-xl border-b-2 border-primary/20">
              {day.substring(0, 3)}
            </div>
          ))
        )}

        {/* Date cells */}
        {dateRange.map(date => {
          const dayTasks = getTasksForDate(date);
          const isCurrentDay = isToday(date);
          const isSelectedDay = isSameDay(date, selectedDate);
          const isCurrentMonth = viewMode === 'monthly' ? isSameMonth(date, selectedDate) : true;

          return (
            <div
              key={date.toISOString()}
              className={`
                min-h-[160px] p-5 border-2 rounded-2xl shadow-lg backdrop-blur-sm
                transition-all duration-300 hover:shadow-xl hover:scale-[1.02] transform-gpu
                ${isCurrentMonth ? 'bg-gradient-to-br from-background via-background/95 to-background/90' : 'bg-gradient-to-br from-muted/20 to-muted/10'}
                ${isCurrentDay 
                  ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary shadow-xl ring-2 ring-primary/20' 
                  : 'border-border/50 hover:border-primary/30'
                }
                ${isSelectedDay ? 'ring-4 ring-primary/30 ring-offset-2' : ''}
                ${!isCurrentMonth ? 'opacity-50' : ''}
                ${viewMode === 'daily' ? 'min-h-[600px]' : ''}
                group relative overflow-hidden
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, date)}
            >
              {/* Current day glow effect */}
              {isCurrentDay && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-pulse"></div>
              )}

              {/* Day header */}
              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-xl text-base font-bold transition-all duration-300
                    ${isCurrentDay 
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg ring-2 ring-primary/30' 
                      : 'bg-gradient-to-br from-muted/50 to-muted/70 text-foreground hover:from-primary/20 hover:to-primary/30'
                    }
                  `}>
                    {format(date, 'd')}
                  </div>
                  {viewMode !== 'monthly' && (
                    <div className="text-sm font-semibold text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                      {format(date, 'EEE')}
                    </div>
                  )}
                  {dayTasks.length > 0 && (
                    <Badge className="text-xs px-3 py-1 bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-primary/30 font-bold shadow-sm">
                      {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 h-9 p-0 opacity-0 group-hover:opacity-100 hover:bg-gradient-to-br hover:from-primary/20 hover:to-primary/30 hover:text-primary transition-all duration-300 rounded-xl shadow-lg"
                  onClick={() => onDayClick(date)}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Tasks */}
              <div className="relative space-y-3">
                {dayTasks.slice(0, viewMode === 'daily' ? 25 : 5).map(task => (
                  <TaskBlock
                    key={task.id}
                    task={task}
                    assistants={assistants}
                    colorClass={getAssistantColor(task.assigned_to)}
                    onTaskClick={onTaskClick}
                    onStatusUpdate={onTaskStatusUpdate}
                    onDragStart={handleDragStart}
                    compact={viewMode !== 'daily'}
                  />
                ))}
                
                {dayTasks.length > (viewMode === 'daily' ? 25 : 5) && (
                  <div className="text-xs text-center py-3 px-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl border border-border/30 font-semibold text-muted-foreground">
                    +{dayTasks.length - (viewMode === 'daily' ? 25 : 5)} more tasks
                  </div>
                )}
                
                {dayTasks.length === 0 && (
                  <div 
                    className="text-xs text-center py-8 cursor-pointer transition-all duration-300 border-2 border-dashed border-muted/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 group/add"
                    onClick={() => onDayClick(date)}
                  >
                    <Plus className="w-6 h-6 mx-auto mb-2 opacity-30 group-hover/add:opacity-70 group-hover/add:text-primary transition-all duration-300" />
                    <span className="text-muted-foreground group-hover/add:text-primary font-medium">Add task</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend - Enhanced Design */}
      <div className="bg-gradient-to-r from-muted/20 to-background p-6 rounded-2xl border border-border/50 shadow-lg">
        <div className="flex flex-col gap-4">
          <h5 className="text-sm font-bold text-foreground uppercase tracking-wide">Team Assignments</h5>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-muted/30 rounded-full px-4 py-2 border border-border/30">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/70 border-2 border-muted"></div>
              <span className="text-sm font-medium text-muted-foreground">Unassigned</span>
            </div>
            {assistants.map((assistant, index) => {
              const colorClass = getAssistantColor(assistant.id);
              const bgColorClass = colorClass.split(' ').find(cls => cls.startsWith('bg-gradient-to-br'));
              return (
                <div key={assistant.id} className="flex items-center gap-3 bg-background/50 rounded-full px-4 py-2 border border-border/30 shadow-sm">
                  <div className={`w-4 h-4 rounded-full ${bgColorClass} border-2`}></div>
                  <span className="text-sm font-medium text-foreground">{assistant.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}