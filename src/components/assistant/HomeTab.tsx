import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Award, Calendar, TrendingUp, Users, Target, Sparkles, ChevronRight, Building, PlayCircle, RotateCcw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TaskStatus, isCompleted } from '@/lib/taskStatus';
import { getPriorityStyles, getTasksForDate } from '@/lib/taskUtils';
import { Task } from '@/types/task';
import PatientCounter from './PatientCounter';

interface HomeTabProps {
  tasks: Task[];
  patientCount: number;
  onPatientCountUpdate: (count: number) => void;
  onTabChange?: (tab: string) => void;
  onTaskUpdate?: () => void;
  updateTask?: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
}

export default function HomeTab({ tasks, patientCount, onPatientCountUpdate, onTabChange, onTaskUpdate, updateTask }: HomeTabProps) {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Show connect to clinic message if no clinic access
  if (!userProfile?.clinic_id) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect to a Clinic</h3>
            <p className="text-muted-foreground mb-4">
              To see your tasks, patient counts, and clinic information, you need to join a clinic first.
            </p>
            <Button onClick={() => navigate('/join')} className="mb-2">
              Join a Clinic
            </Button>
            <Button variant="outline" onClick={() => navigate('/hub')}>
              Go to Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);

  // Set current date to Tuesday, Sep 9, 2025 as requested
  const currentDate = new Date(2025, 8, 9); // Month is 0-indexed, so 8 = September

  // Filter today's tasks
  const todaysTasks = useMemo(() => {
    const today = currentDate.toISOString().split('T')[0];
    console.log('📅 Filtering today\'s tasks for:', today, {
      totalTasks: tasks.length,
      userId: user?.id
    });
    
    // Use the proper getTasksForDate function to get tasks for today
    const tasksForToday = getTasksForDate(tasks, currentDate);
    
    // Filter to show only unassigned tasks or tasks assigned to current user
    const filtered = tasksForToday.filter(task => {
      const isRelevant = !task.assigned_to || task.assigned_to === user?.id;
      return isRelevant;
    });
    
    console.log('📅 Today\'s tasks filtered:', {
      filteredCount: filtered.length,
      assignedToMe: filtered.filter(t => t.assigned_to === user?.id).length,
      unassigned: filtered.filter(t => !t.assigned_to).length,
      recurring: filtered.filter(t => t.recurrence && t.recurrence !== 'none').length,
      withDueType: filtered.filter(t => t['due-type'] && t['due-type'] !== 'none').length
    });
    
    return filtered;
  }, [tasks, user?.id, currentDate]);

  // Task action handlers
  const claimTask = async (taskId: string) => {
    try {
      console.log('🎯 Claiming task:', taskId);
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          assigned_to: user?.id,
          claimed_by: user?.id // Track that this user claimed the task
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      console.log('✅ Task claimed successfully:', dbTaskId);
      onTaskUpdate?.();
      toast.success('Task claimed successfully');
    } catch (error) {
      console.error('❌ Error claiming task:', error);
      toast.error('Failed to claim task');
    }
  };

  const startTask = async (taskId: string) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'in-progress' as TaskStatus })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      toast.success('Task started');
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start task');
    }
  };

  const unstartTask = async (taskId: string) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'pending' as TaskStatus })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      toast.success('Task unmarked as started');
    } catch (error) {
      console.error('Error unmarking task:', error);
      toast.error('Failed to unmark task');
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed' as TaskStatus,
          completed_at: new Date().toISOString(),
          completed_by: user?.id
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      toast.success('Task completed!');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const undoComplete = async (taskId: string, task: Task) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      // Determine previous status
      const previousStatus = task.status === 'completed' ? 'in-progress' : 'pending';
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: previousStatus as TaskStatus,
          completed_at: null,
          completed_by: null
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      toast.success('Task completion undone');
    } catch (error) {
      console.error('Error undoing task:', error);
      toast.error('Failed to undo task');
    }
  };

  const putBackTask = async (taskId: string) => {
    try {
      // Handle recurring task instances - use parent ID for database operations
      const dbTaskId = taskId.includes('_') ? taskId.split('_')[0] : taskId;
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          assigned_to: null,
          claimed_by: null,
          status: 'pending' as TaskStatus
        })
        .eq('id', dbTaskId);

      if (error) throw error;
      onTaskUpdate?.();
      toast.success('Task put back');
    } catch (error) {
      console.error('Error putting back task:', error);
      toast.error('Failed to put back task');
    }
  };

  const renderTaskButtons = (task: Task) => {
    const isAssignedToMe = task.assigned_to === user?.id;
    const isUnassigned = !task.assigned_to;
    const isClaimedByMe = task.claimed_by === user?.id;
    const isCompleted = task.status === 'completed';
    const isStarted = task.status === 'in-progress';

    if (isCompleted) {
      return (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => undoComplete(task.id, task)}
          className="text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Undo
        </Button>
      );
    }

    if (isUnassigned) {
      return (
        <Button 
          size="sm" 
          onClick={() => claimTask(task.id)}
          className="text-xs"
        >
          <Target className="w-3 h-3 mr-1" />
          Claim
        </Button>
      );
    }

    if (isAssignedToMe) {
      if (isStarted) {
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              disabled
              className="text-xs"
            >
              <PlayCircle className="w-3 h-3 mr-1" />
              Started
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => unstartTask(task.id)}
              className="text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Unstart
            </Button>
            <Button 
              size="sm" 
              onClick={() => completeTask(task.id)}
              className="text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Done
            </Button>
          </div>
        );
      } else {
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => startTask(task.id)}
              className="text-xs"
            >
              <PlayCircle className="w-3 h-3 mr-1" />
              Start
            </Button>
            <Button 
              size="sm" 
              onClick={() => completeTask(task.id)}
              className="text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Done
            </Button>
            {isClaimedByMe && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => putBackTask(task.id)}
                className="text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Put Back
              </Button>
            )}
          </div>
        );
      }
    }

    return null;
  };
  
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = task['due-date'] || task.custom_due_date;
    if (!dueDate) return false;
    try {
      const taskDueDate = new Date(dueDate);
      return !isNaN(taskDueDate.getTime()) && taskDueDate < new Date();
    } catch (error) {
      return false;
    }
  }).length;

  const quickStats = [
    {
      title: "Pending",
      value: pendingTasks,
      icon: Clock,
      color: "from-blue-500 to-indigo-600", 
      bgColor: "bg-blue-50",
      metric: "tasks"
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: Target,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      metric: "done"
    },
    {
      title: "Overdue",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "from-red-400 to-rose-500",
      bgColor: "bg-red-50",
      metric: "overdue"
    }
  ];

  const quickActions = [
    {
      title: "Schedule",
      description: "View your upcoming shifts and schedule for the week",
      icon: Calendar,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      action: "schedule"
    },
    {
      title: "Certifications", 
      description: "Manage your professional certifications and track expiry dates",
      icon: Award,
      color: "from-blue-500 to-indigo-600", 
      bgColor: "bg-blue-50",
      action: "certifications"
    },
    {
      title: "Growth Tracking",
      description: "Track your progress, feedback, and professional milestones",
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      action: "growth"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header with Patient Counter */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900 mb-2">
                Welcome to Your Dashboard
              </h1>
              <p className="text-blue-700">
                Here's your daily overview and quick access to key features.
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </div>

        {/* Compact Patient Counter */}
        <PatientCounter 
          patientCount={patientCount} 
          onPatientCountUpdate={onPatientCountUpdate} 
        />
      </div>

      {/* Interactive Wheel-Style Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const isHovered = hoveredStat === index;
          return (
            <Card 
              key={index} 
              className={`relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                isHovered ? 'shadow-xl' : 'hover:shadow-lg'
              }`}
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <CardContent className="p-0">
                {/* Animated Background Wheel */}
                <div className={`absolute inset-0 ${stat.bgColor} transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-50'}`} />
                
                {/* Rotating Border Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-lg opacity-20 transition-all duration-700 ${
                  isHovered ? 'animate-pulse opacity-40' : ''
                }`} />
                
                {/* Content */}
                <div className="relative p-4 z-10">
                  <div className="flex items-center space-x-3">
                    {/* Rotating Icon Wheel */}
                    <div className={`relative w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg transform transition-all duration-500 ${
                      isHovered ? 'rotate-180 scale-110' : ''
                    }`}>
                      {/* Inner rotating circle */}
                      <div className={`absolute inset-1 rounded-full bg-white/20 transition-all duration-700 ${
                        isHovered ? 'rotate-[-180deg]' : ''
                      }`} />
                      <Icon className={`w-5 h-5 text-white z-10 transition-all duration-500 ${
                        isHovered ? 'scale-125' : ''
                      }`} />
                    </div>
                    
                    <div>
                      <div className={`text-xl font-bold transition-all duration-300 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent ${
                        isHovered ? 'scale-110' : ''
                      }`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {stat.title}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress ring effect */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transition-all duration-500 ${
                    isHovered ? 'h-2' : ''
                  }`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <span>Today's Tasks</span>
              <Badge variant="secondary" className="ml-2">
                {todaysTasks.length} tasks
              </Badge>
            </div>
            {onTabChange && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onTabChange('tasks')}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Tasks scheduled for Tuesday, September 9, 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysTasks.slice(0, 4).map((task) => {
              const priorityStyles = getPriorityStyles(task.priority);
              const isAssignedToMe = task.assigned_to === user?.id;
              const isUnassigned = !task.assigned_to;
              const isCompleted = task.status === 'completed';
              const isStarted = task.status === 'in-progress';
              
              return (
                <div key={task.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          isCompleted ? 'bg-green-500' : 
                          isStarted ? 'bg-blue-500' : 
                          isUnassigned ? 'bg-gray-400' : 'bg-orange-400'
                        }`} />
                        <h4 className="font-medium text-slate-900 truncate">{task.title}</h4>
                        <Badge variant="outline" className={`text-xs ${priorityStyles}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.category || 'General'}
                        </span>
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {isStarted && !isCompleted && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            <PlayCircle className="w-3 h-3 mr-1" />
                            Started
                          </Badge>
                        )}
                        {isUnassigned && (
                          <Badge variant="outline" className="text-xs">
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {renderTaskButtons(task)}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {todaysTasks.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No tasks for today</p>
                <p className="text-sm">All caught up for Tuesday, September 9th!</p>
              </div>
            )}
            
            {todaysTasks.length > 4 && (
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onTabChange && onTabChange('tasks')}
                  className="text-xs"
                >
                  View {todaysTasks.length - 4} more tasks
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Quick Actions Wheel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const isHovered = hoveredAction === index;
          return (
            <Card 
              key={index} 
              className={`group relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                isHovered ? 'shadow-xl' : 'hover:shadow-lg'
              }`}
              onMouseEnter={() => setHoveredAction(index)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <CardContent className="p-0 h-full">
                {/* Animated Background */}
                <div className={`absolute inset-0 ${action.bgColor} transition-all duration-500 ${
                  isHovered ? 'opacity-100' : 'opacity-60'
                }`} />
                
                {/* Rotating Border Wheel */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${action.color} rounded-lg opacity-30 transition-all duration-700 ${
                  isHovered ? 'animate-pulse opacity-60 scale-105' : ''
                }`} />
                
                {/* Content */}
                <div className="relative p-4 h-full flex flex-col justify-between z-10">
                  {/* Icon and Title */}
                  <div>
                    <div className={`flex items-center mb-3 transition-all duration-500 ${
                      isHovered ? 'transform translate-y-[-2px]' : ''
                    }`}>
                      {/* Rotating Icon Wheel */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mr-3 shadow-lg transform transition-all duration-500 ${
                        isHovered ? 'rotate-180 scale-110' : ''
                      }`}>
                        <Icon className={`w-5 h-5 text-white transition-all duration-500 ${
                          isHovered ? 'scale-125' : ''
                        }`} />
                      </div>
                      
                      <h3 className={`text-lg font-bold transition-all duration-300 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`}>
                        {action.title}
                      </h3>
                    </div>
                    
                    <p className={`text-slate-600 text-sm mb-3 transition-all duration-300 ${
                      isHovered ? 'text-slate-700' : ''
                    }`}>
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Interactive Button */}
                  <Button 
                    className={`group relative overflow-hidden w-full bg-gradient-to-r ${action.color} text-white border-0 transition-all duration-300 ${
                      isHovered ? 'shadow-lg transform scale-105' : ''
                    }`}
                    size="sm"
                    onClick={() => {
                      if (onTabChange) {
                        onTabChange(action.action === 'growth' ? 'stats' : action.action);
                      }
                    }}
                  >
                    {/* Button background wheel effect */}
                    <div className={`absolute inset-0 bg-white/20 transition-all duration-500 ${
                      isHovered ? 'scale-110 rotate-180' : 'scale-100'
                    }`} />
                    
                    <span className="relative z-10 flex items-center justify-center">
                      View {action.title}
                      <ChevronRight className={`w-4 h-4 ml-2 transition-all duration-300 ${
                        isHovered ? 'transform translate-x-1' : ''
                      }`} />
                    </span>
                  </Button>
                </div>
                
                {/* Bottom progress wheel effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${action.color} transition-all duration-500 ${
                  isHovered ? 'h-2' : ''
                }`} />
                
                {/* Sparkle effects on hover */}
                {isHovered && (
                  <>
                    <Sparkles className="absolute top-2 right-2 w-3 h-3 text-yellow-400 animate-pulse" />
                    <Sparkles className="absolute bottom-2 left-2 w-2 h-2 text-yellow-300 animate-pulse delay-300" />
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}