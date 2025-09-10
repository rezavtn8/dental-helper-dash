import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw,
  Flag,
  Repeat,
  AlertCircle
} from 'lucide-react';
import { Task, Assistant } from '@/types/task';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { getPriorityStyles, isRecurringInstance, RecurringTaskInstance } from '@/lib/taskUtils';

interface OptimizedTaskCardProps {
  task: Task | RecurringTaskInstance;
  assistants: Assistant[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
}

export function OptimizedTaskCard({ task, assistants, onUpdateTask }: OptimizedTaskCardProps) {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const isMyTask = task.assigned_to === userProfile?.id;
  const isUnassigned = !task.assigned_to;
  const isOverdue = isRecurringInstance(task) && task.isOverdue;

  const getAssistantName = (id: string | null) => {
    if (!id) return 'Unassigned';
    return assistants.find(a => a.id === id)?.name || 'Unknown';
  };

  const executeTaskAction = async (action: string, updates: any, successMsg: string) => {
    if (!userProfile?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`⚡ Executing task action: ${action}`, {
        taskId: task.id,
        updates,
        userProfile: userProfile.id,
        currentStatus: task.status,
        currentAssignment: task.assigned_to
      });

      const success = await onUpdateTask(task.id, updates);
      
      if (success) {
        console.log(`✅ Task ${action} successful:`, task.id);
        toast.success(successMsg);
      } else {
        console.error(`❌ Task ${action} failed:`, task.id);
        toast.error('Action failed. Please try again.');
      }
      
    } catch (error: any) {
      console.error('❌ Task action error:', {
        action,
        taskId: task.id,
        error: error.message || error
      });
      
      toast.error('Action failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = () => {
    executeTaskAction('claim', {
      assigned_to: userProfile?.id,
      claimed_by: userProfile?.id
    }, 'Task claimed!');
  };

  const handleStart = () => {
    executeTaskAction('start', {
      status: 'in-progress'
    }, 'Task started!');
  };

  const handleComplete = () => {
    executeTaskAction('complete', {
      status: 'completed',
      completed_by: userProfile?.id,
      completed_at: new Date().toISOString()
    }, 'Task completed! 🎉');
  };

  const handleReset = () => {
    executeTaskAction('reset', {
      status: 'pending'
    }, 'Task reset to pending');
  };

  const handleReturn = () => {
    executeTaskAction('return', {
      assigned_to: null,
      claimed_by: null,
      status: 'pending'
    }, 'Task returned to unassigned');
  };

  const handleReopen = () => {
    executeTaskAction('reopen', {
      status: 'pending',
      completed_by: null,
      completed_at: null
    }, 'Task moved back to pending');
  };

  const renderActionButton = () => {
    if (isLoading) {
      return (
        <Button size="sm" disabled className="bg-primary hover:bg-primary/90 min-w-[90px]">
          Working...
        </Button>
      );
    }

    // Unassigned tasks - show claim button
    if (isUnassigned && task.status !== 'completed') {
      return (
        <Button size="sm" onClick={handleClaim} className="bg-primary hover:bg-primary/90 min-w-[90px]">
          <ArrowRight className="w-3 h-3 mr-1" />
          Take Task
        </Button>
      );
    }

    // My tasks - different buttons based on status
    if (isMyTask) {
      switch (task.status) {
        case 'pending':
          return (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleStart} className="bg-primary hover:bg-primary/90" title="Start Task">
                <Play className="w-3 h-3 mr-1" />
                Start
              </Button>
              <Button size="sm" onClick={handleComplete} className="bg-green-600 hover:bg-green-700" title="Complete Task">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Button>
              <Button size="sm" onClick={handleReturn} variant="outline" title="Return Task">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Return
              </Button>
            </div>
          );

        case 'in-progress':
          return (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleComplete} className="bg-green-600 hover:bg-green-700" title="Complete Task">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Button>
              <Button size="sm" onClick={handleReset} variant="outline" title="Reset to Pending">
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          );

        case 'completed':
          return (
            <Button size="sm" onClick={handleReopen} variant="outline" className="bg-green-50 hover:bg-green-100 text-green-800 border-green-200" title="Undo Completion">
              <RotateCcw className="w-3 h-3 mr-1" />
              Undo
            </Button>
          );

        default:
          return null;
      }
    }

    // Tasks assigned to others
    return (
      <Badge variant="outline" className="text-xs">
        {getAssistantName(task.assigned_to)}
      </Badge>
    );
  };

  const getCardStyle = () => {
    if (task.status === 'completed') return 'bg-green-50 border-green-200 opacity-80';
    if (task.status === 'in-progress') return 'bg-blue-50 border-blue-200';
    if (isOverdue) return 'bg-red-50 border-red-200';
    if (isUnassigned) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-gray-200';
  };

  const getStatusBadgeColor = () => {
    switch (task.status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all ${getCardStyle()}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
          <h4 className={`font-medium text-sm ${
            task.status === 'completed' 
              ? 'line-through text-green-700' 
              : isOverdue 
                ? 'text-red-700' 
                : ''
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
          
          <Badge variant="outline" className={`text-xs h-4 px-1 ${getStatusBadgeColor()}`}>
            {task.status}
          </Badge>
          
          {task['due-type'] && (
            <Badge variant="outline" className="text-xs h-4 px-1">
              {task['due-type']?.replace('-', ' ')}
            </Badge>
          )}
          
          <span>Assigned: {getAssistantName(task.assigned_to)}</span>
        </div>
      </div>

      <div className="ml-4">
        {renderActionButton()}
      </div>
    </div>
  );
}