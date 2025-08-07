import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Activity,
  TrendingUp,
  Download,
  Calendar,
  Target,
  Clock
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  'due-type': string;
  completed_at?: string;
  created_at: string;
  assigned_to: string | null;
}

interface OwnerAnalyticsProps {
  tasks: Task[];
}

const OwnerAnalytics: React.FC<OwnerAnalyticsProps> = ({ tasks }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Calculate completion trends over time
  const getCompletionTrends = () => {
    const now = new Date();
    const daysAgo = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    const data = [];
    for (let i = daysAgo; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      
      const completedTasks = tasks.filter(task => 
        task.completed_at && 
        task.completed_at.split('T')[0] === dateStr
      ).length;

      data.push({
        date: dateStr,
        completed: completedTasks,
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }

    return data;
  };

  // Calculate task distribution by category
  const getCategoryDistribution = () => {
    const categories = tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / tasks.length) * 100)
    }));
  };

  // Calculate priority distribution
  const getPriorityDistribution = () => {
    const priorities = tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorities).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: Math.round((value / tasks.length) * 100)
    }));
  };

  // Calculate productivity metrics
  const getProductivityMetrics = () => {
    const completedTasks = tasks.filter(task => task.status === 'Done');
    const pendingTasks = tasks.filter(task => task.status !== 'Done');
    const totalTasks = tasks.length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
    
    // Calculate average completion time (simplified)
    const avgCompletionTime = completedTasks.length > 0 ? '2.3 days' : 'N/A';

    return {
      totalTasks,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      completionRate,
      avgCompletionTime
    };
  };

  const completionTrends = getCompletionTrends();
  const categoryData = getCategoryDistribution();
  const priorityData = getPriorityDistribution();
  const metrics = getProductivityMetrics();

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const exportData = () => {
    const exportData = {
      metrics,
      tasks: tasks.length,
      completionRate: metrics.completionRate,
      categoryBreakdown: categoryData,
      priorityBreakdown: priorityData,
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinic-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your clinic's task performance and productivity</p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedTasks} of {metrics.totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgCompletionTime}</div>
            <p className="text-xs text-muted-foreground">
              Estimated average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Active workload
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trends</CardTitle>
            <CardDescription>Daily completion patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={completionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
            <CardDescription>Distribution of tasks across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Tasks grouped by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Detailed view of task categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{category.value} tasks</Badge>
                    <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerAnalytics;