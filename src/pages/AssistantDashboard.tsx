import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Plus, 
  Minus,
  Calendar,
  AlertTriangle,
  LogOut
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  'due-type': string;
  category: string;
  assigned_to: string | null;
  created_at: string;
}

const AssistantDashboard = () => {
  const { session, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.role === 'assistant') {
      fetchTasks();
      fetchTodayPatientCount();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${session?.id},assigned_to.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayPatientCount = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('patient_logs')
        .select('patient_count')
        .eq('assistant_id', session?.id)
        .eq('date', today)
        .single();

      if (data) {
        setPatientCount(data.patient_count || 0);
      }
    } catch (error) {
      console.error('Error fetching patient count:', error);
    }
  };

  const pickTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: session?.id })
        .eq('id', taskId);

      if (error) throw error;
      
      toast({
        title: "Task Picked",
        description: "Task has been assigned to you"
      });
      
      fetchTasks();
    } catch (error) {
      console.error('Error picking task:', error);
      toast({
        title: "Error",
        description: "Failed to pick task",
        variant: "destructive"
      });
    }
  };

  const markTaskDone = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'Done' })
        .eq('id', taskId);

      if (error) throw error;
      
      toast({
        title: "Task Completed",
        description: "Great job! Task marked as done"
      });
      
      fetchTasks();
    } catch (error) {
      console.error('Error marking task done:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const updatePatientCount = async (increment: boolean) => {
    const newCount = increment ? patientCount + 1 : Math.max(0, patientCount - 1);
    const today = new Date().toISOString().split('T')[0];

    try {
      const { error } = await supabase
        .from('patient_logs')
        .upsert({
          assistant_id: session?.id,
          date: today,
          patient_count: newCount,
          clinic_id: session?.clinic_id
        });

      if (error) throw error;
      setPatientCount(newCount);
    } catch (error) {
      console.error('Error updating patient count:', error);
      toast({
        title: "Error",
        description: "Failed to update patient count",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const myTasks = tasks.filter(task => task.assigned_to === session?.id);
  const unassignedTasks = tasks.filter(task => !task.assigned_to);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {session?.role === 'assistant' ? session.name : 'User'}</h1>
            <p className="text-muted-foreground">Assistant Dashboard</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Patient Counter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Today's Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{patientCount}</div>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => updatePatientCount(false)}
                  disabled={patientCount === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon"
                  onClick={() => updatePatientCount(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>My Tasks ({myTasks.length})</CardTitle>
            <CardDescription>Tasks assigned to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No tasks assigned to you yet
              </p>
            ) : (
              myTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {task['due-type'] && (
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task['due-type']}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {task.status === 'To Do' && (
                    <Button 
                      size="sm"
                      onClick={() => markTaskDone(task.id)}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Done
                    </Button>
                  )}
                  
                  {task.status === 'Done' && (
                    <Badge variant="secondary" className="w-full justify-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Available Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Available Tasks ({unassignedTasks.length})</CardTitle>
            <CardDescription>Unassigned tasks you can pick up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unassignedTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No available tasks at the moment
              </p>
            ) : (
              unassignedTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {task['due-type'] && (
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task['due-type']}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => pickTask(task.id)}
                    className="w-full"
                  >
                    Pick This Task
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssistantDashboard;