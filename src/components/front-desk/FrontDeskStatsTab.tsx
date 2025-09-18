import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Task } from '@/types/task';

export function FrontDeskStatsTab() {
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
        .in('target_role', ['front_desk', 'shared']);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Tasks I've worked on
  const myTasks = tasks.filter(task => 
    task.claimed_by === userProfile?.id || 
    task.completed_by === userProfile?.id ||
    task.assigned_to === userProfile?.id
  );
  const myCompletedTasks = myTasks.filter(task => task.status === 'completed').length;
  const myCompletionRate = myTasks.length > 0 ? Math.round((myCompletedTasks / myTasks.length) * 100) : 0;

  // Overdue tasks (assuming tasks created more than 7 days ago and not completed)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const overdueTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    new Date(task.created_at) < sevenDaysAgo
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Front Desk Analytics</h3>
        <p className="text-muted-foreground">Track your front desk task performance and completion metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold">{inProgressTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold">{overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Completion Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Team Progress</span>
              <Badge variant={completionRate >= 80 ? "default" : completionRate >= 60 ? "secondary" : "destructive"}>
                {completionRate}%
              </Badge>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Personal Progress</span>
              <Badge variant={myCompletionRate >= 80 ? "default" : myCompletionRate >= 60 ? "secondary" : "destructive"}>
                {myCompletionRate}%
              </Badge>
            </div>
            <Progress value={myCompletionRate} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {myCompletedTasks} of {myTasks.length} tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Task Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">Completed Tasks</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{completedTasks}</div>
                <div className="text-sm text-muted-foreground">{completionRate}% of total</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Tasks in Progress</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{inProgressTasks}</div>
                <div className="text-sm text-muted-foreground">
                  {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}% of total
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Pending Tasks</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{pendingTasks}</div>
                <div className="text-sm text-muted-foreground">
                  {totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}% of total
                </div>
              </div>
            </div>

            {overdueTasks > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Overdue Tasks</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{overdueTasks}</div>
                  <div className="text-sm text-muted-foreground">Needs attention</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}