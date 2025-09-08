import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, Assistant } from '@/types/task';
import { TaskStatus, getStatusDisplay } from '@/lib/taskStatus';
import { format, isToday } from 'date-fns';
import { RecurringTaskInstance, isRecurringInstance } from '@/lib/taskUtils';
import { useAuth } from '@/hooks/useAuth';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle,
  User,
  Flag,
  Repeat
} from 'lucide-react';

interface TaskBlockProps {
  task: Task | RecurringTaskInstance;
  assistants: Assistant[];
  colorClass: string;
  onTaskClick: (task: Task | RecurringTaskInstance) => void;
  onStatusUpdate: (taskId: string, newStatus: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  compact?: boolean;
}

export default function TaskBlock({
  task,
  assistants,
  colorClass,
  onTaskClick,
  onStatusUpdate,
  onDragStart,
  compact = false
}: TaskBlockProps) {
  const { userProfile } = useAuth();
  const isOwner = userProfile?.role === 'owner';
  const isOverdue = isRecurringInstance(task) && task.isOverdue;
  
  const getStatusIcon = () => {
    if (isOverdue) {
      return <AlertCircle className="w-3 h-3 text-red-600" />;
    }
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-3 h-3 text-orange-600" />;
      default:
        return <Circle className="w-3 h-3 text-slate-400" />;
    }
  };

  const getPriorityIcon = () => {
    if (task.priority === 'high') {
      return <Flag className="w-3 h-3 text-red-500" />;
    }
    return null;
  };

  const getAssistantName = () => {
    if (!task.assigned_to) return 'Unassigned';
    const assistant = assistants.find(a => a.id === task.assigned_to);
    return assistant?.name || 'Unknown';
  };

  const getAssistantInitials = () => {
    const name = getAssistantName();
    if (name === 'Unassigned' || name === 'Unknown') return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to safely check and format dates
  const isValidDate = (dateValue: any): boolean => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  };

  const formatSafeDate = (dateValue: any, formatString: string, fallback: string = 'No date'): string => {
    if (!isValidDate(dateValue)) return fallback;
    try {
      return format(new Date(dateValue), formatString);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return fallback;
    }
  };

  const isTaskToday = (dateValue: any): boolean => {
    if (!isValidDate(dateValue)) return false;
    try {
      return isToday(new Date(dateValue));
    } catch (error) {
      console.warn('Date comparison error:', error);
      return false;
    }
  };

  const toggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 
                      task.status === 'pending' ? 'in-progress' : 
                      'completed';
    onStatusUpdate(task.id, nextStatus);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onTaskClick(task)}
      className={`
        group relative cursor-pointer select-none
        ${compact ? 'p-2' : 'p-2.5'}
        rounded-md border transition-colors duration-200
        ${isOverdue 
          ? 'border-destructive/30 bg-destructive/5' 
          : 'border-border hover:bg-muted/50'
        }
        bg-background
      `}
    >
      {/* Status Bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-md ${
        task.status === 'completed' 
          ? 'bg-emerald-500' 
          : task.status === 'in-progress'
          ? 'bg-blue-500'
          : 'bg-amber-500'
      }`} />

      {/* Main Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={toggleStatus}
              className={`flex-shrink-0 p-1 rounded-md transition-colors ${
                task.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                  : task.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : isOverdue
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
              }`}
            >
              {getStatusIcon()}
            </button>
            
            <h3 className={`font-medium text-sm leading-tight flex-1 ${
              task.status === 'completed' 
                ? 'line-through text-muted-foreground' 
                : 'text-foreground'
            } ${compact ? 'truncate' : ''}`}>
              {task.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {/* Priority Indicator */}
            {task.priority === 'high' && (
              <div className="flex-shrink-0 p-0.5 bg-red-100 text-red-600 rounded">
                {getPriorityIcon()}
              </div>
            )}
            
            {/* Recurring Indicator */}
            {isRecurringInstance(task) && (
              <div className="flex-shrink-0 p-0.5 bg-purple-100 text-purple-600 rounded">
                <Repeat className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && !compact && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Assignee */}
          <div className="flex items-center gap-1.5">
            {task.assigned_to ? (
              <>
                <div className="w-5 h-5 bg-muted-foreground/20 rounded-full flex items-center justify-center text-muted-foreground text-xs font-medium">
                  {getAssistantInitials()}
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-20">
                  {getAssistantName()}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground/60 italic">
                Unassigned
              </span>
            )}
          </div>

          {/* Status and Time Info */}
          <div className="flex items-center gap-1.5">
            {/* Due Date */}
            <span className={`text-xs px-1.5 py-0.5 rounded text-center ${
              isOverdue 
                ? 'bg-red-100 text-red-700' 
                : isTaskToday(task['due-date'])
                ? 'bg-blue-100 text-blue-700'
                : 'bg-muted text-muted-foreground'
            }`}>
              {formatSafeDate(task['due-date'], 'MMM d', 'No date')}
            </span>

            {/* Status Badge */}
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              task.status === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : task.status === 'in-progress'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {getStatusDisplay(task.status)}
            </span>
          </div>
        </div>

        {/* Overdue Reason */}
        {isOverdue && isRecurringInstance(task) && task.overdueReason && !compact && (
          <div className="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded">
            <p className="text-xs text-red-700 font-medium mb-0.5">
              Overdue Reason:
            </p>
            <p className="text-xs text-red-600">
              {task.overdueReason}
            </p>
          </div>
        )}

        {/* Completion overlay */}
        {task.status === 'completed' && (
          <div className="absolute inset-0 bg-emerald-500/5 rounded-md pointer-events-none" />
        )}
      </div>
    </div>
  );
}