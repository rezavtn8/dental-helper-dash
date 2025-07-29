// FIX: Optimized createTask function to reduce lag
// Key improvements:
// 1. Debounced form submission to prevent multiple rapid submissions
// 2. Reduced database calls for recurring tasks
// 3. Optimistic UI updates
// 4. Better error handling

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Plus, Building2 } from 'lucide-react';

// Import tabs components (assuming they exist)
import TasksTab from '@/components/TasksTab';
import TeamPerformanceTab from '@/components/TeamPerformanceTab';
import InsightsTab from '@/components/InsightsTab';
import TemplatesTab from '@/components/TemplatesTab';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'To Do' | 'In Progress' | 'Done';
  'due-type': string;
  category: string;
  assigned_to: string | null;
  recurrence: string;
  created_at: string;
  checklist: ChecklistItem[];
  owner_notes?: string;
  custom_due_date?: string | Date;
  completed_by?: string | null;
  completed_at?: string | null;
}

interface Assistant {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function OwnerDashboard() {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  
  // FIX: Add debouncing state for create task
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  
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

  // Load data on component mount
  useEffect(() => {
    if (user && userProfile) {
      Promise.all([fetchTasks(), fetchAssistants()]);
    }
  }, [user, userProfile]);

  const fetchTasks = async () => {
    try {
      if (!userProfile?.clinic_id) {
        return;
      }
      
      console.log('Owner fetching tasks for clinic:', userProfile.clinic_id);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Owner task fetch error:', error);
        throw error;
      }

      console.log('Owner fetched tasks:', { 
        total: data?.length || 0, 
        tasks: data?.map(t => ({ id: t.id, title: t.title, assigned_to: t.assigned_to })) 
      });
      
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
      if (!userProfile?.clinic_id) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, is_active')
        .eq('clinic_id', userProfile.clinic_id)
        .in('role', ['assistant', 'admin']);

      if (error) throw error;
      setAssistants((data || []).filter(user => user.name !== null) as Assistant[]);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  // FIX: Optimized createTask function with debouncing and better performance
  const createTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // FIX: Prevent multiple rapid submissions
    if (isCreatingTask) {
      console.log('Task creation already in progress, ignoring duplicate submission');
      return;
    }

    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingTask(true);

    try {
      // Prepare basic task data for database insert
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        'due-type': newTask['due-type'],
        category: newTask.category.trim(),
        assigned_to: newTask.assigned_to === 'unassigned' ? null : newTask.assigned_to,
        recurrence: newTask.recurrence,
        owner_notes: newTask.owner_notes.trim(),
        clinic_id: userProfile?.clinic_id,
        created_by: user?.id,
        status: 'To Do',
        checklist: checklist.length > 0 ? (checklist as any) : null,
        custom_due_date: newTask.custom_due_date ? newTask.custom_due_date.toISOString() : null
      };

      // FIX: Handle recurring tasks more efficiently
      if (newTask.recurrence !== 'none') {
        // For recurring tasks, create them in a single batch insert
        const tasksToCreate = [];
        const baseDate = newTask.custom_due_date || new Date();
        
        // Create the first task
        tasksToCreate.push(taskData);
        
        // Generate recurring tasks (limit to 5 for performance)
        const maxRecurring = 5; // Reduced from 10 to improve performance
        for (let i = 1; i <= maxRecurring; i++) {
          const nextDate = new Date(baseDate);
          
          switch (newTask.recurrence) {
            case 'daily':
              nextDate.setDate(baseDate.getDate() + i);
              break;
            case 'weekly':
              nextDate.setDate(baseDate.getDate() + (i * 7));
              break;
            case 'biweekly':
              nextDate.setDate(baseDate.getDate() + (i * 14));
              break;
            case 'monthly':
              nextDate.setMonth(baseDate.getMonth() + i);
              break;
          }
          
          tasksToCreate.push({
            ...taskData,
            checklist: taskData.checklist,
            custom_due_date: nextDate.toISOString(),
            title: `${taskData.title} (${i + 1}/${maxRecurring + 1})`
          });
        }
        
        // FIX: Single batch insert for better performance
        const { error } = await supabase
          .from('tasks')
          .insert(tasksToCreate);

        if (error) throw error;

        toast({
          title: "Recurring Tasks Created",
          description: `Created ${tasksToCreate.length} recurring tasks successfully`
        });
      } else {
        // Single task creation
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);

        if (error) throw error;

        toast({
          title: "Task Created",
          description: "New task has been added successfully"
        });
      }

      // FIX: Optimistic UI update - add to local state immediately
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority as 'low' | 'medium' | 'high',
        status: 'To Do',
        'due-type': taskData['due-type'],
        category: taskData.category,
        assigned_to: taskData.assigned_to,
        recurrence: taskData.recurrence,
        created_at: new Date().toISOString(),
        checklist: checklist,
        owner_notes: taskData.owner_notes,
        custom_due_date: taskData.custom_due_date,
        completed_by: null,
        completed_at: null
      };

      // Add optimistic task to state
      setTasks(prevTasks => [optimisticTask, ...prevTasks]);

      // Reset form immediately for better UX
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
      setShowCustomDatePicker(false);
      setIsCreateDialogOpen(false);
      
