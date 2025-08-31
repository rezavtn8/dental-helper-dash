import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Award, Calendar, TrendingUp } from 'lucide-react';

interface HomeTabProps {
  tasks: any[];
  patientCount: number;
}

export default function HomeTab({ tasks, patientCount }: HomeTabProps) {
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = task['due-date'] || task.custom_due_date;
    return dueDate && new Date(dueDate) < new Date();
  }).length;

  const quickStats = [
    {
      title: "Today's Patients",
      value: patientCount,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
      description: "patients assisted today"
    },
    {
      title: "Pending Tasks",
      value: pendingTasks,
      icon: Clock,
      color: "text-blue-600 bg-blue-50",
      description: "tasks to complete"
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
      description: "tasks finished"
    },
    {
      title: "Overdue Items",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
      description: "items past due"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-teal-900 mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-teal-700">
              Here's your daily overview and quick access to key features.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Badge variant="secondary" className="bg-teal-100 text-teal-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">{stat.title}</p>
                  <p className="text-sm text-slate-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              View your upcoming shifts and schedule for the week.
            </CardDescription>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              View Schedule →
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">Certifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Manage your professional certifications and track expiry dates.
            </CardDescription>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              Manage Certs →
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Growth</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Track your progress, feedback, and professional milestones.
            </CardDescription>
            <Badge variant="outline" className="text-green-600 border-green-200">
              View Progress →
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Your latest tasks and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task, index) => (
              <div key={task.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' : 
                    task.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />
                  <div>
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <p className="text-sm text-slate-500">{task.category || 'General'}</p>
                  </div>
                </div>
                <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                  {task.status === 'completed' ? 'Done' : 'Pending'}
                </Badge>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}