import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
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
        ${colorClass} border-2 rounded-2xl p-4 cursor-pointer relative overflow-hidden backdrop-blur-sm
        hover:shadow-xl transition-all duration-300 hover:scale-[1.03] transform-gpu
        ${compact ? 'text-xs p-3' : 'text-sm'}
        ${task.status === 'completed' ? 'opacity-80 saturate-75' : 'shadow-lg'}
        group relative
      `}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onTaskClick(task)}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none"></div>
      
      {/* Priority indicator - Enhanced */}
      {task.priority === 'high' && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg animate-pulse flex items-center justify-center border-2 border-white">
          <Flag className="w-2.5 h-2.5 text-white" />
        </div>
      )}

      {/* Status indicator line - Enhanced */}
      <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-2xl ${
        isOverdue ? 'bg-gradient-to-r from-red-500 to-red-600' :
        task.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-600' :
        task.status === 'in-progress' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
        'bg-gradient-to-r from-muted to-muted/80'
      }`}></div>

      {/* Overdue indicator - Enhanced */}
      {isOverdue && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-xl animate-pulse flex items-center justify-center border-2 border-white">
          <AlertCircle className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="relative flex items-start gap-4 mt-2">
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 flex-1">
              <span className={`font-bold leading-tight ${
                task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
              } ${compact ? 'text-sm' : 'text-base'}`}>
                {task.title}
              </span>
              {isRecurringInstance(task) && (
                <div title="Recurring task instance" className="flex-shrink-0 bg-primary/20 rounded-full p-1">
                  <Repeat className="w-3 h-3 text-primary animate-pulse" />
                </div>
              )}
              {getPriorityIcon()}
            </div>
            
            <div className="flex items-center gap-2">
              {!isOwner && task.status === 'pending' && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-5 py-2 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  onClick={toggleStatus}
                >
                  Start
                </Button>
              )}
              {!isOwner && task.status === 'in-progress' && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-5 py-2 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  onClick={toggleStatus}
                >
                  Complete
                </Button>
              )}
              {!isOwner && task.status === 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 rounded-full px-5 py-2 font-semibold transition-all duration-200"
                  onClick={toggleStatus}
                >
                  Undo
                </Button>
              )}
            </div>
          </div>

          {!compact && task.description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed bg-muted/20 rounded-lg p-3">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {/* Assignment - Enhanced */}
            <div className="flex items-center gap-3 bg-background/60 backdrop-blur-sm rounded-full px-4 py-2 border border-border/30 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/30">
                <span className="text-xs font-bold text-primary">
                  {getAssistantInitials()}
                </span>
              </div>
              {!compact && (
                <span className="text-sm font-semibold text-foreground">
                  {getAssistantName()}
                </span>
              )}
            </div>

            {/* Overdue Badge - Enhanced */}
            {isOverdue && (
              <Badge className="text-xs px-3 py-1.5 font-bold bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-300 text-red-800 shadow-sm animate-pulse">
                ⚠️ OVERDUE
              </Badge>
            )}

            {/* Priority Badge - Enhanced */}
            {task.priority && task.priority !== 'medium' && (
              <Badge 
                className={`text-xs px-3 py-1.5 font-bold border-2 shadow-sm ${
                  task.priority === 'high' ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800' :
                  task.priority === 'low' ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800' :
                  'bg-gradient-to-r from-muted to-muted/80 border-border text-muted-foreground'
                }`}
              >
                {task.priority === 'high' && '🔴'}
                {task.priority === 'low' && '🟢'}
                {task.priority?.toUpperCase()}
              </Badge>
            )}

            {/* Due Type - Enhanced */}
            {task['due-type'] && (
              <Badge className="text-xs px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-2 border-primary/30 font-semibold shadow-sm">
                📅 {task['due-type']}
              </Badge>
            )}

            {/* Overdue Reason - Enhanced */}
            {isOverdue && isRecurringInstance(task) && task.overdueReason && !compact && (
              <div className="w-full mt-3">
                <div className="text-xs p-3 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl shadow-sm">
                  <span className="font-semibold text-red-800">Overdue Reason:</span>
                  <p className="text-red-700 mt-1">{task.overdueReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}