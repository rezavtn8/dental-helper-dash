import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TaskStatus } from '@/lib/taskStatus';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export function useTaskOperations() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const executeTaskOperation = async (
    taskId: string,
    operation: () => Promise<any>,
    successMessage: string,
    errorMessage: string
  ) => {
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    
    if (loading === taskId) return;
    
    setLoading(taskId);
    
    try {
      const { error } = await operation();
      if (error) throw error;
      toast.success(successMessage);
    } catch (error) {
      console.error(`Task operation error:`, error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(null);
    }
  };

  const claimTask = async (taskId: string) => {
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    
    await executeTaskOperation(
      taskId,
      async () => {
        const { error } = await supabase.from('tasks').update({
          assigned_to: userProfile?.id,
          claimed_by: userProfile?.id
        }).eq('id', dbTaskId);
        return { error };
      },
      'Task claimed!',
      'Failed to claim task'
    );
  };

  const startTask = async (taskId: string) => {
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    
    await executeTaskOperation(
      taskId,
      async () => {
        const { error } = await supabase.from('tasks').update({
          status: 'in-progress' as TaskStatus
        }).eq('id', dbTaskId);
        return { error };
      },
      'Task started!',
      'Failed to start task'
    );
  };

  const completeTask = async (taskId: string) => {
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    
    await executeTaskOperation(
      taskId,
      async () => {
        const { error } = await supabase.from('tasks').update({
          status: 'completed' as TaskStatus,
          completed_by: userProfile?.id,
          completed_at: new Date().toISOString()
        }).eq('id', dbTaskId);
        return { error };
      },
      'Task completed! 🎉',
      'Failed to complete task'
    );
  };

  const resetTask = async (taskId: string) => {
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    
    await executeTaskOperation(
      taskId,
      async () => {
        const { error } = await supabase.from('tasks').update({
          status: 'pending' as TaskStatus
        }).eq('id', dbTaskId);
        return { error };
      },
      'Task reset to pending',
      'Failed to reset task'
    );
  };

  const returnTask = async (taskId: string) => {
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    
    await executeTaskOperation(
      taskId,
      async () => {
        const { error } = await supabase.from('tasks').update({
          assigned_to: null,
          claimed_by: null,
          status: 'pending' as TaskStatus
        }).eq('id', dbTaskId);
        return { error };
      },
      'Task returned',
      'Failed to return task'
    );
  };

  const undoCompletion = async (taskId: string) => {
    const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    
    await executeTaskOperation(
      taskId,
      async () => {
        const { error } = await supabase.from('tasks').update({
          status: 'pending' as TaskStatus,
          completed_by: null,
          completed_at: null
        }).eq('id', dbTaskId);
        return { error };
      },
      'Task reopened',
      'Failed to reopen task'
    );
  };

  return {
    loading,
    claimTask,
    startTask,
    completeTask,
    resetTask,
    returnTask,
    undoCompletion,
    isLoading: (taskId: string) => loading === taskId
  };
}