import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Task } from '@/types/task';
import { toast } from 'sonner';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!userProfile?.clinic_id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      console.log('📋 Fetching tasks for assistant:', {
        userId: userProfile.id,
        clinicId: userProfile.clinic_id,
        userRole: userProfile.role
      });

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
        .or(`assigned_to.eq.${userProfile.id},assigned_to.is.null`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching tasks:', error);
        throw error;
      }

      console.log('📋 Tasks fetched successfully:', {
        totalTasks: data?.length || 0,
        assignedToMe: data?.filter(t => t.assigned_to === userProfile.id).length || 0,
        unassigned: data?.filter(t => !t.assigned_to).length || 0,
        recurring: data?.filter(t => t.recurrence).length || 0
      });

      setTasks(data || []);
    } catch (err: any) {
      console.error('❌ Failed to fetch tasks:', err);
      setError(err.message || 'Failed to fetch tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.clinic_id, userProfile?.id, userProfile?.role]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    if (!userProfile?.id) {
      toast.error('User not authenticated');
      return false;
    }

    try {
      // Extract base UUID from task ID (remove date suffix if present)
      const baseTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      // Validate that we have a proper UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(baseTaskId)) {
        throw new Error(`Invalid task ID format: ${baseTaskId}`);
      }

      console.log(`📝 Updating task in database:`, {
        baseTaskId,
        updates
      });

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', baseTaskId)
        .select()
        .single();

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ No task found with ID:', baseTaskId);
        throw new Error(`Task not found in database: ${baseTaskId}`);
      }

      console.log(`✅ Task updated successfully:`, {
        taskId: baseTaskId,
        updatedData: data
      });

      // Update local state immediately for optimistic updates
      setTasks(prevTasks => 
        prevTasks.map(task => {
          const taskBaseId = task.id.includes('_') ? task.id.split('_')[0] : task.id;
          if (taskBaseId === baseTaskId) {
            return { ...task, ...data };
          }
          return task;
        })
      );

      return true;
    } catch (err: any) {
      console.error('❌ Task update failed:', {
        taskId,
        error: err.message || err
      });
      
      const errorMsg = err.message?.includes('not found') 
        ? 'Task not found. It may have been deleted or modified.'
        : err.message?.includes('Invalid task ID')
        ? 'Invalid task format. Please refresh the page.'
        : 'Update failed. Please try again.';
        
      toast.error(errorMsg);
      return false;
    }
  }, [userProfile?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userProfile?.clinic_id) return;

    console.log('🔔 Setting up real-time task subscription for clinic:', userProfile.clinic_id);

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `clinic_id=eq.${userProfile.clinic_id}`
        },
        (payload) => {
          console.log('🔔 Real-time task update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setTasks(prevTasks => [...prevTasks, payload.new as Task]);
              break;
            case 'UPDATE':
              setTasks(prevTasks => 
                prevTasks.map(task => {
                  const taskBaseId = task.id.includes('_') ? task.id.split('_')[0] : task.id;
                  const updatedBaseId = (payload.new as Task).id;
                  if (taskBaseId === updatedBaseId) {
                    return { ...task, ...(payload.new as Task) };
                  }
                  return task;
                })
              );
              break;
            case 'DELETE':
              setTasks(prevTasks => 
                prevTasks.filter(task => {
                  const taskBaseId = task.id.includes('_') ? task.id.split('_')[0] : task.id;
                  const deletedBaseId = (payload.old as Task).id;
                  return taskBaseId !== deletedBaseId;
                })
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Cleaning up real-time task subscription');
      supabase.removeChannel(channel);
    };
  }, [userProfile?.clinic_id]);

  // Fetch tasks on mount and when user profile changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    updateTask
  };
}