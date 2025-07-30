import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  UserPlus,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  LogOut
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  custom_due_date?: string;
  completed_by?: string | null;
  completed_at?: string | null;
  assigned_at?: string | null;
}

export default function AssistantDashboard() {
  const { user, userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user && userProfile) {
      fetchMyTasks();
      
      // Set up real-time subscription for task updates
      const subscription = supabase
        .channel('assistant-tasks')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'tasks',
            filter: `clinic_id=eq.${userProfile.clinic_id}`
          }, 
          () => {
            console.log('Task change detected, refreshing...');
            fetchMyTasks();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, userProfile]);

  const fetchMyTasks = async () => {
    try {
      if (!userProfile?.clinic_id || !user?.id) {
        console.log('Missing required data:', { clinic_id: userProfile?.clinic_id, user_id: user?.id });
        return;
      }
      
      console.log('Assistant fetching tasks...', { 
        assistant_id: user.id, 
        clinic_id: userProfile.clinic_id 
      });

      // FIX: Fetch ALL tasks in the clinic, then filter on frontend for better sync
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      // FIX: Filter to show assigned to this user OR unassigned tasks
      const filteredData = (data || []).filter(task => {
        const isAssignedToMe = task.assigned_to === user.id;
        const isUnassigned = task.assigned_to === null || task.assigned_to === undefined;
        return isAssignedToMe || isUnassigned;
      });

      console.log('Assistant task fetch results:', { 
        total_clinic_tasks: data?.length || 0,
        my_assigned_tasks: data?.filter(t => t.assigned_to === user.id).length || 0,
        unassigned_tasks: data?.filter(t => !t.assigned_to).length || 0,
        filtered_total: filteredData.length,
        tasks_shown: filteredData.map(t => ({ 
          id: t.id, 
          title: t.title, 
          assigned_to: t.assigned_to,
          status: t.status 
        }))
      });
      
      const transformedTasks = filteredData.map(task => ({
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
        completed_at: task.completed_at || null,
        assigned_at: (task as any).assigned_at || null
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
      console.log('Updating task status:', { taskId, status, userId: user?.id });
      
      const updateData: any = { status };

      // Track completion analytics 
      if (status === 'Done') {
        // Get the current Supabase auth user to ensure proper foreign key reference
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          updateData.completed_by = authUser.id;
          updateData.completed_at = new Date().toISOString();
        } else {
          // If no auth user, just update status without completion tracking
          console.log('No auth user found, updating status only');
        }
      } else if (status === 'To Do') {
        // Clear completion tracking when undoing
        updateData.completed_by = null;
        updateData.completed_at = null;
      }

      console.log('Update data:', updateData);

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Update successful:', data);

      toast({
        title: "Task Updated",
        description: `Task marked as ${status.toLowerCase()}`
      });

      // FIX: Refresh tasks to ensure sync
      await fetchMyTasks();
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const claimTask = async (taskId: string) => {
    try {
      const updateData: any = { 
        assigned_to: user?.id,
        owner_notes: 'picked_up_by_assistant' // Mark this task as picked up
      };

      // Try to add assignment timestamp if field exists
      try {
        updateData.assigned_at = new Date().toISOString();
      } catch (e) {
        // Field might not exist yet
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        // If assigned_at field doesn't exist, try without it
        if (error.message?.includes('assigned_at')) {
          const { error: retryError } = await supabase
            .from('tasks')
            .update({ 
              assigned_to: user?.id,
              owner_notes: 'picked_up_by_assistant'
            })
            .eq('id', taskId);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      toast({
        title: "Task Claimed",
        description: "Task has been assigned to you"
      });

      // FIX: Refresh tasks to ensure sync
      await fetchMyTasks();
    } catch (error) {
      console.error('Error claiming task:', error);
      toast({
        title: "Error",
        description: "Failed to claim task",
        variant: "destructive"
      });
    }
  };

  const putBackTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          assigned_to: null,
          status: 'To Do',
          owner_notes: null // Clear the pickup marker
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Put Back",
        description: "Task is now available for others to pick up"
      });

      // FIX: Refresh tasks to ensure sync
      await fetchMyTasks();
    } catch (error) {
      console.error('Error putting back task:', error);
      toast({
        title: "Error",
        description: "Failed to put back task",
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

  const toggleTaskExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'In Progress': return <Play className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Separate tasks by assignment status
  const myTasks = tasks.filter(task => task.assigned_to === user?.id);
  const availableTasks = tasks.filter(task => !task.assigned_to);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
 );  // ← FIXED: Added ) and ;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {userProfile?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Here are your tasks for today
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Assigned Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                My Tasks ({myTasks.length})
              </h2>
            </div>

            {myTasks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No tasks assigned to you</p>
                    <p className="text-sm mt-1">Check available tasks to pick up work</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.category || 'General'}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusIcon(task.status)}
                          {Array.isArray(task.checklist) && task.checklist.length > 0 && (
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTaskExpanded(task.id)}
                                >
                                  {expandedTasks.has(task.id) ? 
                                    <ChevronUp className="w-4 h-4" /> : 
                                    <ChevronDown className="w-4 h-4" />
                                  }
                                </Button>
                              </CollapsibleTrigger>
                            </Collapsible>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Checklist */}
                      {Array.isArray(task.checklist) && task.checklist.length > 0 && expandedTasks.has(task.id) && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Checklist:</h4>
                          <div className="space-y-2">
                            {task.checklist.map((item, index) => (
                              <div key={item.id || index} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={item.completed}
                                  onCheckedChange={(checked) => {
                                    const updatedChecklist = task.checklist.map((checkItem, i) =>
                                      i === index ? { ...checkItem, completed: !!checked } : checkItem
                                    );
                                    updateChecklist(task.id, updatedChecklist);
                                  }}
                                />
                                <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Owner Notes */}
                      {task.owner_notes && task.owner_notes !== 'picked_up_by_assistant' && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium text-sm mb-1 text-blue-900 dark:text-blue-100">
                            Owner Notes:
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {task.owner_notes}
                          </p>
                        </div>
                      )}

                      {/* Put Back Action */}
                      <Button 
                        size="sm" 
                        onClick={() => putBackTask(task.id)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Put Back
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Available Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Available Tasks ({availableTasks.length})
              </h2>
            </div>

            {availableTasks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No available tasks</p>
                    <p className="text-sm mt-1">All tasks have been assigned</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {availableTasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-gray-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.category || 'General'}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusIcon(task.status)}
                          {Array.isArray(task.checklist) && task.checklist.length > 0 && (
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTaskExpanded(task.id)}
                                >
                                  {expandedTasks.has(task.id) ? 
                                    <ChevronUp className="w-4 h-4" /> : 
                                    <ChevronDown className="w-4 h-4" />
                                  }
                                </Button>
                              </CollapsibleTrigger>
                            </Collapsible>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Checklist */}
                      {Array.isArray(task.checklist) && task.checklist.length > 0 && expandedTasks.has(task.id) && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Checklist:</h4>
                          <div className="space-y-2">
                            {task.checklist.map((item, index) => (
                              <div key={item.id || index} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={item.completed}
                                  onCheckedChange={(checked) => {
                                    const updatedChecklist = task.checklist.map((checkItem, i) =>
                                      i === index ? { ...checkItem, completed: !!checked } : checkItem
                                    );
                                    updateChecklist(task.id, updatedChecklist);
                                  }}
                                />
                                <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Claim Action */}
                      <Button 
                        size="sm" 
                        onClick={() => claimTask(task.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Claim Task
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
