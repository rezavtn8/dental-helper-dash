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
        ${colorClass} border-2 rounded-xl p-3 cursor-pointer relative overflow-hidden
        hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform-gpu
        ${compact ? 'text-xs p-2' : 'text-sm'}
        ${task.status === 'completed' ? 'opacity-80 saturate-50' : 'shadow-md'}
        group bg-gradient-to-br from-background to-background/95
      `}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onTaskClick(task)}
    >
      {/* Priority indicator */}
      {task.priority === 'high' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
      )}

      {/* Status indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        task.status === 'completed' ? 'bg-green-500' :
        task.status === 'in-progress' ? 'bg-orange-500' :
        'bg-muted'
      }`}></div>

      <div className="flex items-start gap-3 mt-1">
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={`font-semibold leading-tight ${
                task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
              } ${compact ? 'text-xs' : 'text-sm'}`}>
                {task.title}
              </span>
              {isRecurringInstance(task) && (
                <div title="Recurring task instance" className="flex-shrink-0">
                  <Repeat className="w-3 h-3 text-primary animate-pulse" />
                </div>
              )}
              {getPriorityIcon()}
            </div>
            
            <div className="flex items-center gap-2">
              {task.status === 'pending' && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4"
                  onClick={toggleStatus}
                >
                  Start
                </Button>
              )}
              {task.status === 'in-progress' && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4"
                  onClick={toggleStatus}
                >
                  Done
                </Button>
              )}
              {task.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full px-4"
                  onClick={toggleStatus}
                >
                  Undo
                </Button>
              )}
            </div>
          </div>

          {!compact && task.description && (
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Assignment */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-full px-2 py-1">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="text-xs font-bold text-primary">
                  {getAssistantInitials()}
                </span>
              </div>
              {!compact && (
                <span className="text-xs font-medium text-foreground">
                  {getAssistantName()}
                </span>
              )}
            </div>

            {/* Priority Badge */}
            {task.priority && task.priority !== 'medium' && (
              <Badge 
                className={`text-xs px-2 py-1 font-medium border-2 ${
                  task.priority === 'high' ? 'bg-red-50 border-red-300 text-red-700' :
                  task.priority === 'low' ? 'bg-green-50 border-green-300 text-green-700' :
                  'bg-muted border-border text-muted-foreground'
                }`}
              >
                {task.priority}
              </Badge>
            )}

            {/* Due Type */}
            {task['due-type'] && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20">
                {task['due-type']}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}