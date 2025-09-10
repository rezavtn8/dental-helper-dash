import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Task } from '@/types/task';
import { toast } from 'sonner';

interface OptimizedTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
}

export function useOptimizedTasks(): OptimizedTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userProfile?.clinic_id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      console.log('📋 Fetching tasks optimized:', {
        userId: userProfile.id,
        clinicId: userProfile.clinic_id
      });

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
        .or(`assigned_to.eq.${userProfile.id},assigned_to.is.null,claimed_by.eq.${userProfile.id},completed_by.eq.${userProfile.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching tasks:', error);
        throw error;
      }

      console.log('✅ Tasks fetched successfully:', data?.length || 0);
      setTasks(data || []);
    } catch (err: any) {
      console.error('❌ Failed to fetch tasks:', err);
      setError(err.message || 'Failed to fetch tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.clinic_id, userProfile?.id]);

  // Optimistic update function
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    if (!userProfile?.id) {
      console.error('❌ User not authenticated for task update');
      toast.error('User not authenticated');
      return false;
    }

    // Extract base UUID from task ID (remove date suffix if present)
    const baseTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(baseTaskId)) {
      console.error('❌ Invalid UUID format:', baseTaskId);
      toast.error('Invalid task ID format');
      return false;
    }

    console.log('🚀 Starting optimistic update:', { baseTaskId, updates });

    // Find the current task to store original state for rollback
    const originalTask = tasks.find(task => task.id === baseTaskId);
    if (!originalTask) {
      console.error('❌ Original task not found for rollback:', baseTaskId);
      toast.error('Task not found');
      return false;
    }

    // OPTIMISTIC UPDATE: Update local state immediately
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === baseTaskId 
          ? { ...task, ...updates }
          : task
      )
    );

    console.log('⚡ Optimistic update applied:', { baseTaskId, updates });

    try {
      // Background database update
      console.log('📝 Updating database:', { baseTaskId, updates });
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', baseTaskId)
        .select();

      if (error) {
        console.error('❌ Database update failed:', error);
        // ROLLBACK: Revert optimistic update on failure
        setTasks(currentTasks => 
          currentTasks.map(task => 
            task.id === baseTaskId 
              ? originalTask
              : task
          )
        );
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('❌ No task found in database:', baseTaskId);
        // ROLLBACK: Revert optimistic update
        setTasks(currentTasks => 
          currentTasks.map(task => 
            task.id === baseTaskId 
              ? originalTask
              : task
          )
        );
        throw new Error('Task not found in database');
      }

      console.log('✅ Database update successful:', { baseTaskId, updatedData: data[0] });
      
      // Update local state with actual database response
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === baseTaskId 
            ? { ...task, ...data[0] }
            : task
        )
      );

      return true;
    } catch (err: any) {
      console.error('❌ Task update failed:', {
        taskId: baseTaskId,
        error: err.message || err,
        updates
      });
      
      const errorMsg = err.message?.includes('not found') 
        ? 'Task not found. Refreshing task list.'
        : err.message?.includes('permission') 
        ? 'Permission denied. You may not have access to update this task.'
        : `Update failed: ${err.message || 'Unknown error'}`;
        
      toast.error(errorMsg);
      return false;
    }
  }, [userProfile?.id, tasks]);

  const refreshTasks = useCallback(async () => {
    console.log('🔄 Manual refresh requested');
    await fetchTasks();
  }, [fetchTasks]);

  // Simple polling for real-time updates (every 30 seconds)
  useEffect(() => {
    if (!userProfile?.clinic_id) return;

    console.log('⏰ Setting up polling for clinic:', userProfile.clinic_id);
    
    pollingRef.current = setInterval(() => {
      console.log('🔄 Polling for task updates');
      fetchTasks();
    }, 30000); // Poll every 30 seconds

    return () => {
      if (pollingRef.current) {
        console.log('🛑 Stopping polling');
        clearInterval(pollingRef.current);
      }
    };
  }, [userProfile?.clinic_id, fetchTasks]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    updateTask,
    refreshTasks
  };
}