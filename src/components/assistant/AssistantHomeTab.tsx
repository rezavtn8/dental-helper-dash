import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Award, Calendar, TrendingUp, Target, ChevronRight, Building, PlayCircle, RotateCcw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TaskStatus } from '@/lib/taskStatus';
import { getPriorityStyles, getTasksForDate } from '@/lib/taskUtils';
import { Task } from '@/types/task';
import PatientCounter from './PatientCounter';
import { useOptimizedTasks } from '@/hooks/useOptimizedTasks';

interface AssistantHomeTabProps {
  onViewAll?: () => void;
}

export default function AssistantHomeTab({ onViewAll }: AssistantHomeTabProps) {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { tasks, updateTask, refreshTasks } = useOptimizedTasks();
  const [patientCount, setPatientCount] = useState(0);

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
            <Button onClick={() => navigate('/join-clinic')}>
              Join a Clinic
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  
  // Set current date 
  const currentDate = new Date();

  // Filter today's tasks - include claimed tasks and show proper assignment logic
  const todaysTasks = useMemo(() => {
    // Get tasks for today
    const tasksForToday = getTasksForDate(tasks, currentDate);
    
    // Filter to show unassigned tasks, tasks assigned to me, or tasks claimed by me
    const filtered = tasksForToday.filter(task => {
      const isUnassigned = !task.assigned_to && !task.claimed_by;
      const isAssignedToMe = task.assigned_to === user?.id;
      const isClaimedByMe = task.claimed_by === user?.id;
      
      return isUnassigned || isAssignedToMe || isClaimedByMe;
    });
    
    return filtered;
  }, [tasks, user?.id, currentDate]);

  // Task action handlers with proper error handling
  const claimTask = async (taskId: string) => {
    if (!updateTask) {
      toast.error('Task update function not available');
      return;
    }
    
    const success = await updateTask(taskId, {
      assigned_to: user?.id,
      claimed_by: user?.id
    });
    
    if (success) {
      refreshTasks();
      toast.success('Task claimed successfully');
    }
  };

  const startTask = async (taskId: string) => {
    if (!updateTask) return;
    
    const success = await updateTask(taskId, {
      status: 'in-progress' as TaskStatus
    });
    
    if (success) {
      refreshTasks();
      toast.success('Task started');
    }
  };

  const completeTask = async (taskId: string) => {
    if (!updateTask) return;
    
    const success = await updateTask(taskId, {
      status: 'completed' as TaskStatus,
      completed_at: new Date().toISOString(),
      completed_by: user?.id
    });
    
    if (success) {
      refreshTasks();
      toast.success('Task completed!');
    }
  };

  // Undo task completion
  const undoTask = async (taskId: string) => {
    if (!updateTask) return;
    
    const success = await updateTask(taskId, {
      status: 'pending' as TaskStatus,
      completed_at: null,
      completed_by: null
    });
    
    if (success) {
      refreshTasks();
      toast.success('Task moved back to pending');
    }
  };

  const renderTaskButtons = (task: Task) => {
    const isAssignedToMe = task.assigned_to === user?.id || task.claimed_by === user?.id;
    const isUnassigned = !task.assigned_to && !task.claimed_by;
    const isCompleted = task.status === 'completed';
    const isStarted = task.status === 'in-progress';

    if (isCompleted) {
      return (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => undoTask(task.id)}
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
              disabled
              variant="secondary"
              className="text-xs cursor-not-allowed"
            >
              <PlayCircle className="w-3 h-3 mr-1" />
              Started
            </Button>
            <Button 
              size="sm" 
              onClick={() => completeTask(task.id)}
              className="text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete
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
              Complete
            </Button>
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
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: Target,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Overdue",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "from-red-400 to-rose-500",
      bgColor: "bg-red-50",
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
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

        {/* Patient Counter */}
        <PatientCounter 
          patientCount={patientCount} 
          onPatientCountUpdate={setPatientCount} 
        />
      </div>

      {/* Quick Stats */}
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
                <div className={`absolute inset-0 ${stat.bgColor} transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-50'}`} />
                
                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-lg opacity-20 transition-all duration-700 ${
                  isHovered ? 'animate-pulse opacity-40' : ''
                }`} />
                
                <div className="relative p-4 z-10">
                  <div className="flex items-center space-x-3">
                    <div className={`relative w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg transform transition-all duration-500 ${
                      isHovered ? 'rotate-180 scale-110' : ''
                    }`}>
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewAll}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.priority && (
                        <Badge variant="secondary">
                          {task.priority}
                        </Badge>
                      )}
                      <Badge 
                        variant={task.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {renderTaskButtons(task)}
                </div>
              </div>
            ))}
            {todaysTasks.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No tasks for today! Great job staying on top of things.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}