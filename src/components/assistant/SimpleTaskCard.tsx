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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getPriorityStyles, isRecurringInstance, RecurringTaskInstance } from '@/lib/taskUtils';

interface SimpleTaskCardProps {
  task: Task | RecurringTaskInstance;
  assistants: Assistant[];
  onUpdate: () => void;
}

export function SimpleTaskCard({ task, assistants, onUpdate }: SimpleTaskCardProps) {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const isMyTask = task.assigned_to === userProfile?.id;
  const isUnassigned = !task.assigned_to;
  const isOverdue = isRecurringInstance(task) && task.isOverdue;

  const getAssistantName = (id: string | null) => {
    if (!id) return 'Unassigned';
    return assistants.find(a => a.id === id)?.name || 'Unknown';
  };

  const executeTask = async (action: string, updates: any, successMsg: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', task.id);

      if (error) throw error;
      
      toast.success(successMsg);
      setTimeout(() => onUpdate(), 300);
    } catch (error) {
      console.error('Task action failed:', error);
      toast.error('Action failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = () => {
    executeTask('claim', {
      assigned_to: userProfile?.id,
      claimed_by: userProfile?.id
    }, 'Task claimed!');
  };

  const handleStart = () => {
    executeTask('start', {
      status: 'in-progress'
    }, 'Task started!');
  };

  const handleComplete = () => {
    executeTask('complete', {
      status: 'completed',
      completed_by: userProfile?.id,
      completed_at: new Date().toISOString()
    }, 'Task completed! 🎉');
  };

  const handleReset = () => {
    executeTask('reset', {
      status: 'pending'
    }, 'Task reset to pending');
  };

  const handleReturn = () => {
    executeTask('return', {
      assigned_to: null,
      claimed_by: null,
      status: 'pending'
    }, 'Task returned');
  };

  const handleReopen = () => {
    executeTask('reopen', {
      status: 'pending',
      completed_by: null,
      completed_at: null
    }, 'Task reopened');
  };

  const renderActionButton = () => {
    if (isLoading) {
      return (
        <Button size="sm" disabled>
          Working...
        </Button>
      );
    }

    // Unassigned tasks - show claim button
    if (isUnassigned && task.status !== 'completed') {
      return (
        <Button size="sm" onClick={handleClaim} className="bg-primary hover:bg-primary/90">
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
            <div className="flex gap-1">
              <Button size="sm" onClick={handleStart} variant="outline" title="Start Task">
                <Play className="w-3 h-3" />
              </Button>
              <Button size="sm" onClick={handleComplete} className="bg-green-600 hover:bg-green-700" title="Complete Task">
                <CheckCircle2 className="w-3 h-3" />
              </Button>
              <Button size="sm" onClick={handleReturn} variant="outline" title="Return Task">
                <ArrowLeft className="w-3 h-3" />
              </Button>
            </div>
          );

        case 'in-progress':
          return (
            <div className="flex gap-1">
              <Button size="sm" onClick={handleComplete} className="bg-green-600 hover:bg-green-700" title="Complete Task">
                <CheckCircle2 className="w-3 h-3" />
              </Button>
              <Button size="sm" onClick={handleReset} variant="outline" title="Reset to Pending">
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          );

        case 'completed':
          return (
            <Button size="sm" onClick={handleReopen} variant="outline" title="Reopen Task">
              <RotateCcw className="w-3 h-3" />
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
    if (task.status === 'completed') return 'bg-green-50 border-green-200';
    if (isOverdue) return 'bg-red-50 border-red-200';
    if (isUnassigned) return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-all ${getCardStyle()}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
          <h4 className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : isOverdue ? 'text-red-700' : ''}`}>
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
          <span>{getAssistantName(task.assigned_to)}</span>
        </div>
      </div>

      <div className="ml-4">
        {renderActionButton()}
      </div>
    </div>
  );
}