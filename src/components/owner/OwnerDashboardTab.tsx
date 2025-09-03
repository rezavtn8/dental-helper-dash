import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  UserCheck,
  FileText,
  CalendarDays,
  BarChart3,
  Target,
  AlertCircle,
  ArrowRight,
  Timer
} from 'lucide-react';
import { format, isToday, parseISO, startOfWeek, endOfWeek } from 'date-fns';

interface DashboardStats {
  activeAssistants: number;
  pendingRequests: number;
  completedTasksThisWeek: number;
  patientsThisMonth: number;
}

interface TaskCalendarData {
  todaysTasks: number;
  thisWeekTasks: number;
  overdueTasks: number;
  upcomingTasks: any[];
}

interface AnalyticsData {
  taskCompletionRate: number;
  averageTasksPerAssistant: number;
  weeklyTrend: number;
  totalActiveTasks: number;
}

interface CertificationAlert {
  assistant_name: string;
  certification_name: string;
  expiry_date: string;
  days_until_expiry: number;
}

interface OwnerDashboardTabProps {
  clinicId: string;
  onTabChange?: (tab: string) => void;
}

export default function OwnerDashboardTab({ clinicId, onTabChange }: OwnerDashboardTabProps) {
  const [stats, setStats] = useState<DashboardStats>({
    activeAssistants: 0,
    pendingRequests: 0,
    completedTasksThisWeek: 0,
    patientsThisMonth: 0
  });
  const [taskCalendarData, setTaskCalendarData] = useState<TaskCalendarData>({
    todaysTasks: 0,
    thisWeekTasks: 0,
    overdueTasks: 0,
    upcomingTasks: []
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    taskCompletionRate: 0,
    averageTasksPerAssistant: 0,
    weeklyTrend: 0,
    totalActiveTasks: 0
  });
  const [certificationAlerts, setCertificationAlerts] = useState<CertificationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (clinicId) {
      fetchDashboardData();
    }
  }, [clinicId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch active assistants
      const { data: assistants, error: assistantsError } = await supabase
        .from('users')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('role', 'assistant')
        .eq('is_active', true);

      if (assistantsError) throw assistantsError;

      // Fetch pending requests
      const { data: requests, error: requestsError } = await supabase
        .from('join_requests')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Fetch completed tasks this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: completedTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('status', 'completed')
        .gte('completed_at', weekStart.toISOString());

      if (tasksError) throw tasksError;

      // Fetch patients this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: patientLogs, error: patientsError } = await supabase
        .from('patient_logs')
        .select('patient_count')
        .eq('clinic_id', clinicId)
        .gte('date', monthStart.toISOString().split('T')[0]);

      if (patientsError) throw patientsError;

      const totalPatients = patientLogs?.reduce((sum, log) => sum + (log.patient_count || 0), 0) || 0;

      // Fetch all tasks for calendar and analytics
      const { data: allTasks, error: allTasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', clinicId);

      if (allTasksError) throw allTasksError;

      // Process task calendar data
      const today = new Date();
      const weekStartDate = startOfWeek(today);
      const weekEndDate = endOfWeek(today);

      const todaysTasks = allTasks?.filter(task => {
        const taskDate = task.custom_due_date ? parseISO(task.custom_due_date) : 
                        task.created_at ? parseISO(task.created_at) : new Date();
        return isToday(taskDate);
      }).length || 0;

      const thisWeekTasks = allTasks?.filter(task => {
        const taskDate = task.custom_due_date ? parseISO(task.custom_due_date) : 
                        task.created_at ? parseISO(task.created_at) : new Date();
        return taskDate >= weekStartDate && taskDate <= weekEndDate;
      }).length || 0;

      const overdueTasks = allTasks?.filter(task => {
        if (task.status === 'completed') return false;
        const taskDate = task.custom_due_date ? parseISO(task.custom_due_date) : 
                        task.created_at ? parseISO(task.created_at) : new Date();
        return taskDate < today;
      }).length || 0;

      const upcomingTasks = allTasks?.filter(task => {
        if (task.status === 'completed') return false;
        const taskDate = task.custom_due_date ? parseISO(task.custom_due_date) : 
                        task.created_at ? parseISO(task.created_at) : new Date();
        return taskDate > today;
      }).slice(0, 3) || [];

      // Process analytics data
      const totalTasks = allTasks?.length || 0;
      const completedTasksCount = allTasks?.filter(task => task.status === 'completed').length || 0;
      const activeTasks = allTasks?.filter(task => task.status !== 'completed').length || 0;
      
      const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
      const averageTasksPerAssistant = (assistants?.length || 0) > 0 ? 
        Math.round(totalTasks / (assistants?.length || 1)) : 0;

      // Calculate weekly trend (comparing this week vs last week completed tasks)
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      
      const lastWeekCompleted = allTasks?.filter(task => 
        task.status === 'completed' && 
        task.completed_at &&
        parseISO(task.completed_at) >= lastWeekStart && 
        parseISO(task.completed_at) < weekStart
      ).length || 0;

      const thisWeekCompleted = completedTasks?.length || 0;
      const weeklyTrend = lastWeekCompleted > 0 ? 
        Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100) : 0;

      // Skip certification alerts for now due to query complexity
      const alerts: CertificationAlert[] = [];

      setStats({
        activeAssistants: assistants?.length || 0,
        pendingRequests: requests?.length || 0,
        completedTasksThisWeek: thisWeekCompleted,
        patientsThisMonth: totalPatients
      });

      setTaskCalendarData({
        todaysTasks,
        thisWeekTasks,
        overdueTasks,
        upcomingTasks
      });

      setAnalyticsData({
        taskCompletionRate,
        averageTasksPerAssistant,
        weeklyTrend,
        totalActiveTasks: activeTasks
      });

      setCertificationAlerts(alerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Assistants',
      value: stats.activeAssistants,
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Tasks Completed (This Week)',
      value: stats.completedTasksThisWeek,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Patients Assisted (This Month)',
      value: stats.patientsThisMonth,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Certification Alerts */}
      {certificationAlerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="font-medium mb-2">Certification Expiry Alerts</div>
            <div className="space-y-1">
              {certificationAlerts.map((alert, index) => (
                <div key={index} className="text-sm">
                  <strong>{alert.assistant_name}</strong>'s {alert.certification_name} expires in{' '}
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    {alert.days_until_expiry} days
                  </Badge>
                  {' '}({new Date(alert.expiry_date).toLocaleDateString()})
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingRequests > 0 && (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  if (onTabChange) {
                    onTabChange('team');
                  }
                }}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Approve {stats.pendingRequests} Pending Request{stats.pendingRequests !== 1 ? 's' : ''}
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                if (onTabChange) {
                  onTabChange('tasks');
                }
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Review Tasks
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                if (onTabChange) {
                  onTabChange('schedule');
                }
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Manage Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from your clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Tasks completed this week</span>
                <Badge variant="secondary">{stats.completedTasksThisWeek}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Active team members</span>
                <Badge variant="secondary">{stats.activeAssistants}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Patients assisted this month</span>
                <Badge variant="secondary">{stats.patientsThisMonth}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Calendar & Analytics - Featured Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Calendar Card - Expanded */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-600" />
                Task Calendar Overview
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onTabChange?.('task-calendar')}
              >
                View Full Calendar <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
            <CardDescription>
              Today's schedule, overdue tasks, and weekly overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Today's Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{taskCalendarData.todaysTasks}</div>
                <div className="text-sm text-blue-700 font-medium">Today's Tasks</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(), 'MMM d')}
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{taskCalendarData.overdueTasks}</div>
                <div className="text-sm text-orange-700 font-medium">Overdue</div>
                <div className="text-xs text-muted-foreground mt-1">Needs attention</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{taskCalendarData.thisWeekTasks}</div>
                <div className="text-sm text-green-700 font-medium">This Week</div>
                <div className="text-xs text-muted-foreground mt-1">Total scheduled</div>
              </div>
            </div>
            
            {/* Upcoming Tasks */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                Upcoming Tasks
              </h4>
              {taskCalendarData.upcomingTasks.length > 0 ? (
                <div className="space-y-2">
                  {taskCalendarData.upcomingTasks.slice(0, 3).map((task, index) => (
                    <div key={task.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                      <div>
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.custom_due_date ? format(parseISO(task.custom_due_date), 'MMM d, h:mm a') : 'No due date'}
                        </div>
                      </div>
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {task.priority || 'medium'}
                      </Badge>
                    </div>
                  ))}
                  {taskCalendarData.upcomingTasks.length > 3 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      +{taskCalendarData.upcomingTasks.length - 3} more tasks
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No upcoming tasks scheduled
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Card - Expanded */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Performance Analytics
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onTabChange?.('analytics')}
              >
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
            <CardDescription>
              Team performance insights and productivity trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600">{analyticsData.taskCompletionRate}%</div>
                <div className="text-sm text-emerald-700 font-medium">Completion Rate</div>
                <div className="text-xs text-muted-foreground mt-1">Overall performance</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{analyticsData.averageTasksPerAssistant}</div>
                <div className="text-sm text-blue-700 font-medium">Avg per Assistant</div>
                <div className="text-xs text-muted-foreground mt-1">Task distribution</div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Performance Indicators
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium text-sm">Weekly Trend</div>
                      <div className="text-xs text-muted-foreground">vs. last week</div>
                    </div>
                  </div>
                  <Badge variant={analyticsData.weeklyTrend >= 0 ? "default" : "destructive"} className="text-sm">
                    {analyticsData.weeklyTrend >= 0 ? '+' : ''}{analyticsData.weeklyTrend}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Active Tasks</div>
                      <div className="text-xs text-muted-foreground">Currently in progress</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {analyticsData.totalActiveTasks}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium text-sm">Team Productivity</div>
                      <div className="text-xs text-muted-foreground">Tasks completed this week</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {stats.completedTasksThisWeek}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}