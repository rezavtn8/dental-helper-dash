import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
import { RecurringTaskInstance, isRecurringInstance } from '@/lib/taskUtils';
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
  const getStatusIcon = () => {
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

  const toggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 
                      task.status === 'pending' ? 'in-progress' : 
                      'completed';
    onStatusUpdate(task.id, nextStatus);
  };

  return (
    <div
      className={`
        ${colorClass} border rounded-lg p-2 cursor-pointer
        hover:shadow-sm transition-all duration-200
        ${compact ? 'text-xs' : 'text-sm'}
        ${task.status === 'completed' ? 'opacity-70' : ''}
        group relative
      `}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onTaskClick(task)}
    >
      {/* Priority indicator */}
      {task.priority === 'high' && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
      )}

      <div className="flex items-start gap-2">
        {/* Status Icon */}
        <Button
          variant="ghost"
          size="sm"
          className="w-5 h-5 p-0 hover:bg-white/20"
          onClick={toggleStatus}
        >
          {getStatusIcon()}
        </Button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className={`font-medium truncate ${
              task.status === 'completed' ? 'line-through text-muted-foreground' : ''
            }`}>
              {task.title}
            </span>
            {isRecurringInstance(task) && (
              <div title="Recurring task instance">
                <Repeat className="w-3 h-3 text-blue-500" />
              </div>
            )}
            {getPriorityIcon()}
          </div>

          {!compact && task.description && (
            <p className="text-xs text-muted-foreground truncate mb-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-1 flex-wrap">
            {/* Assignment */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-white/60 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-700">
                  {getAssistantInitials()}
                </span>
              </div>
              {!compact && (
                <span className="text-xs text-muted-foreground">
                  {getAssistantName()}
                </span>
              )}
            </div>

            {/* Priority Badge */}
            {task.priority && task.priority !== 'medium' && (
              <Badge 
                variant="outline" 
                className={`text-xs px-1 py-0 ${
                  task.priority === 'high' ? 'border-red-300 text-red-700' :
                  task.priority === 'low' ? 'border-green-300 text-green-700' :
                  'border-slate-300 text-slate-700'
                }`}
              >
                {task.priority}
              </Badge>
            )}

            {/* Due Type */}
            {task['due-type'] && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {task['due-type']}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}