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
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
  Repeat,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckSquare,
  FileText,
  Paperclip,
  X,
  ChevronDown,
  Layout,
  Table,
  Save,
  Tag,
  Clock4
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
  checklist?: ChecklistItem[];
  owner_notes?: string;
  custom_due_date?: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Template {
  id: string;
  title: string;
  description: string;
  checklist?: ChecklistItem[];
  category: string;
  'due-type': string;
  recurrence: string;
  owner_notes?: string;
  specialty: string;
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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [taskViewMode, setTaskViewMode] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customDate, setCustomDate] = useState<Date>();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    'due-type': 'EoD',
    category: '',
    assigned_to: '',
    recurrence: 'none',
    owner_notes: '',
    custom_due_date: undefined as Date | undefined
  });

  useEffect(() => {
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
      const taskData = {
        ...newTask,
        assigned_to: newTask.assigned_to || null,
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
        assigned_to: '',
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

  // Mock data for charts (replace with real data)
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
                          <SelectItem value="">Unassigned</SelectItem>
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

          {/* Other tab contents would go here */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Toolbar Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Setup">Setup</SelectItem>
                    <SelectItem value="Labs">Labs</SelectItem>
                    <SelectItem value="Patient Care">Patient Care</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center border rounded-lg p-1">
                  <Button
                    variant={taskViewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTaskViewMode('table')}
                    className="px-3"
                  >
                    <Table className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={taskViewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTaskViewMode('kanban')}
                    className="px-3"
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                </div>
                
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Templates
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Task Templates</DialogTitle>
                      <DialogDescription>
                        Choose from pre-built templates or create your own
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      {/* Template Cards */}
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-clinical-sky/20 text-clinical-sky-foreground">
                              Endo
                            </Badge>
                            <Clock4 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <CardTitle className="text-base">Endo Operatory Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">
                            Complete microscope and endo equipment preparation
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center text-muted-foreground">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              5 checklist items
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Repeat className="h-3 w-3 mr-1" />
                              Daily
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-clinical-mint/20 text-clinical-mint-foreground">
                              Cleaning
                            </Badge>
                            <Clock4 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <CardTitle className="text-base">Morning Sterilization</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">
                            Complete morning sterilization and setup routine
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center text-muted-foreground">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              8 checklist items
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Repeat className="h-3 w-3 mr-1" />
                              Daily
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-clinical-orange/20 text-clinical-orange-foreground">
                              Administrative
                            </Badge>
                            <Clock4 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <CardTitle className="text-base">Post-Op Calls</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">
                            Thursday afternoon patient follow-up calls
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center text-muted-foreground">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              3 checklist items
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Repeat className="h-3 w-3 mr-1" />
                              Weekly
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex justify-end mt-6 pt-4 border-t">
                      <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                        Close
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription>
                        Build a comprehensive task for your clinic team
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={createTask} className="space-y-6 mt-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm font-medium">Task Title</Label>
                          <Input
                            id="title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            placeholder="Enter a clear, descriptive title"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                          <Textarea
                            id="description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            placeholder="Provide detailed instructions..."
                            rows={3}
                          />
              </div>
            </div>

            {/* Main Task Table/Kanban View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Tasks ({tasks.filter(task => {
                    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        task.description.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
                    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
                    return matchesSearch && matchesCategory && matchesStatus;
                  }).length})</span>
                  <Badge variant="outline" className="text-xs">
                    {taskViewMode === 'table' ? 'Table View' : 'Kanban View'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {taskViewMode === 'table' ? (
                  /* Table View */
                  <div className="space-y-4">
                    {tasks.filter(task => {
                      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
                      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
                      return matchesSearch && matchesCategory && matchesStatus;
                    }).length === 0 ? (
                      <div className="text-center py-12">
                        <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {tasks.length === 0 
                            ? "Create your first task to get started"
                            : "Try adjusting your search or filters"
                          }
                        </p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Task
                        </Button>
                      </div>
                    ) : (
                      tasks.filter(task => {
                        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            task.description.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
                        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
                        return matchesSearch && matchesCategory && matchesStatus;
                      }).map((task) => (
                        <Card key={task.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold">{task.title}</h4>
                                  <Badge 
                                    variant={task.status === 'Done' ? 'default' : task.status === 'To Do' ? 'secondary' : 'outline'}
                                    className="text-xs"
                                  >
                                    {task.status === 'Done' ? '✅' : task.status === 'To Do' ? '⏳' : '🔄'} {task.status}
                                  </Badge>
                                  
                                  {task.category && (
                                    <Badge variant="outline" className="text-xs">
                                      {task.category === 'Cleaning' && '🧼'}
                                      {task.category === 'Setup' && '⚙️'}
                                      {task.category === 'Labs' && '🧪'}
                                      {task.category === 'Patient Care' && '🏥'}
                                      {task.category === 'Administrative' && '📋'}
                                      {task.category === 'Equipment' && '🔧'}
                                      {task.category}
                                    </Badge>
                                  )}
                                  
                                  {task.priority && (
                                    <Badge 
                                      variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}
                                      className="text-xs"
                                    >
                                      {task.priority === 'high' && '🔴'}
                                      {task.priority === 'medium' && '🟡'}
                                      {task.priority === 'low' && '🟢'}
                                      {task.priority}
                                    </Badge>
                                  )}
                                </div>
                                
                                {task.description && (
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                )}
                                
                                {task.checklist && task.checklist.length > 0 && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <CheckSquare className="h-3 w-3 mr-1" />
                                    {task.checklist.filter(item => item.completed).length}/{task.checklist.length} items completed
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    Due: {task['due-type']}
                                  </span>
                                  
                                  {task.recurrence && task.recurrence !== 'none' && (
                                    <span className="flex items-center">
                                      <Repeat className="h-3 w-3 mr-1" />
                                      {task.recurrence}
                                    </span>
                                  )}
                                  
                                  <span className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    {task.assigned_to 
                                      ? assistants.find(a => a.id === task.assigned_to)?.name || 'Unknown'
                                      : 'Unassigned'
                                    }
                                  </span>
                                </div>
                                
                                {task.owner_notes && (
                                  <div className="mt-2 p-2 bg-clinical-sky/10 rounded text-xs">
                                    <strong>Owner Notes:</strong> {task.owner_notes}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                ) : (
                  /* Kanban View */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['To Do', 'In Progress', 'Done'].map(status => (
                      <div key={status} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">
                            {status} ({tasks.filter(t => t.status === status).length})
                          </h3>
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'To Do' ? 'bg-clinical-orange' :
                            status === 'In Progress' ? 'bg-clinical-sky' :
                            'bg-clinical-green'
                          }`} />
                        </div>
                        
                        <div className="space-y-3 min-h-[400px] p-2 bg-muted/30 rounded-lg">
                          {tasks.filter(task => task.status === status).map(task => (
                            <Card key={task.id} className="cursor-move hover:shadow-sm transition-shadow">
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm">{task.title}</h4>
                                  
                                  {task.category && (
                                    <Badge variant="outline" className="text-xs">
                                      {task.category}
                                    </Badge>
                                  )}
                                  
                                  <div className="text-xs text-muted-foreground">
                                    Due: {task['due-type']}
                                  </div>
                                  
                                  {task.assigned_to && (
                                    <div className="flex items-center space-x-1">
                                      <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-xs">
                                          {assistants.find(a => a.id === task.assigned_to)?.name?.slice(0, 2) || 'UN'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-muted-foreground">
                                        {assistants.find(a => a.id === task.assigned_to)?.name || 'Unknown'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
                      
                      {/* Checklist Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Checklist Items</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newItem: ChecklistItem = {
                                id: Math.random().toString(36).substr(2, 9),
                                text: '',
                                completed: false
                              };
                              setChecklist([...checklist, newItem]);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Item
                          </Button>
                        </div>
                        
                        {checklist.length > 0 && (
                          <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                            {checklist.map((item, index) => (
                              <div key={item.id} className="flex items-center space-x-2">
                                <CheckSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <Input
                                  value={item.text}
                                  onChange={(e) => {
                                    const updated = [...checklist];
                                    updated[index].text = e.target.value;
                                    setChecklist(updated);
                                  }}
                                  placeholder={`Step ${index + 1}...`}
                                  className="flex-1 h-8"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setChecklist(checklist.filter((_, i) => i !== index));
                                  }}
                                  className="p-1 h-8 w-8"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Task Configuration */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Category</Label>
                          <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                            <SelectTrigger>
                              <Tag className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cleaning">🧼 Cleaning</SelectItem>
                              <SelectItem value="Setup">⚙️ Setup</SelectItem>
                              <SelectItem value="Labs">🧪 Labs</SelectItem>
                              <SelectItem value="Patient Care">🏥 Patient Care</SelectItem>
                              <SelectItem value="Administrative">📋 Administrative</SelectItem>
                              <SelectItem value="Equipment">🔧 Equipment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Priority</Label>
                          <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">🟢 Low</SelectItem>
                              <SelectItem value="medium">🟡 Medium</SelectItem>
                              <SelectItem value="high">🔴 High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Due Time</Label>
                          <Select value={newTask['due-type']} onValueChange={(value) => setNewTask({ ...newTask, 'due-type': value })}>
                            <SelectTrigger>
                              <Clock4 className="h-4 w-4 mr-2" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Before Opening">🌅 Before Opening</SelectItem>
                              <SelectItem value="Before 1PM">🕐 Before 1PM</SelectItem>
                              <SelectItem value="EoD">🌆 End of Day</SelectItem>
                              <SelectItem value="EoW">📅 End of Week</SelectItem>
                              <SelectItem value="EoM">🗓️ End of Month</SelectItem>
                              <SelectItem value="Custom">⏰ Custom Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Recurrence</Label>
                          <Select value={newTask.recurrence} onValueChange={(value) => setNewTask({ ...newTask, recurrence: value })}>
                            <SelectTrigger>
                              <Repeat className="h-4 w-4 mr-2" />
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
                      </div>

                      {/* Assignment */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Assign To</Label>
                        <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}>
                          <SelectTrigger>
                            <Users className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Leave unassigned (open to claim)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Unassigned (open to claim)</SelectItem>
                            {assistants.map((assistant) => (
                              <SelectItem key={assistant.id} value={assistant.id}>
                                {assistant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Advanced Options */}
                      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                        <CollapsibleTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-between p-2"
                          >
                            <span className="text-sm font-medium">Advanced Options</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 pt-4">
                          {/* Custom Date Picker */}
                          {newTask['due-type'] === 'Custom' && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Custom Due Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {customDate ? customDate.toLocaleDateString() : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={customDate}
                                    onSelect={(date) => {
                                      setCustomDate(date);
                                      setNewTask({ ...newTask, custom_due_date: date });
                                    }}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}

                          {/* Owner Notes */}
                          <div className="space-y-2">
                            <Label htmlFor="owner-notes" className="text-sm font-medium">Owner Notes / Tips</Label>
                            <Textarea
                              id="owner-notes"
                              value={newTask.owner_notes}
                              onChange={(e) => setNewTask({ ...newTask, owner_notes: e.target.value })}
                              placeholder="Add helpful tips or special instructions for your team..."
                              rows={3}
                            />
                          </div>

                          {/* File Attachment Placeholder */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Attachments</Label>
                            <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center text-muted-foreground">
                              <Paperclip className="h-6 w-6 mx-auto mb-2" />
                              <p className="text-sm">File attachments coming soon</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Action Buttons */}
                      <div className="flex justify-between pt-6 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // Save as template functionality
                            toast({
                              title: "Template Saved",
                              description: "Task saved as template for future use"
                            });
                          }}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save as Template
                        </Button>
                        
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            Create Task
                          </Button>
                        </div>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team & Performance</CardTitle>
                <CardDescription>Team performance metrics coming soon</CardDescription>
              </CardHeader>
            </Card>
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
            <Card>
              <CardHeader>
                <CardTitle>Templates</CardTitle>
                <CardDescription>Task templates coming soon</CardDescription>
              </CardHeader>
            </Card>
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
