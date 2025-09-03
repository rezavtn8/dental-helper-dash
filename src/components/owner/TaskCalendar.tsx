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

  // Generate assistant colors
  const getAssistantColor = (assistantId: string | null | undefined) => {
    if (!assistantId) return 'bg-slate-300 border-slate-400';
    
    const colors = [
      'bg-blue-200 border-blue-400 text-blue-800',
      'bg-green-200 border-green-400 text-green-800',
      'bg-purple-200 border-purple-400 text-purple-800',
      'bg-orange-200 border-orange-400 text-orange-800',
      'bg-pink-200 border-pink-400 text-pink-800',
      'bg-indigo-200 border-indigo-400 text-indigo-800',
      'bg-cyan-200 border-cyan-400 text-cyan-800',
      'bg-teal-200 border-teal-400 text-teal-800',
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
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h4 className="font-semibold text-lg min-w-[200px] text-center">
              {format(selectedDate, headerFormat)}
            </h4>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDateSelect(new Date())}
          className="flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className={`grid gap-2 ${
        viewMode === 'monthly' ? 'grid-cols-7' :
        viewMode === 'weekly' ? 'grid-cols-7' :
        'grid-cols-1'
      }`}>
        {/* Week headers for weekly/monthly view */}
        {(viewMode === 'weekly' || viewMode === 'monthly') && (
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
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
                min-h-[120px] p-3 border-2 border-dashed border-slate-200 rounded-lg
                transition-all duration-200 hover:border-slate-300
                ${isCurrentDay ? 'bg-blue-50 border-blue-300' : 'bg-white'}
                ${isSelectedDay ? 'ring-2 ring-blue-500' : ''}
                ${!isCurrentMonth ? 'opacity-50' : ''}
                ${viewMode === 'daily' ? 'min-h-[400px]' : ''}
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, date)}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`
                    text-sm font-medium
                    ${isCurrentDay ? 'text-blue-700' : 'text-slate-700'}
                  `}>
                    {format(date, viewMode === 'monthly' ? 'd' : 'EEE d')}
                  </span>
                  {dayTasks.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {dayTasks.length}
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-blue-100"
                  onClick={() => onDayClick(date)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              {/* Tasks */}
              <div className="space-y-1">
                {dayTasks.slice(0, viewMode === 'daily' ? 20 : 3).map(task => (
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
                
                {dayTasks.length > (viewMode === 'daily' ? 20 : 3) && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{dayTasks.length - (viewMode === 'daily' ? 20 : 3)} more
                  </div>
                )}
                
                {dayTasks.length === 0 && (
                  <div 
                    className="text-xs text-muted-foreground text-center py-4 cursor-pointer hover:text-slate-600"
                    onClick={() => onDayClick(date)}
                  >
                    Click to add task
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <div className="text-sm font-medium text-muted-foreground">Assignments:</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-300 border border-slate-400"></div>
          <span className="text-sm text-muted-foreground">Unassigned</span>
        </div>
        {assistants.map((assistant, index) => (
          <div key={assistant.id} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${getAssistantColor(assistant.id).split(' ')[0]} border`}></div>
            <span className="text-sm text-muted-foreground">{assistant.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}