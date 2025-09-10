import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskActionButton } from '@/components/ui/task-action-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, Flag, Repeat } from 'lucide-react';
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

  const handleOperation = async (operation: () => Promise<void>) => {
    try {
      await operation();
      onTaskUpdate?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const renderActionButtons = () => {
    if (isLoading) {
      return <LoadingSpinner size="sm" className="text-primary" />;
    }

    // Unassigned tasks - show claim button
    if (isUnassigned && task.status !== 'completed') {
      return (
        <TaskActionButton
          status={task.status}
          action="pickup"
          size="sm"
          showLabel={true}
          onClick={(e) => {
            e.stopPropagation();
            handleOperation(() => taskOps.claimTask(task.id));
          }}
        />
      );
    }

    // My assigned tasks - show appropriate buttons based on status
    if (isAssignedToMe) {
      return (
        <div className="flex gap-1">
          {task.status === 'pending' && (
            <>
              <TaskActionButton
                status="pending"
                action="toggle"
                size="sm"
                showLabel={false}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOperation(() => taskOps.startTask(task.id));
                }}
              />
              
              <TaskActionButton
                status="in-progress"
                action="toggle"
                size="sm"
                showLabel={false}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOperation(() => taskOps.completeTask(task.id));
                }}
              />
              
              <TaskActionButton
                status="pending"
                action="return"
                size="sm"
                showLabel={false}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOperation(() => taskOps.returnTask(task.id));
                }}
              />
            </>
          )}
          
          {task.status === 'in-progress' && (
            <>
              <TaskActionButton
                status="in-progress"
                action="toggle"
                size="sm"
                showLabel={false}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOperation(() => taskOps.completeTask(task.id));
                }}
              />
              
              <TaskActionButton
                status="in-progress"
                action="undo"
                size="sm"
                showLabel={false}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOperation(() => taskOps.resetTask(task.id));
                }}
              />
            </>
          )}
          
          {task.status === 'completed' && (
            <TaskActionButton
              status="completed"
              action="undo"
              size="sm"
              showLabel={false}
              onClick={(e) => {
                e.stopPropagation();
                handleOperation(() => taskOps.undoCompletion(task.id));
              }}
            />
          )}
        </div>
      );
    }

    // Tasks assigned to others - show assignee info
    if (!isUnassigned && !isAssignedToMe) {
      return (
        <Badge variant="outline" className="text-xs">
          Assigned to {getAssistantName(task.assigned_to)}
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
        {renderActionButtons()}
      </div>
    </div>
  );
}