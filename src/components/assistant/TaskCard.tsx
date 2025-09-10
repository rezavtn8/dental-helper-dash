import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, Flag, Repeat, Play, CheckCircle2, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { Task, Assistant } from '@/types/task';
import { useAuth } from '@/hooks/useAuth';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { getPriorityStyles, isRecurringInstance, RecurringTaskInstance } from '@/lib/taskUtils';

interface TaskCardProps {
  task: Task | RecurringTaskInstance;
  assistants: Assistant[];
  onTaskUpdate?: () => void;
}

export function TaskCard({ task, assistants, onTaskUpdate }: TaskCardProps) {
  const { userProfile } = useAuth();
  const taskOps = useTaskOperations();
  
  const isAssignedToMe = task.assigned_to === userProfile?.id;
  const isUnassigned = !task.assigned_to;
  const isOverdue = isRecurringInstance(task) && task.isOverdue;
  const isLoading = taskOps.isLoading(task.id);

  const getAssistantName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    const assistant = assistants.find(a => a.id === assignedTo);
    return assistant?.name || 'Unknown';
  };

  const handleAction = async (action: () => Promise<void>) => {
    try {
      await action();
      // Delay refresh to ensure DB is updated
      setTimeout(() => onTaskUpdate?.(), 200);
    } catch (error) {
      console.error('Task action failed:', error);
    }
  };

  const renderButtons = () => {
    if (isLoading) {
      return <LoadingSpinner size="sm" />;
    }

    // Unassigned task - show claim button
    if (isUnassigned && task.status !== 'completed') {
      return (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(() => taskOps.claimTask(task.id));
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <ArrowRight className="w-3 h-3 mr-1" />
          Take Task
        </Button>
      );
    }

    // My tasks - show action buttons
    if (isAssignedToMe) {
      if (task.status === 'pending') {
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => taskOps.startTask(task.id));
              }}
              title="Start Task"
            >
              <Play className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => taskOps.completeTask(task.id));
              }}
              className="bg-green-600 hover:bg-green-700"
              title="Complete Task"
            >
              <CheckCircle2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => taskOps.returnTask(task.id));
              }}
              title="Return Task"
            >
              <ArrowLeft className="w-3 h-3" />
            </Button>
          </div>
        );
      }

      if (task.status === 'in-progress') {
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => taskOps.completeTask(task.id));
              }}
              className="bg-green-600 hover:bg-green-700"
              title="Complete Task"
            >
              <CheckCircle2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => taskOps.resetTask(task.id));
              }}
              title="Reset to Pending"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        );
      }

      if (task.status === 'completed') {
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(() => taskOps.undoCompletion(task.id));
            }}
            title="Reopen Task"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        );
      }
    }

    // Assigned to others
    if (!isUnassigned && !isAssignedToMe) {
      return (
        <Badge variant="outline" className="text-xs">
          {getAssistantName(task.assigned_to)}
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className={`
      flex items-center justify-between p-3 border rounded-lg transition-all hover:shadow-sm
      ${task.status === 'completed' ? 'bg-green-50 border-green-200' : 
        isOverdue ? 'bg-red-50 border-red-200' : 
        isUnassigned ? 'bg-blue-50 border-blue-200' :
        'bg-gray-50 border-gray-200'}
    `}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
          <h4 className={`font-medium text-sm ${
            task.status === 'completed' ? 'line-through text-muted-foreground' : 
            isOverdue ? 'text-red-700' : ''
          }`}>
            {task.title}
          </h4>
          {task.priority === 'high' && <Flag className="w-3 h-3 text-red-500" />}
          {isRecurringInstance(task) && <Repeat className="w-3 h-3 text-primary" />}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.priority && (
            <Badge variant="outline" className={`text-xs h-4 px-1 ${getPriorityStyles(task.priority)}`}>
              {task.priority}
            </Badge>
          )}
          {task['due-type'] && (
            <Badge variant="outline" className="text-xs h-4 px-1">
              {task['due-type']?.replace('-', ' ')}
            </Badge>
          )}
          <span className="text-xs">{getAssistantName(task.assigned_to)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {renderButtons()}
      </div>
    </div>
  );
}