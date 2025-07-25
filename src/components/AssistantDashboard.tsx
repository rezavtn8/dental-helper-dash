import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { 
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Stethoscope,
  CheckSquare,
  MessageSquare,
  Target,
  TrendingUp,
  Award,
  Users,
  ClipboardList,
  Bell,
  Hand
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

const AssistantDashboard = () => {
  const { session, user, userProfile, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskNote, setTaskNote] = useState('');
  const [patientsToday, setPatientsToday] = useState(0);

  useEffect(() => {
    if (session && user && (userProfile?.role === 'assistant' || userProfile?.role === 'admin')) {
      fetchMyTasks();
    }
  }, [session, user, userProfile]);

  const fetchMyTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${user?.id},assigned_to.is.null`)
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

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Updated",
        description: `Task marked as ${status.toLowerCase()}`
      });

      fetchMyTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const claimTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: user?.id })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Claimed",
        description: "Task has been assigned to you"
      });

      fetchMyTasks();
    } catch (error) {
      console.error('Error claiming task:', error);
      toast({
        title: "Error",
        description: "Failed to claim task",
        variant: "destructive"
      });
    }
  };

  const updateChecklist = async (taskId: string, checklist: ChecklistItem[]) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ checklist: checklist as any })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, checklist } : task
      ));
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast({
        title: "Error",
        description: "Failed to update checklist",
        variant: "destructive"
      });
    }
  };

  // Get today's date
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Filter tasks
  const myTasks = tasks.filter(task => task.assigned_to === user?.id);
  const availableTasks = tasks.filter(task => !task.assigned_to);
  const completedToday = myTasks.filter(task => task.status === 'Done');
  const overdueToday = myTasks.filter(task => 
    task.status !== 'Done' && task['due-type'] === 'Before Opening'
  );

  // Task timing breakdown
  const beforeOpening = myTasks.filter(task => task['due-type'] === 'Before Opening');
  const before1PM = myTasks.filter(task => task['due-type'] === 'Before 1PM');
  const endOfDay = myTasks.filter(task => task['due-type'] === 'EoD');

  // Fetch patient count for today
  useEffect(() => {
    fetchPatientsToday();
  }, [session, user]);

  const fetchPatientsToday = async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('patient_logs')
        .select('patient_count')
        .eq('assistant_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      setPatientsToday(data?.patient_count || 0);
    } catch (error) {
      console.error('Error fetching patient count:', error);
    }
  };

  const incrementPatientCount = async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing, error: fetchError } = await supabase
        .from('patient_logs')
        .select('id, patient_count')
        .eq('assistant_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existing) {
        const { error } = await supabase
          .from('patient_logs')
          .update({ patient_count: existing.patient_count + 1 })
          .eq('id', existing.id);
        
        if (error) throw error;
        setPatientsToday(existing.patient_count + 1);
      } else {
        const { error } = await supabase
          .from('patient_logs')
          .insert({
            assistant_id: user.id,
            clinic_id: userProfile?.clinic_id,
            date: today,
            patient_count: 1
          });
        
        if (error) throw error;
        setPatientsToday(1);
      }

      toast({
        title: "Patient Added",
        description: "Patient count updated successfully"
      });
    } catch (error) {
      console.error('Error updating patient count:', error);
      toast({
        title: "Error",
        description: "Failed to update patient count",
        variant: "destructive"
      });
    }
  };

  // Weekly completion data for chart
  const weeklyData = [
    { day: 'Mon', completed: Math.floor(Math.random() * 8) + 3 },
    { day: 'Tue', completed: Math.floor(Math.random() * 8) + 3 },
    { day: 'Wed', completed: Math.floor(Math.random() * 8) + 3 },
    { day: 'Thu', completed: Math.floor(Math.random() * 8) + 3 },
    { day: 'Fri', completed: Math.floor(Math.random() * 8) + 3 },
    { day: 'Sat', completed: Math.floor(Math.random() * 5) + 1 },
    { day: 'Sun', completed: Math.floor(Math.random() * 3) + 1 }
  ];

  const chartConfig = {
    completed: {
      label: "Tasks Completed",
      color: "hsl(var(--primary))",
    },
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 border-red-200 bg-red-50';
      case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'low': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cleaning': return '🧼';
      case 'setup': return '⚙️';
      case 'sterilization': return '🔬';
      case 'labs': return '🧪';
      case 'patient care': return '🏥';
      case 'admin': return '📋';
      case 'equipment': return '🔧';
      default: return '📌';
    }
  };

  const groupTasksByTiming = (tasks: Task[]) => {
    const beforeOpeningTasks = tasks.filter(t => t['due-type'] === 'Before Opening');
    const before1PMTasks = tasks.filter(t => t['due-type'] === 'Before 1PM');
    const endOfDayTasks = tasks.filter(t => t['due-type'] === 'EoD');
    const otherTasks = tasks.filter(t => !['Before Opening', 'Before 1PM', 'EoD'].includes(t['due-type']));

    return { beforeOpeningTasks, before1PMTasks, endOfDayTasks, otherTasks };
  };

  const renderTaskCard = (task: Task, isAvailable = false) => (
    <Card 
      key={task.id} 
      className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
        task.status === 'Done' ? 'opacity-75 border-green-200' : ''
      } ${isAvailable ? 'border-dashed border-blue-200' : ''}`}
      onClick={() => {
        setSelectedTask(task);
        setTaskNote('');
        setIsTaskDialogOpen(true);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            <span className="text-lg">{getCategoryIcon(task.category)}</span>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{task.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>
            <Badge variant={task.status === 'Done' ? 'default' : isAvailable ? 'secondary' : 'outline'} className="text-xs">
              {isAvailable ? 'Available' : task.status}
            </Badge>
          </div>
        </div>

        {task.checklist && task.checklist.length > 0 && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <CheckSquare className="h-3 w-3 mr-1" />
            {task.checklist.filter(item => item.completed).length}/{task.checklist.length} items completed
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {task.category}
          </span>
          {isAvailable ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                claimTask(task.id);
              }}
              className="text-xs"
            >
              <Hand className="h-3 w-3 mr-1" />
              Pick Up
            </Button>
          ) : task.status !== 'Done' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                updateTaskStatus(task.id, 'Done');
              }}
              className="text-xs"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Done
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                updateTaskStatus(task.id, 'To Do');
              }}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Undo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const { beforeOpeningTasks, before1PMTasks, endOfDayTasks, otherTasks } = groupTasksByTiming(myTasks);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">ClinicFlow</span>
                <Badge variant="outline" className="ml-2">
                  {userProfile?.role === 'admin' ? 'Admin' : 'Assistant'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">Welcome, {userProfile?.name}</p>
                <p className="text-xs text-muted-foreground">{today}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {userProfile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
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
        {/* Daily Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* My Tasks Today */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-clinical-sky to-clinical-sky/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-clinical-sky-foreground">My Tasks Today</CardTitle>
              <ClipboardList className="h-5 w-5 text-clinical-sky-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-clinical-sky-foreground mb-2">{myTasks.length}</div>
              <div className="text-xs text-clinical-sky-foreground/80">
                {completedToday.length} completed • {overdueToday.length} overdue
              </div>
            </CardContent>
          </Card>

          {/* Task Timing Breakdown */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-clinical-mint to-clinical-mint/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-clinical-mint-foreground">Task Timing</CardTitle>
              <Clock className="h-5 w-5 text-clinical-mint-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-clinical-mint-foreground mb-2">
                {beforeOpening.length + before1PM.length}
              </div>
              <div className="text-xs text-clinical-mint-foreground/80">
                {beforeOpening.length} before opening • {before1PM.length} before 1PM
              </div>
            </CardContent>
          </Card>

          {/* Patients Today */}
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={incrementPatientCount}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients Today</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{patientsToday}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Patients assisted</p>
                <Button size="sm" variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Add Patient
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Notes */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts & Notes</CardTitle>
              <Bell className={`h-5 w-5 ${overdueToday.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${overdueToday.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {overdueToday.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {overdueToday.length > 0 ? 'Overdue tasks' : 'All caught up!'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Task Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* My Tasks by Timing */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Today's Tasks</h2>
            
            {/* Before Opening */}
            {beforeOpeningTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Before Opening</h3>
                  <Badge variant="outline">{beforeOpeningTasks.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {beforeOpeningTasks.map(task => renderTaskCard(task))}
                </div>
              </div>
            )}

            {/* Before 1PM */}
            {before1PMTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Before 1PM</h3>
                  <Badge variant="outline">{before1PMTasks.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {before1PMTasks.map(task => renderTaskCard(task))}
                </div>
              </div>
            )}

            {/* End of Day */}
            {endOfDayTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">End of Day</h3>
                  <Badge variant="outline">{endOfDayTasks.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {endOfDayTasks.map(task => renderTaskCard(task))}
                </div>
              </div>
            )}

            {/* Other Tasks */}
            {otherTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Other Tasks</h3>
                  <Badge variant="outline">{otherTasks.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {otherTasks.map(task => renderTaskCard(task))}
                </div>
              </div>
            )}

            {/* No tasks message */}
            {myTasks.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No tasks assigned yet.<br />Check available tasks to claim some!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Available Tasks */}
            {availableTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Available Tasks</h3>
                  <Badge variant="outline">{availableTasks.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {availableTasks.map(task => renderTaskCard(task, true))}
                </div>
              </div>
            )}
          </div>

          {/* Stats & Notes Sidebar */}
          <div className="space-y-6">
            {/* Weekly Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <XAxis 
                          dataKey="day" 
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar 
                          dataKey="completed" 
                          fill="var(--color-completed)"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Badge */}
            {completedToday.length >= 5 && (
              <Card className="border-gold-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardContent className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-yellow-800">Daily Champion!</h3>
                    <p className="text-sm text-yellow-700">
                      {completedToday.length} tasks completed today
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Leave a Note
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{getCategoryIcon(selectedTask?.category || '')}</span>
              <span>{selectedTask?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedTask?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedTask?.checklist && selectedTask.checklist.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Checklist</h4>
                <div className="space-y-2">
                  {selectedTask.checklist.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`check-${index}`}
                        checked={item.completed}
                        onCheckedChange={(checked) => {
                          const newChecklist = [...(selectedTask.checklist || [])];
                          newChecklist[index].completed = !!checked;
                          updateChecklist(selectedTask.id, newChecklist);
                          setSelectedTask({ ...selectedTask, checklist: newChecklist });
                        }}
                      />
                      <label 
                        htmlFor={`check-${index}`}
                        className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.text}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTask?.owner_notes && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Owner Notes</h4>
                <p className="text-sm bg-muted p-2 rounded">{selectedTask.owner_notes}</p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Leave a Note</h4>
              <Textarea
                placeholder="Add any notes about this task..."
                value={taskNote}
                onChange={(e) => setTaskNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              {!selectedTask?.assigned_to ? (
                <Button 
                  onClick={() => {
                    claimTask(selectedTask?.id || '');
                    setIsTaskDialogOpen(false);
                  }}
                  className="flex-1"
                >
                  <Hand className="h-4 w-4 mr-2" />
                  Pick Up Task
                </Button>
              ) : selectedTask.status !== 'Done' ? (
                <Button 
                  onClick={() => {
                    updateTaskStatus(selectedTask?.id || '', 'Done');
                    setIsTaskDialogOpen(false);
                  }}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              ) : (
                <Button disabled className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completed
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssistantDashboard;
