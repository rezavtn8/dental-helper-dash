import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Settings,
  Stethoscope,
  CheckSquare,
  MessageSquare,
  Target,
  TrendingUp,
  Award
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
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    if (session && user && userProfile?.role === 'assistant') {
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

  const myTasks = tasks.filter(task => task.assigned_to === user?.id);
  const availableTasks = tasks.filter(task => !task.assigned_to);
  const completedTasks = myTasks.filter(task => task.status === 'Done');
  const pendingTasks = myTasks.filter(task => task.status !== 'Done');
  const overdueTasks = myTasks.filter(task => 
    task.status !== 'Done' && task['due-type'] === 'Before Opening'
  );

  const completionRate = myTasks.length > 0 ? Math.round((completedTasks.length / myTasks.length) * 100) : 0;

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
      case 'labs': return '🧪';
      case 'patient care': return '🏥';
      case 'admin': return '📋';
      default: return '📌';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your tasks...</p>
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">ClinicFlow</span>
                <Badge variant="outline" className="ml-2">Assistant</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userProfile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {userProfile?.name}
                </span>
              </div>
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
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-clinical-sky to-clinical-sky/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-clinical-sky-foreground">My Tasks</CardTitle>
              <Target className="h-5 w-5 text-clinical-sky-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-clinical-sky-foreground mb-2">{myTasks.length}</div>
              <div className="text-xs text-clinical-sky-foreground/80">
                {pendingTasks.length} pending
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-clinical-mint to-clinical-mint/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-clinical-mint-foreground">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-clinical-mint-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-clinical-mint-foreground mb-2">{completedTasks.length}</div>
              <div className="text-xs text-clinical-mint-foreground/80">
                {completionRate}% completion rate
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{availableTasks.length}</div>
              <p className="text-xs text-muted-foreground">Tasks to claim</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className={`h-5 w-5 ${completionRate >= 80 ? 'text-green-600' : completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {completionRate >= 80 ? 'Excellent!' : completionRate >= 60 ? 'Good work' : 'Keep going!'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Assigned Tasks */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Tasks</h2>
              <Badge variant="outline">{myTasks.length} total</Badge>
            </div>

            <div className="space-y-4">
              {myTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No tasks assigned yet.<br />Check available tasks to claim some!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                myTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                      task.status === 'Done' ? 'opacity-75' : ''
                    }`}
                    onClick={() => {
                      setSelectedTask(task);
                      setTaskNotes('');
                      setIsTaskDialogOpen(true);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getCategoryIcon(task.category)}</span>
                            <CardTitle className="text-base">{task.title}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {task.description}
                          </CardDescription>
                        </div>
                        <Badge variant={task.status === 'Done' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {task['due-type']}
                          </span>
                          {task.checklist && task.checklist.length > 0 && (
                            <span className="flex items-center">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                            </span>
                          )}
                        </div>
                        {task.status !== 'Done' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'Done');
                            }}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Available Tasks */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Available Tasks</h2>
              <Badge variant="outline">{availableTasks.length} available</Badge>
            </div>

            <div className="space-y-4">
              {availableTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Award className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No available tasks right now.<br />Great job staying on top of everything!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                availableTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-dashed"
                    onClick={() => {
                      setSelectedTask(task);
                      setTaskNotes('');
                      setIsTaskDialogOpen(true);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getCategoryIcon(task.category)}</span>
                            <CardTitle className="text-base">{task.title}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {task.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {task['due-type']}
                          </span>
                          {task.checklist && task.checklist.length > 0 && (
                            <span className="flex items-center">
                              <CheckSquare className="h-3 w-3 mr-1" />
                              {task.checklist.length} steps
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            claimTask(task.id);
                          }}
                        >
                          Claim Task
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{selectedTask ? getCategoryIcon(selectedTask.category) : '📌'}</span>
              <span>{selectedTask?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedTask?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6">
              {/* Task Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge 
                    variant="outline" 
                    className={`mt-1 ${getPriorityColor(selectedTask.priority)}`}
                  >
                    {selectedTask.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Due Time</Label>
                  <p className="flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedTask['due-type']}
                  </p>
                </div>
              </div>

              {/* Owner Notes */}
              {selectedTask.owner_notes && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="text-sm font-medium text-blue-900 flex items-center mb-2">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Instructions & Tips
                  </Label>
                  <p className="text-sm text-blue-800">{selectedTask.owner_notes}</p>
                </div>
              )}

              {/* Checklist */}
              {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Task Checklist</Label>
                  <div className="space-y-2">
                    {selectedTask.checklist.map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 rounded border">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) => {
                            const updatedChecklist = [...selectedTask.checklist!];
                            updatedChecklist[index] = { ...item, completed: checked as boolean };
                            updateChecklist(selectedTask.id, updatedChecklist);
                            setSelectedTask({ ...selectedTask, checklist: updatedChecklist });
                          }}
                          disabled={selectedTask.assigned_to !== user?.id}
                        />
                        <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4 border-t">
                {selectedTask.assigned_to === user?.id ? (
                  selectedTask.status !== 'Done' ? (
                    <Button 
                      onClick={() => {
                        updateTaskStatus(selectedTask.id, 'Done');
                        setIsTaskDialogOpen(false);
                      }}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        updateTaskStatus(selectedTask.id, 'To Do');
                        setIsTaskDialogOpen(false);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Mark Incomplete
                    </Button>
                  )
                ) : (
                  <Button 
                    onClick={() => {
                      claimTask(selectedTask.id);
                      setIsTaskDialogOpen(false);
                    }}
                    className="flex-1"
                  >
                    Claim This Task
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setIsTaskDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssistantDashboard;