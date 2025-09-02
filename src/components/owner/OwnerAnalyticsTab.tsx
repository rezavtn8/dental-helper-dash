import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  Download,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  weeklyTasks: Array<{ week: string; completed: number; overdue: number }>;
  monthlyPatients: Array<{ month: string; patients: number }>;
  taskCategories: Array<{ category: string; count: number; percentage: number }>;
  overdueTrend: Array<{ date: string; overdue: number }>;
}

interface OwnerAnalyticsTabProps {
  clinicId: string;
}

export default function OwnerAnalyticsTab({ clinicId }: OwnerAnalyticsTabProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    weeklyTasks: [],
    monthlyPatients: [],
    taskCategories: [],
    overdueTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('3months');
  const [totalStats, setTotalStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalPatients: 0,
    activeAssistants: 0,
    completionRate: 0
  });

  useEffect(() => {
    if (clinicId) {
      fetchAnalyticsData();
    }
  }, [clinicId, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('created_at', startDate.toISOString());

      if (tasksError) throw tasksError;

      // Fetch patient logs
      const { data: patientLogsData, error: patientLogsError } = await supabase
        .from('patient_logs')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('date', startDate.toISOString().split('T')[0]);

      if (patientLogsError) throw patientLogsError;

      // Fetch active assistants
      const { data: assistantsData, error: assistantsError } = await supabase
        .from('users')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('role', 'assistant')
        .eq('is_active', true);

      if (assistantsError) throw assistantsError;

      // Process data
      const processedData = processAnalyticsData(tasksData || [], patientLogsData || []);
      setAnalyticsData(processedData);

      // Calculate total stats
      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(task => task.status === 'completed').length || 0;
      const totalPatients = patientLogsData?.reduce((sum, log) => sum + (log.patient_count || 0), 0) || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setTotalStats({
        totalTasks,
        completedTasks,
        totalPatients,
        activeAssistants: assistantsData?.length || 0,
        completionRate
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (tasks: any[], patientLogs: any[]) => {
    // Process weekly tasks
    const weeklyTasksMap = new Map();
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      
      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
      
      const completed = weekTasks.filter(task => task.status === 'completed').length;
      const overdue = weekTasks.filter(task => {
        const dueDate = task['due-date'] ? new Date(task['due-date']) : null;
        return dueDate && dueDate < now && task.status !== 'completed';
      }).length;
      
      weeklyTasksMap.set(weekKey, { week: weekKey, completed, overdue });
    }

    // Process monthly patients
    const monthlyPatientsMap = new Map();
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthKey = monthStart.toLocaleString('default', { month: 'short' });
      
      const monthPatients = patientLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= monthStart && logDate <= monthEnd;
      });
      
      const totalPatients = monthPatients.reduce((sum, log) => sum + (log.patient_count || 0), 0);
      monthlyPatientsMap.set(monthKey, { month: monthKey, patients: totalPatients });
    }

    // Process task categories
    const categoryMap = new Map();
    tasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const taskCategories = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / tasks.length) * 100)
    }));

    // Process overdue trend
    const overdueTrendMap = new Map();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString();
      
      const overdue = tasks.filter(task => {
        const dueDate = task['due-date'] ? new Date(task['due-date']) : null;
        return dueDate && dueDate.toDateString() === date.toDateString() && task.status !== 'completed';
      }).length;
      
      overdueTrendMap.set(dateKey, { date: dateKey, overdue });
    }

    return {
      weeklyTasks: Array.from(weeklyTasksMap.values()),
      monthlyPatients: Array.from(monthlyPatientsMap.values()),
      taskCategories: taskCategories.slice(0, 6),
      overdueTrend: Array.from(overdueTrendMap.values())
    };
  };

  const exportData = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      timeRange,
      clinicId,
      totalStats,
      analytics: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinic-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <h3 className="text-xl font-semibold">Analytics</h3>
          <p className="text-sm text-muted-foreground">High-level insights into your clinic's performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={exportData} className="flex items-center gap-2">
            <Download className="w-3 h-3" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
                <p className="text-xl font-bold">{totalStats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">
                  {totalStats.completedTasks} done
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-xl font-bold">{totalStats.completionRate}%</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {totalStats.completionRate >= 80 ? 'Great' : totalStats.completionRate >= 60 ? 'Good' : 'Low'}
                </div>
              </div>
              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Patients</p>
                <p className="text-xl font-bold">{totalStats.totalPatients}</p>
                <p className="text-xs text-muted-foreground">
                  Assisted
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Assistants</p>
                <p className="text-xl font-bold">{totalStats.activeAssistants}</p>
                <p className="text-xs text-muted-foreground">
                  Active
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task Completion Trends */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Task Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.weeklyTasks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Completed"
                />
                <Line 
                  type="monotone" 
                  dataKey="overdue" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Overdue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patients Assisted */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Patients Assisted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.monthlyPatients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="patients" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4" />
              Task Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.taskCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.taskCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overdue Tasks Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Overdue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.overdueTrend.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="overdue" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Overdue Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}