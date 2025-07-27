import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Trophy,
  Download,
  Calendar,
  Activity,
  Target,
  Stethoscope,
  RotateCcw,
  ClipboardList,
  AlertCircle,
  Zap
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
  checklist?: any[];
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

interface InsightsTabProps {
  tasks: Task[];
  assistants: Assistant[];
}

const InsightsTab: React.FC<InsightsTabProps> = ({ tasks, assistants }) => {
  console.log("InsightsTab rendering with:", { tasks: tasks?.length, assistants: assistants?.length });
  
  // Handle loading state
  if (!tasks || !assistants) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate real productivity metrics
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Safely filter and process tasks
  const todayTasks = tasks.filter(task => {
    if (!task.created_at) return false;
    const taskDate = new Date(task.created_at);
    if (isNaN(taskDate.getTime())) return false; // Check for invalid date
    if (task.completed_at) {
      const completedDate = new Date(task.completed_at).toISOString().split('T')[0];
      return completedDate === todayStr;
    }
    const createdDate = new Date(task.created_at).toISOString().split('T')[0];
    return createdDate === todayStr;
  });
  
  const completedTasks = tasks.filter(task => task.status === 'Done');
  const totalTasksToday = todayTasks.length;
  const completedTasksToday = tasks.filter(task => {
    if (task.completed_at) {
      const completedDate = new Date(task.completed_at);
      if (isNaN(completedDate.getTime())) return false;
      return completedDate.toISOString().split('T')[0] === todayStr && task.status === 'Done';
    }
    return false;
  }).length;
  
  const completionRate = totalTasksToday > 0 ? (completedTasksToday / totalTasksToday) * 100 : 0;
  const unassignedTasks = tasks.filter(task => !task.assigned_to && task.status !== 'Done').length;

  // Real weekly completion data
  const weeklyCompletionData = (() => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return weekDays.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      const dayStr = dayDate.toISOString().split('T')[0];
      
      const dayCompletedTasks = tasks.filter(task => {
        if (task.completed_at && task.status === 'Done') {
          const completedDate = new Date(task.completed_at);
          if (isNaN(completedDate.getTime())) return false;
          return completedDate.toISOString().split('T')[0] === dayStr;
        }
        return false;
      });
      
      const dayIncompleteTasks = tasks.filter(task => {
        if (!task.created_at) return false;
        const createdDate = new Date(task.created_at);
        if (isNaN(createdDate.getTime())) return false;
        return createdDate.toISOString().split('T')[0] === dayStr && task.status !== 'Done';
      });
      
      return {
        day,
        completed: dayCompletedTasks.length,
        incomplete: dayIncompleteTasks.length
      };
    });
  })();

  // Real assistant workload data
  const assistantWorkloadData = assistants.map(assistant => {
    const assignedTasks = tasks.filter(task => task.assigned_to === assistant.id);
    const completedTasks = assignedTasks.filter(task => task.status === 'Done');
    return {
      name: assistant.name.split(' ')[0],
      total: assignedTasks.length,
      completed: completedTasks.length,
      completion_rate: assignedTasks.length > 0 ? (completedTasks.length / assignedTasks.length) * 100 : 0
    };
  });

  // Real time-based completion data
  const timeOfDayData = (() => {
    const timeSlots = [
      { time: 'Before 9AM', start: 0, end: 9 },
      { time: '9AM-12PM', start: 9, end: 12 },
      { time: '12PM-3PM', start: 12, end: 15 },
      { time: '3PM-6PM', start: 15, end: 18 },
      { time: 'After 6PM', start: 18, end: 24 }
    ];

    return timeSlots.map(slot => {
      const completed = tasks.filter(task => {
        if (task.completed_at && task.status === 'Done') {
          const completedTime = new Date(task.completed_at);
          if (isNaN(completedTime.getTime())) return false;
          const completedHour = completedTime.getHours();
          return completedHour >= slot.start && completedHour < slot.end;
        }
        return false;
      }).length;

      const incomplete = tasks.filter(task => {
        if (task.status !== 'Done' && task.created_at) {
          const createdTime = new Date(task.created_at);
          if (isNaN(createdTime.getTime())) return false;
          const createdHour = createdTime.getHours();
          return createdHour >= slot.start && createdHour < slot.end;
        }
        return false;
      }).length;

      return {
        time: slot.time,
        completed,
        incomplete
      };
    });
  })();

  // Real category distribution data
  const categoryData = (() => {
    const categories: { [key: string]: number } = {};
    
    tasks.forEach(task => {
      const category = task.category || 'Misc';
      categories[category] = (categories[category] || 0) + 1;
    });

    const colors = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6'];
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  })();

  // Real due-type distribution data  
  const procedureData = (() => {
    const dueTypes: { [key: string]: number } = {};
    
    tasks.forEach(task => {
      const dueType = task['due-type'] || 'Other';
      dueTypes[dueType] = (dueTypes[dueType] || 0) + 1;
    });

    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'];
    
    return Object.entries(dueTypes).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  })();

  // Real assistant patient coverage data based on completed tasks
  const patientCoverageData = assistants.map(assistant => {
    const completedTasks = tasks.filter(task => 
      task.assigned_to === assistant.id && task.status === 'Done'
    );
    return {
      name: assistant.name.split(' ')[0],
      patients: completedTasks.length // Use completed tasks as proxy for patient interactions
    };
  });

  // Find most active assistant
  const mostActiveAssistant = assistantWorkloadData.length > 0 
    ? assistantWorkloadData.reduce((prev, current) => 
        prev.completed > current.completed ? prev : current, assistantWorkloadData[0]
      )
    : { name: 'None', completed: 0 };

  // Calculate total completed tasks today as proxy for patients seen
  const patientsSeen = completedTasksToday;

  return (
    <div className="space-y-8">
      {/* Header with Download Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
          <p className="text-muted-foreground">
            Comprehensive overview of dental office performance and assistant productivity
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Download Report (PDF)
        </Button>
      </div>

      {/* Productivity Overview - Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-600">Total Tasks Today</p>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-blue-900">{completedTasksToday}</span>
                  <span className="text-lg text-blue-700">/ {totalTasksToday}</span>
                </div>
                <p className="text-xs text-blue-600">Completed</p>
              </div>
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-blue-200 flex items-center justify-center bg-blue-50">
                  <div className="text-xs font-bold text-blue-800">
                    {Math.round(completionRate)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500 rounded-full">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Most Active Assistant</p>
                <p className="text-xl font-bold text-green-900">{mostActiveAssistant.name}</p>
                <p className="text-xs text-green-600">{mostActiveAssistant.completed} tasks completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500 rounded-full">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-600">Patients Seen Today</p>
                <p className="text-3xl font-bold text-purple-900">{patientsSeen}</p>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+8% vs yesterday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-500 rounded-full">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-600">Unassigned Tasks</p>
                <p className="text-3xl font-bold text-orange-900">{unassignedTasks}</p>
                <p className="text-xs text-orange-600">Needs attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Task Completion - Last 7 Days
            </CardTitle>
            <CardDescription>Daily completion vs incomplete tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyCompletionData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip />
                  <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="incomplete" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assistant Workload Distribution
            </CardTitle>
            <CardDescription>Task completion by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assistantWorkloadData} layout="horizontal">
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} />
                  <ChartTooltip />
                  <Bar dataKey="completed" fill="#10B981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="total" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time of Day Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time-of-Day Performance
          </CardTitle>
          <CardDescription>Task completion patterns throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeOfDayData}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                <Area type="monotone" dataKey="incomplete" stackId="1" stroke="#EF4444" fill="#EF4444" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Assistant Performance & Clinical Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Assistant Performance Overview
            </CardTitle>
            <CardDescription>Completion rates and efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assistantWorkloadData.map((assistant, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {assistant.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{assistant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {assistant.completed}/{assistant.total} tasks
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={assistant.completion_rate >= 80 ? "default" : assistant.completion_rate >= 60 ? "secondary" : "destructive"}
                      className="mb-1"
                    >
                      {assistant.completion_rate.toFixed(0)}%
                    </Badge>
                    <p className="text-xs text-muted-foreground">completion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Clinical Coverage
            </CardTitle>
            <CardDescription>Patient touchpoints by assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientCoverageData} layout="horizontal">
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} />
                  <ChartTooltip />
                  <Bar dataKey="patients" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Analysis & Recurring Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Tasks by Category
            </CardTitle>
            <CardDescription>Distribution of dental office tasks across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={80} />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Procedure Types Handled
            </CardTitle>
            <CardDescription>Dental procedure and task timing distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={procedureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {procedureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {procedureData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Task Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Recurring Task Performance
          </CardTitle>
          <CardDescription>Weekly and daily recurring task completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-800">Sterilization Checks</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">On Track</Badge>
              </div>
              <p className="text-sm text-green-600">7/7 completed this week</p>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-800">Dental Setup</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">Complete</Badge>
              </div>
              <p className="text-sm text-blue-600">Daily setup completed</p>
            </div>
            
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-red-800">Supply Inventory</span>
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Behind
                </Badge>
              </div>
              <p className="text-sm text-red-600">2 days overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsTab;