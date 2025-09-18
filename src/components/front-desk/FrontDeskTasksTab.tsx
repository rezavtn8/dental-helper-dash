import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskActionButton } from '@/components/ui/task-action-button';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';

export function FrontDeskTasksTab() {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.clinic_id) {
      fetchTasks();
    }
  }, [userProfile?.clinic_id]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', userProfile?.clinic_id)
        .in('target_role', ['front_desk', 'shared'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'in-progress') {
        updates.claimed_by = userProfile?.id;
      } else if (newStatus === 'completed') {
        updates.completed_by = userProfile?.id;
        updates.completed_at = new Date().toISOString();
      } else if (newStatus === 'pending') {
        updates.claimed_by = null;
        updates.completed_by = null;
        updates.completed_at = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
      toast({
        title: "Task updated",
        description: `Task marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const TaskList = ({ tasks, showActions = true }: { tasks: Task[], showActions?: boolean }) => (
    <ScrollArea className="h-96">
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No tasks in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                  {task.priority && (
                    <Badge variant="outline">{task.priority}</Badge>
                  )}
                  {task.category && (
                    <Badge variant="outline">{task.category}</Badge>
                  )}
                  {task.target_role && (
                    <Badge variant="secondary">{task.target_role}</Badge>
                  )}
                </div>
                {task.created_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(task.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              {showActions && (
                <div className="ml-4 flex gap-2">
                  <TaskActionButton
                    status={task.status as any}
                    onClick={() => {
                      if (task.status === 'pending') {
                        handleTaskAction(task.id, 'in-progress');
                      } else if (task.status === 'in-progress') {
                        handleTaskAction(task.id, 'completed');
                      }
                    }}
                    action={task.status === 'pending' ? 'pickup' : 'toggle'}
                  />
                  {task.status !== 'pending' && (
                    <TaskActionButton
                      status={task.status as any}
                      onClick={() => handleTaskAction(task.id, 'pending')}
                      action="undo"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">All Front Desk Tasks</h3>
          <p className="text-muted-foreground">Manage your front desk tasks by status</p>
        </div>
        <Button onClick={fetchTasks} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList tasks={pendingTasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>In Progress Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList tasks={inProgressTasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList tasks={completedTasks} showActions={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}