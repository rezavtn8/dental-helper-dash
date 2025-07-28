import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import TasksTab from '@/components/TasksTab';
import TeamPerformanceTab from '@/components/TeamPerformanceTab';
import { 
  Plus, 
  LogOut,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Activity,
  Settings,
  Stethoscope,
  UserPlus
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

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
  checklist?: ChecklistItem[];
  owner_notes?: string;
  custom_due_date?: string;
}

interface Assistant {
  id: string;
  name: string;
  email: string;
  is_active?: boolean;
  must_change_pin?: boolean;
}

const AdminDashboard = () => {
  const { session, user, userProfile, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
   if (session && user && userProfile?.role === 'admin') {
  fetchTasks();      // admin sees all tasks
  fetchAssistants();
} else if (session && user && userProfile?.role === 'assistant') {
  fetchTasks(true);  // assistant fetches limited task view
}
  }, [session, user, userProfile]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedTasks = (data || []).map(task => ({
        id: task.id || '',
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'To Do',
        'due-type': task['due-type'] || 'EoD',
        category: task.category || '',
        assigned_to: task.assigned_to,
        recurrence: task.recurrence || 'none',
        created_at: task.created_at || '',
        checklist: Array.isArray(task.checklist) ? (task.checklist as unknown as ChecklistItem[]) : [],
        owner_notes: task.owner_notes || undefined,
        custom_due_date: task.custom_due_date || undefined
      }));
      setTasks(transformedTasks);
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
        .select('id, name, email, is_active, must_change_pin')
        .eq('role', 'assistant');

      if (error) throw error;
      setAssistants(data || []);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    // Task creation logic similar to owner dashboard but for admins
    await fetchTasks();
  };

  const addAssistant = async (assistantData: { name: string; email: string; pin: string }) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          name: assistantData.name,
          email: assistantData.email,
          pin: assistantData.pin,
          role: 'assistant',
          clinic_id: userProfile?.clinic_id,
          is_active: true,
          must_change_pin: true,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Assistant Added",
        description: `${assistantData.name} has been added to the team`
      });

      fetchAssistants();
    } catch (error) {
      console.error('Error adding assistant:', error);
      toast({
        title: "Error",
        description: "Failed to add assistant",
        variant: "destructive"
      });
    }
  };

  const removeAssistant = async (assistantId: string) => {
    try {
      console.log('Admin removing assistant with ID:', assistantId);
      
      // First, reassign their tasks to unassigned
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ assigned_to: null })
        .eq('assigned_to', assistantId);

      if (taskError) {
        console.error('Error reassigning tasks:', taskError);
      }

      // Then delete the assistant from users table
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', assistantId)
        .eq('clinic_id', userProfile?.clinic_id); // Ensure we only delete from our clinic

      if (deleteError) {
        console.error('Error deleting assistant:', deleteError);
        throw deleteError;
      }

      console.log('Assistant successfully removed by admin');

      toast({
        title: "Assistant Removed",
        description: "The assistant has been removed from the team"
      });

      fetchAssistants();
      fetchTasks();
    } catch (error) {
      console.error('Error removing assistant:', error);
      toast({
        title: "Error",
        description: "Failed to remove assistant. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleAssistantStatus = async (assistantId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', assistantId);

      if (error) throw error;

      toast({
        title: isActive ? "Assistant Activated" : "Assistant Deactivated",
        description: `The assistant has been ${isActive ? 'activated' : 'deactivated'}`
      });

      fetchAssistants();
    } catch (error) {
      console.error('Error toggling assistant status:', error);
      toast({
        title: "Error",
        description: "Failed to update assistant status",
        variant: "destructive"
      });
    }
  };

  // Calculate dashboard metrics
  const today = new Date().toDateString();
  const todayTasks = tasks.filter(task => 
    new Date(task.created_at).toDateString() === today
  );
  const completedTasks = tasks.filter(task => task.status === 'Done');
  const pendingTasks = tasks.filter(task => task.status === 'To Do');
  const overdueTasks = tasks.filter(task => 
    task.status !== 'Done' && task['due-type'] === 'Before Opening'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">ClinicFlow</span>
                <Badge variant="secondary" className="ml-2">Admin</Badge>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-fit grid-cols-4 bg-muted/50">
                  <TabsTrigger value="dashboard" className="px-4">Dashboard</TabsTrigger>
                  <TabsTrigger value="tasks" className="px-4">Tasks</TabsTrigger>
                  <TabsTrigger value="team" className="px-4">Team Management</TabsTrigger>
                  <TabsTrigger value="settings" className="px-4">Settings</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {userProfile?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="space-y-8">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-clinical-sky to-clinical-sky/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-clinical-sky-foreground">Tasks Today</CardTitle>
                  <CalendarIcon className="h-5 w-5 text-clinical-sky-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-clinical-sky-foreground mb-2">{todayTasks.length}</div>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-status-completed" />
                      {completedTasks.length} completed
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-status-pending" />
                      {pendingTasks.length} pending
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-clinical-mint to-clinical-mint/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-clinical-mint-foreground">Team Members</CardTitle>
                  <Users className="h-5 w-5 text-clinical-mint-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-clinical-mint-foreground mb-3">{assistants.length}</div>
                  <div className="flex -space-x-2">
                    {assistants.slice(0, 4).map((assistant) => (
                      <Avatar key={assistant.id} className="h-8 w-8 border-2 border-clinical-mint">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {assistant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {assistants.length > 4 && (
                      <div className="h-8 w-8 rounded-full bg-muted border-2 border-clinical-mint flex items-center justify-center text-xs font-medium">
                        +{assistants.length - 4}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Overall team performance</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                  <AlertTriangle className={`h-5 w-5 ${overdueTasks.length > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${overdueTasks.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {overdueTasks.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {overdueTasks.length === 0 ? 'All caught up!' : 'Need attention'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates across your clinic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.assigned_to ? `Assigned to ${assistants.find(a => a.id === task.assigned_to)?.name || 'Unknown'}` : 'Unassigned'}
                        </p>
                      </div>
                      <Badge variant={task.status === 'Done' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-8">
            <TasksTab 
              tasks={tasks}
              assistants={assistants}
              onCreateTask={createTask}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="team" className="space-y-8">
            <TeamPerformanceTab 
              tasks={tasks}
              assistants={assistants}
              onAddAssistant={addAssistant}
              onRemoveAssistant={removeAssistant}
              onToggleAssistantStatus={toggleAssistantStatus}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Manage your admin preferences and account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Admin settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
