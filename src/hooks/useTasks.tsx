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
        .select();

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('❌ No task found with ID:', baseTaskId);
        throw new Error(`Task not found in database: ${baseTaskId}`);
      }

      console.log(`✅ Task updated successfully:`, {
        taskId: baseTaskId,
        updatedData: data[0]
      });

      // Update local state immediately for optimistic updates
      console.log('🔄 Updating local state optimistically:', baseTaskId, data[0]);
      setTasks(prevTasks => 
        prevTasks.map(task => {
          const taskBaseId = task.id.includes('_') ? task.id.split('_')[0] : task.id;
          if (taskBaseId === baseTaskId) {
            console.log('✅ Found matching task for optimistic update:', task.id);
            return { 
              ...task, 
              ...data[0],
              id: task.id // Preserve the original ID format
            };
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

    const channelName = `tasks-changes-${userProfile.clinic_id}`;
    console.log('🔔 Setting up real-time task subscription:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `clinic_id=eq.${userProfile.clinic_id}`
        },
        (payload) => {
          console.log('🔔 Real-time task update received:', payload.eventType, payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new) {
                setTasks(prevTasks => {
                  const newTask = payload.new as Task;
                  // Check if task is relevant to this user (assigned to them or unassigned)
                  if (newTask.assigned_to === userProfile.id || !newTask.assigned_to) {
                    const exists = prevTasks.some(t => t.id === newTask.id);
                    if (!exists) {
                      console.log('➕ Adding new task to local state:', newTask.id);
                      return [...prevTasks, newTask];
                    }
                  }
                  return prevTasks;
                });
              }
              break;
            case 'UPDATE':
              if (payload.new) {
                setTasks(prevTasks => {
                  const updatedTask = payload.new as Task;
                  console.log('🔄 Updating task in local state:', updatedTask.id, updatedTask);
                  
                  return prevTasks.map(task => {
                    const taskBaseId = task.id.includes('_') ? task.id.split('_')[0] : task.id;
                    const updatedBaseId = updatedTask.id;
                    
                    if (taskBaseId === updatedBaseId) {
                      console.log('✅ Found matching task, updating:', taskBaseId);
                      // Preserve the recurring instance ID format if it exists
                      return { 
                        ...task, 
                        ...updatedTask,
                        id: task.id // Keep the original ID format (with date suffix if present)
                      };
                    }
                    return task;
                  });
                });
              }
              break;
            case 'DELETE':
              if (payload.old) {
                setTasks(prevTasks => {
                  const deletedTask = payload.old as Task;
                  return prevTasks.filter(task => {
                    const taskBaseId = task.id.includes('_') ? task.id.split('_')[0] : task.id;
                    const deletedBaseId = deletedTask.id;
                    return taskBaseId !== deletedBaseId;
                  });
                });
              }
              break;
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Cleaning up real-time task subscription:', channelName);
      supabase.removeChannel(channel);
    };
  }, [userProfile?.clinic_id, userProfile?.id]);

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