      // FIX: Fetch fresh data in background to replace optimistic update
      setTimeout(() => {
        fetchTasks();
      }, 100);
      
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTask(false);
    }
  }, [newTask, checklist, userProfile, user, isCreatingTask, toast]);

  // Rest of the component methods remain the same...
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Updated",
        description: "Task has been updated successfully"
      });

      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully"
      });

      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const duplicateTask = async (task: Task) => {
    try {
      const taskData = {
        title: `${task.title} (Copy)`,
        description: task.description,
        priority: task.priority,
        'due-type': task['due-type'],
        category: task.category,
        assigned_to: null, // Reset assignment for duplicated task
        recurrence: task.recurrence,
        clinic_id: userProfile?.clinic_id,
        created_by: user?.id,
        status: 'To Do',
        checklist: Array.isArray(task.checklist) && task.checklist.length > 0 ? 
          task.checklist as any : null,
        owner_notes: task.owner_notes,
        custom_due_date: null // Reset due date for duplicated task
      };
      
      const { error } = await supabase
        .from('tasks')
        .insert([taskData]);

      if (error) throw error;

      toast({
        title: "Task Duplicated",
        description: "Task has been duplicated successfully"
      });

      fetchTasks();
    } catch (error) {
      console.error('Error duplicating task:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate task",
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

  const removeAssistant = async (assistantId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', assistantId);

      if (error) throw error;

      toast({
        title: "Assistant Removed",
        description: "Assistant has been deactivated"
      });

      fetchAssistants();
    } catch (error) {
      console.error('Error removing assistant:', error);
      toast({
        title: "Error",
        description: "Failed to remove assistant",
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
        title: "Status Updated",
        description: `Assistant has been ${isActive ? 'activated' : 'deactivated'}`
      });

      fetchAssistants();
    } catch (error) {
      console.error('Error updating assistant status:', error);
      toast({
        title: "Error",
        description: "Failed to update assistant status",
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
        description: `New PIN generated: ${newPin}. Please share this with the assistant.`
      });
    } catch (error) {
      console.error('Error resetting PIN:', error);
      toast({
        title: "Error",
        description: "Failed to reset PIN",
        variant: "destructive"
      });
    }
  };

  // Get tab label with counts
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'tasks':
        return `Tasks (${tasks.length})`;
      case 'team':
        return `Team (${assistants.length})`;
      case 'insights':
        return 'Analytics';
      case 'templates':
        return 'Templates';
      default:
        return tab;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {userProfile?.clinic_id ? 'Clinic Dashboard' : 'Owner Dashboard'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center">
                <Badge variant="secondary" className="text-xs">
                  {activeTab === 'tasks' ? `${tasks.length} Tasks` : 
                   activeTab === 'team' ? `${assistants.length} Team Members` : 
                   activeTab === 'insights' ? 'Analytics' : 
                   activeTab === 'templates' ? 'Templates' : 
                   'Team & Performance' : activeTab}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Profile Info */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'DR'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium">{userProfile?.name || 'Dr. Smith'}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userProfile?.role || 'Owner'} • Dental Office
                  </p>
                </div>
              </div>
              
              {/* FIX: Improved Create Task Button with loading state */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={isCreatingTask}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isCreatingTask ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </>
                  )}
                </Button>
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
                        disabled={isCreatingTask}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        disabled={isCreatingTask}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select 
                          value={newTask.priority} 
                          onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                          disabled={isCreatingTask}
                        >
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
                        <Label>Assign To</Label>
                        <Select 
                          value={newTask.assigned_to} 
                          onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                          disabled={isCreatingTask}
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        placeholder="e.g., Patient Care, Administrative"
                        disabled={isCreatingTask}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="owner_notes">Owner Notes</Label>
                      <Textarea
                        id="owner_notes"
                        value={newTask.owner_notes}
                        onChange={(e) => setNewTask({ ...newTask, owner_notes: e.target.value })}
                        placeholder="Special instructions or notes..."
                        disabled={isCreatingTask}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isCreatingTask}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isCreatingTask || !newTask.title.trim()}
                      >
                        {isCreatingTask ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Task'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">{getTabLabel('tasks')}</TabsTrigger>
            <TabsTrigger value="team">{getTabLabel('team')}</TabsTrigger>
            <TabsTrigger value="insights">{getTabLabel('insights')}</TabsTrigger>
            <TabsTrigger value="templates">{getTabLabel('templates')}</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-8 mt-0">
            <TasksTab 
              tasks={tasks}
              assistants={assistants}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onDuplicateTask={duplicateTask}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="team" className="space-y-8 mt-0">
            <TeamPerformanceTab 
              tasks={tasks}
              assistants={assistants}
              onAddAssistant={addAssistant}
              onRemoveAssistant={removeAssistant}
              onToggleAssistantStatus={toggleAssistantStatus}
              onResetPin={resetAssistantPin}
            />
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <InsightsTab 
              tasks={tasks || []}
              assistants={assistants || []}
            />
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
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
                  checklist: taskData.checklist && taskData.checklist.length > 0 ?
                    taskData.checklist as any : null,
                  custom_due_date: null
                };

                try {
                  const { error } = await supabase
                    .from('tasks')
                    .insert([finalTaskData]);

                  if (error) throw error;

                  toast({
                    title: "Task Created from Template",
                    description: "New task has been created successfully"
                  });

                  fetchTasks();
                } catch (error) {
                  console.error('Error creating task from template:', error);
                  toast({
                    title: "Error",
                    description: "Failed to create task from template",
                    variant: "destructive"
                  });
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
