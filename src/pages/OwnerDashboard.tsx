
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  LogOut,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3
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
  recurrence: string;
  created_at: string;
}

interface Assistant {
  id: string;
  name: string;
  email: string;
}

const OwnerDashboard = () => {
  const { session, user, userProfile, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    'due-type': 'EoD',
    category: '',
    assigned_to: 'unassigned',
    recurrence: 'none'
  });

  useEffect(() => {
    console.log('OwnerDashboard - session:', !!session, 'user:', !!user, 'userProfile:', userProfile);
    if (session && user && userProfile?.role === 'owner') {
      fetchTasks();
      fetchAssistants();
    }
  }, [session, user, userProfile]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
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

  const fetchAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'assistant');

      if (error) throw error;
      setAssistants(data || []);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          ...newTask,
          assigned_to: newTask.assigned_to === 'unassigned' ? null : newTask.assigned_to,
          clinic_id: userProfile?.clinic_id,
          created_by: user?.id,
          status: 'To Do'
        });

      if (error) throw error;

      toast({
        title: "Task Created",
        description: "New task has been created successfully"
      });

      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        'due-type': 'EoD',
        category: '',
        assigned_to: 'unassigned',
        recurrence: 'none'
      });
      
      setIsCreateDialogOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const reassignTask = async (taskId: string, assistantId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: assistantId === 'unassigned' ? null : assistantId })
        .eq('id', taskId);

      if (error) throw error;
      
      toast({
        title: "Task Reassigned",
        description: "Task assignment has been updated"
      });
      
      fetchTasks();
    } catch (error) {
      console.error('Error reassigning task:', error);
      toast({
        title: "Error",
        description: "Failed to reassign task",
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

  const getAssignedAssistant = (assistantId: string | null) => {
    if (!assistantId) return 'Unassigned';
    const assistant = assistants.find(a => a.id === assistantId);
    return assistant?.name || 'Unknown';
  };

  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const pendingTasks = tasks.filter(task => task.status === 'To Do').length;

  // Show loading screen if still loading or if user profile doesn't exist yet
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
          <p className="text-sm text-muted-foreground mt-2">
            {!userProfile ? 'Setting up your profile...' : 'Loading data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage your clinic's tasks and team</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task for your team
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={createTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Due Time</Label>
                      <Select value={newTask['due-type']} onValueChange={(value) => setNewTask({ ...newTask, 'due-type': value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Before Opening">Before Opening</SelectItem>
                          <SelectItem value="Before 1PM">Before 1PM</SelectItem>
                          <SelectItem value="EoD">End of Day</SelectItem>
                          <SelectItem value="EoW">End of Week</SelectItem>
                          <SelectItem value="EoM">End of Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      placeholder="e.g., Patient Care, Cleaning, Administrative"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Leave unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {assistants.map((assistant) => (
                          <SelectItem key={assistant.id} value={assistant.id}>
                            {assistant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Recurrence</Label>
                    <Select value={newTask.recurrence} onValueChange={(value) => setNewTask({ ...newTask, recurrence: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No recurrence</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Biweekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Task
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>All Tasks ({tasks.length})</CardTitle>
            <CardDescription>Manage and monitor all clinic tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tasks created yet. Create your first task to get started.
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant={task.status === 'Done' ? 'secondary' : 'outline'}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {task['due-type']}
                      </span>
                      {task.category && (
                        <span className="text-muted-foreground">
                          Category: {task.category}
                        </span>
                      )}
                      {task.recurrence && task.recurrence !== 'none' && (
                        <span className="text-muted-foreground">
                          Repeats: {task.recurrence}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Assigned to: {getAssignedAssistant(task.assigned_to)}
                      </span>
                      
                      <Select 
                        value={task.assigned_to || 'unassigned'} 
                        onValueChange={(value) => reassignTask(task.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Reassign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {assistants.map((assistant) => (
                            <SelectItem key={assistant.id} value={assistant.id}>
                              {assistant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
