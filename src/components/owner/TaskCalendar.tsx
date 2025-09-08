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
    <div className="w-full h-full bg-background rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <button
            onClick={navigatePrevious}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <h2 className="text-lg font-semibold text-foreground">
            {format(selectedDate, headerFormat)}
          </h2>
          
          <button
            onClick={navigateNext}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={() => onDateSelect(new Date())}
          className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm font-medium"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className={`grid gap-2 p-3 ${
        viewMode === 'monthly' ? 'grid-cols-7' :
        viewMode === 'weekly' ? 'grid-cols-7' :
        'grid-cols-1'
      }`}>
        {/* Week headers for weekly/monthly view */}
        {(viewMode === 'weekly' || viewMode === 'monthly') && (
          ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
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
                min-h-[140px] p-3 rounded-lg border transition-colors hover:bg-muted/50
                ${isCurrentDay 
                  ? 'bg-primary/5 border-primary/30' 
                  : isSelectedDay
                  ? 'bg-muted border-muted-foreground/30'
                  : isCurrentMonth
                  ? 'bg-background border-border hover:bg-muted/30'
                  : 'bg-muted/30 border-border/50 text-muted-foreground'
                }
                ${viewMode === 'monthly' ? 'aspect-square' : ''}
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, date)}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    isCurrentDay ? 'text-primary' :
                    isSelectedDay ? 'text-foreground' :
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  {viewMode === 'weekly' && (
                    <span className={`text-xs ${
                      isCurrentMonth ? 'text-muted-foreground' : 'text-muted-foreground/60'
                    }`}>
                      {format(date, 'EEE')}
                    </span>
                  )}
                </div>
                
                {dayTasks.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => onDayClick(date)}
                className={`w-full p-2 rounded-md border border-dashed transition-colors mb-2 group ${
                  isCurrentMonth 
                    ? 'border-border hover:border-primary hover:bg-primary/5' 
                    : 'border-border/50 hover:border-border'
                }`}
              >
                <Plus className={`h-4 w-4 mx-auto transition-colors ${
                  isCurrentMonth 
                    ? 'text-muted-foreground group-hover:text-primary' 
                    : 'text-muted-foreground/50'
                }`} />
              </button>

              {/* Tasks */}
              <div className="space-y-1.5 flex-1 overflow-y-auto">
                {dayTasks.slice(0, 4).map(task => (
                  <TaskBlock
                    key={task.id}
                    task={task}
                    assistants={assistants}
                    colorClass={getAssistantColor(task.assigned_to)}
                    onTaskClick={onTaskClick}
                    onStatusUpdate={onTaskStatusUpdate}
                    onDragStart={handleDragStart}
                    compact={viewMode === 'monthly'}
                  />
                ))}
                
                {dayTasks.length > 4 && (
                  <div className="text-xs px-2 py-1 rounded-md text-center bg-muted text-muted-foreground">
                    +{dayTasks.length - 4} more
                  </div>
                )}
                
                {dayTasks.length === 0 && isCurrentMonth && (
                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground mb-1">No tasks</p>
                    <button
                      onClick={() => onDayClick(date)}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Add a task
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assistant Legend */}
      <div className="p-3 pt-0 border-t">
        <div className="flex flex-wrap gap-2 justify-center">
          {assistants.map((assistant) => {
            const colorClass = getAssistantColor(assistant.id);
            return (
              <div key={assistant.id} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${colorClass.replace('from-', 'bg-').split(' ')[0]}`} />
                <span className="text-xs text-muted-foreground">
                  {assistant.name}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <span className="text-xs text-muted-foreground">Unassigned</span>
          </div>
        </div>
      </div>
    </div>
  );
}