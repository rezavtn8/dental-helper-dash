import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import TasksTab from '@/components/TasksTab';
import TeamPerformanceTab from '@/components/TeamPerformanceTab';
import TemplatesTab from '@/components/TemplatesTab';
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
  Copy,
  UserCheck,
  Bell,
  Stethoscope,
  Trophy,
  Zap,
  Repeat
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
  completed_by?: string | null;
  completed_at?: string | null;
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    'due-type': 'EoD',
    category: '',
    assigned_to: 'unassigned',
    recurrence: 'none',
    owner_notes: '',
    custom_due_date: undefined as Date | undefined
  });

  useEffect(() => {
    if (session && user && userProfile?.role === 'owner') {
      fetchTasks();
      fetchAssistants();
      
      // Set up real-time listeners
      const tasksChannel = supabase
        .channel('tasks_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `clinic_id=eq.${userProfile.clinic_id}`
          },
          (payload) => {
            console.log('Real-time task change:', payload);
            // Refetch tasks on any change
            fetchTasks();
          }
        )
        .subscribe();

      // Cleanup function
      return () => {
        supabase.removeChannel(tasksChannel);
      };
    }
  }, [session, user, userProfile]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform the data to match our interface
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
        custom_due_date: task.custom_due_date || undefined,
        completed_by: task.completed_by || null,
        completed_at: task.completed_at || null
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
        .select('id, name, email, role, is_active')
        .in('role', ['assistant', 'admin']);

      if (error) throw error;
      setAssistants(data || []);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const taskData = {
        ...newTask,
        assigned_to: newTask.assigned_to === 'unassigned' ? null : newTask.assigned_to,
        clinic_id: userProfile?.clinic_id,
        created_by: user?.id,
        status: 'To Do',
        checklist: checklist.length > 0 ? checklist as any : null,
        custom_due_date: newTask.custom_due_date ? newTask.custom_due_date.toISOString() : null
      };
      
      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

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
        recurrence: 'none',
        owner_notes: '',
        custom_due_date: undefined
      });
      setChecklist([]);
      
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

  const addAssistant = async (assistantData: { name: string; email: string; pin: string; role: 'admin' | 'assistant' }) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          name: assistantData.name,
          email: assistantData.email,
          pin: assistantData.pin,
          role: assistantData.role,
          clinic_id: userProfile?.clinic_id,
          is_active: true,
          must_change_pin: true,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: `${assistantData.role === 'admin' ? 'Admin' : 'Assistant'} Added`,
        description: `${assistantData.name} has been added to your team as ${assistantData.role === 'admin' ? 'an admin' : 'an assistant'}`
      });

      fetchAssistants();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: `Failed to add ${assistantData.role}`,
        variant: "destructive"
      });
    }
  };

  const resetAssistantPin = async (assistantId: string) => {
    try {
      // Generate new PIN
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { error } = await supabase.rpc('update_user_pin', {
        user_id: assistantId,
        new_pin: newPin
      });

      if (error) throw error;

      toast({
        title: "PIN Reset",
        description: `New PIN generated: ${newPin}. Please share this with the team member.`
      });

      fetchAssistants();
    } catch (error) {
      console.error('Error resetting PIN:', error);
      toast({
        title: "Error",
        description: "Failed to reset PIN",
        variant: "destructive"
      });
    }
  };

  const removeAssistant = async (assistantId: string) => {
    try {
      // First, reassign their tasks to unassigned
      await supabase
        .from('tasks')
        .update({ assigned_to: null })
        .eq('assigned_to', assistantId);

      // Then delete the assistant
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', assistantId);

      if (error) throw error;

      toast({
        title: "Team Member Removed",
        description: "The team member has been permanently removed from your clinic"
      });

      fetchAssistants();
      fetchTasks(); // Refresh tasks to show reassignments
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
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
        title: isActive ? "Team Member Activated" : "Team Member Deactivated",
        description: `The team member has been ${isActive ? 'activated' : 'deactivated'}`
      });

      fetchAssistants();
    } catch (error) {
      console.error('Error toggling team member status:', error);
      toast({
        title: "Error",
        description: "Failed to update team member status",
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

  // Mock data for charts
  const weeklyPatientData = [
    { day: 'Mon', patients: 28 },
    { day: 'Tue', patients: 32 },
    { day: 'Wed', patients: 24 },
    { day: 'Thu', patients: 38 },
    { day: 'Fri', patients: 42 },
    { day: 'Sat', patients: 16 },
    { day: 'Sun', patients: 8 }
  ];

  const taskCategoryData = [
    { name: 'Patient Care', value: 35, color: '#10b981' },
    { name: 'Cleaning', value: 28, color: '#3b82f6' },
    { name: 'Administrative', value: 22, color: '#f59e0b' },
    { name: 'Equipment', value: 15, color: '#ef4444' }
  ];

  const chartConfig = {
    patients: {
      label: "Patients",
      color: "hsl(var(--primary))",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-fit grid-cols-6 bg-muted/50">
                  <TabsTrigger value="dashboard" className="px-4">Dashboard</TabsTrigger>
                  <TabsTrigger value="tasks" className="px-4">Tasks</TabsTrigger>
                  <TabsTrigger value="team" className="px-4">Team & Performance</TabsTrigger>
                  <TabsTrigger value="insights" className="px-4">Insights</TabsTrigger>
                  <TabsTrigger value="templates" className="px-4">Templates</TabsTrigger>
                  <TabsTrigger value="settings" className="px-4">Settings</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center space-x-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
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
                            <SelectItem value="Before Opening">🌅 Before Opening</SelectItem>
                            <SelectItem value="Before 1PM">🕐 Before 1PM</SelectItem>
                            <SelectItem value="EoD">🌆 End of Day</SelectItem>
                            <SelectItem value="EoW">📅 End of Week</SelectItem>
                            <SelectItem value="EoM">🗓️ End of Month</SelectItem>
                            <SelectItem value="Custom">⏰ Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Setup">⚙️ Setup</SelectItem>
                          <SelectItem value="Cleaning">🧼 Cleaning</SelectItem>
                          <SelectItem value="Sterilization">🔬 Sterilization</SelectItem>
                          <SelectItem value="Labs">🧪 Labs</SelectItem>
                          <SelectItem value="Admin">📋 Admin</SelectItem>
                          <SelectItem value="Patient Care">🏥 Patient Care</SelectItem>
                          <SelectItem value="Equipment">🔧 Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">🔓 Leave Unassigned</SelectItem>
                          {assistants.map((assistant) => (
                            <SelectItem key={assistant.id} value={assistant.id}>
                              👤 {assistant.name}
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
                          <SelectItem value="none">🚫 None</SelectItem>
                          <SelectItem value="daily">📅 Daily</SelectItem>
                          <SelectItem value="weekly">📆 Weekly</SelectItem>
                          <SelectItem value="biweekly">🗓️ Biweekly</SelectItem>
                          <SelectItem value="monthly">📝 Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full">
                      Create Task
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              
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
            {/* Section 1: Smart Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Tasks Today Card */}
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
                    {overdueTasks.length > 0 && (
                      <span className="flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1 text-status-overdue" />
                        {overdueTasks.length} overdue
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Active Team Members Card */}
              <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-clinical-mint to-clinical-mint/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-clinical-mint-foreground">Active Team</CardTitle>
                  <Users className="h-5 w-5 text-clinical-mint-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-clinical-mint-foreground mb-3">{assistants.length}</div>
                  <div className="flex -space-x-2">
                    {assistants.slice(0, 4).map((assistant, i) => (
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

              {/* Patients Assisted Card */}
              <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-clinical-orange to-clinical-orange/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-clinical-orange-foreground">Patients Today</CardTitle>
                  <Activity className="h-5 w-5 text-clinical-orange-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-clinical-orange-foreground mb-2">42</div>
                  <div className="text-xs text-clinical-orange-foreground/80">
                    264 this week • <span className="text-status-completed">+8%</span> vs last week
                  </div>
                </CardContent>
              </Card>

              {/* Alerts Card */}
              <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-clinical-green to-clinical-green/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-clinical-green-foreground">Alerts</CardTitle>
                  <Bell className="h-5 w-5 text-clinical-green-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-clinical-green-foreground mb-2">{overdueTasks.length}</div>
                  <div className="text-xs text-clinical-green-foreground/80">
                    {overdueTasks.length === 0 ? 'All caught up!' : 'Items need attention'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 2: Daily Flow + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Timeline */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Live Activity Feed</span>
                  </CardTitle>
                  <CardDescription>Real-time updates from your clinic</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-clinical-green/20">
                      <div className="w-2 h-2 bg-status-completed rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sterilization completed - Op 2</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-clinical-sky/20">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Patient check-in complete</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-clinical-orange/20">
                      <div className="w-2 h-2 bg-status-pending rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Equipment maintenance scheduled</p>
                        <p className="text-xs text-muted-foreground">12 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-clinical-mint/20">
                      <div className="w-2 h-2 bg-status-completed rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Daily cleaning checklist completed</p>
                        <p className="text-xs text-muted-foreground">18 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Yesterday
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assign All Unclaimed
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Ping Assistants
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Repeat className="h-4 w-4 mr-2" />
                    Generate Daily Tasks
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Section 3: Mini Charts & Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Weekly Patient Load Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <BarChart3 className="h-4 w-4" />
                    <span>Weekly Patient Load</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[200px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyPatientData}>
                        <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Top Assistant Today */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Trophy className="h-4 w-4" />
                    <span>Top Assistant Today</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-4">
                  {assistants.length > 0 && (
                    <>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {assistants[0].name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{assistants[0].name}</p>
                        <p className="text-sm text-muted-foreground">8 tasks completed</p>
                        <div className="mt-2">
                          <Badge variant="secondary" className="bg-clinical-green text-clinical-green-foreground">
                            🏆 Daily Champion
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Most Common Task Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Activity className="h-4 w-4" />
                    <span>Task Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {taskCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {taskCategoryData.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="flex-1">{item.name}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
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
              onResetPin={resetAssistantPin}
            />
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
                <CardDescription>Analytics and insights coming soon</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <TemplatesTab 
              onCreateTask={async (taskData) => {
                // Use the existing createTask function but adapt for template data
                const templateTaskData = {
                  title: taskData.title,
                  description: taskData.description,
                  priority: taskData.priority || 'medium',
                  'due-type': taskData['due-type'] || 'EoD',
                  category: taskData.category || '',
                  assigned_to: 'unassigned',
                  recurrence: 'none',
                  owner_notes: '',
                  custom_due_date: undefined
                };
                setNewTask(templateTaskData);
                setChecklist(taskData.checklist || []);
                
                // Create the task using the same logic as createTask
                const finalTaskData = {
                  ...templateTaskData,
                  assigned_to: null,
                  clinic_id: userProfile?.clinic_id,
                  created_by: user?.id,
                  status: 'To Do',
                  checklist: taskData.checklist && taskData.checklist.length > 0 ? taskData.checklist as any : null,
                  custom_due_date: null
                };
                
                const { error } = await supabase
                  .from('tasks')
                  .insert(finalTaskData);

                if (error) throw error;
                
                fetchTasks();
              }}
              userRole={userProfile?.role || 'owner'}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Clinic settings coming soon</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;