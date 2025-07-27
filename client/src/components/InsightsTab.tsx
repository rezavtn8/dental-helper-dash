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
  // Calculate productivity metrics
  const todayTasks = tasks.filter(task => {
    const today = new Date().toDateString();
    return new Date(task.created_at).toDateString() === today;
  });
  
  const completedTasks = tasks.filter(task => task.status === 'Done');
  const totalTasksToday = todayTasks.length;
  const completedTasksToday = todayTasks.filter(task => task.status === 'Done').length;
  const completionRate = totalTasksToday > 0 ? (completedTasksToday / totalTasksToday) * 100 : 0;
  const unassignedTasks = tasks.filter(task => !task.assigned_to && task.status !== 'Done').length;

  // Mock data for charts (in real app, calculate from actual data)
  const weeklyCompletionData = [
    { day: 'Mon', completed: 24, incomplete: 6 },
    { day: 'Tue', completed: 28, incomplete: 4 },
    { day: 'Wed', completed: 22, incomplete: 8 },
    { day: 'Thu', completed: 32, incomplete: 3 },
    { day: 'Fri', completed: 26, incomplete: 7 },
    { day: 'Sat', completed: 18, incomplete: 2 },
    { day: 'Sun', completed: 12, incomplete: 1 }
  ];

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

  const timeOfDayData = [
    { time: 'Before 9AM', completed: 12, incomplete: 2 },
    { time: '9AM-12PM', completed: 18, incomplete: 4 },
    { time: '12PM-3PM', completed: 22, incomplete: 3 },
    { time: '3PM-6PM', completed: 16, incomplete: 5 },
    { time: 'After 6PM', completed: 8, incomplete: 1 }
  ];

  const categoryData = [
    { name: 'Sterilization', value: 28, color: '#3B82F6' },
    { name: 'Endodontics', value: 24, color: '#EF4444' },
    { name: 'Opening/Closing', value: 20, color: '#F59E0B' },
    { name: 'Inventory', value: 15, color: '#10B981' },
    { name: 'Admin', value: 8, color: '#8B5CF6' },
    { name: 'Misc', value: 5, color: '#6B7280' }
  ];

  const procedureData = [
    { name: 'Endodontics', value: 35, color: '#EF4444' },
    { name: 'Orthodontics', value: 25, color: '#3B82F6' },
    { name: 'Sterilization', value: 20, color: '#10B981' },
    { name: 'Administrative', value: 20, color: '#F59E0B' }
  ];

  const patientCoverageData = assistants.map(assistant => ({
    name: assistant.name.split(' ')[0],
    patients: Math.floor(Math.random() * 15) + 5 // Mock data
  }));

  // Find most active assistant
  const mostActiveAssistant = assistantWorkloadData.reduce((prev, current) => 
    prev.completed > current.completed ? prev : current, assistantWorkloadData[0] || { name: 'None', completed: 0 }
  );

  // Mock patients seen today
  const patientsSeen = 34;

  return (
    <div className="space-y-8">
      {/* Header with Download Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
          <p className="text-muted-foreground">
            Comprehensive overview of clinic performance and assistant productivity
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
                <Progress value={completionRate} className="w-16 h-16 rotate-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
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
            <CardDescription>Distribution of work across categories</CardDescription>
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
            <CardDescription>Clinical procedure distribution</CardDescription>
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
                  <span className="font-medium">{item.value}%</span>
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
                <span className="font-medium text-green-800">Autoclave Checks</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">On Track</Badge>
              </div>
              <p className="text-sm text-green-600">7/7 completed this week</p>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-800">Solution Prep</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">Complete</Badge>
              </div>
              <p className="text-sm text-blue-600">Daily prep completed</p>
            </div>
            
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-red-800">Weekly Inventory</span>
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