import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Award, Calendar, TrendingUp, Users, Target, Sparkles, ChevronRight } from 'lucide-react';
import PatientCounter from './PatientCounter';

interface HomeTabProps {
  tasks: any[];
  patientCount: number;
  onPatientCountUpdate: (count: number) => void;
}

export default function HomeTab({ tasks, patientCount, onPatientCountUpdate }: HomeTabProps) {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);
  
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = task['due-date'] || task.custom_due_date;
    return dueDate && new Date(dueDate) < new Date();
  }).length;

  const quickStats = [
    {
      title: "Pending",
      value: pendingTasks,
      icon: Clock,
      color: "from-blue-400 to-indigo-500", 
      bgColor: "bg-blue-50",
      metric: "tasks"
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: Target,
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50", 
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
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      action: "schedule"
    },
    {
      title: "Certifications", 
      description: "Manage your professional certifications and track expiry dates",
      icon: Award,
      color: "from-purple-500 to-pink-500", 
      bgColor: "bg-purple-50",
      action: "certifications"
    },
    {
      title: "Growth Tracking",
      description: "Track your progress, feedback, and professional milestones",
      icon: TrendingUp,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50", 
      action: "growth"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header with Patient Counter */}
      <div className="space-y-4">
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

        {/* Compact Patient Counter */}
        <PatientCounter 
          patientCount={patientCount} 
          onPatientCountUpdate={onPatientCountUpdate} 
        />
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const isHovered = hoveredStat === index;
          return (
            <Card 
              key={index} 
              className={`relative overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] ${
                isHovered ? 'shadow-md' : 'hover:shadow-sm'
              }`}
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div>
                    <div className={`text-xl font-bold transition-all duration-300 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {stat.title}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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

      {/* Compact Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const isHovered = hoveredAction === index;
          return (
            <Card 
              key={index} 
              className={`group relative overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] ${
                isHovered ? 'shadow-md' : 'hover:shadow-sm'
              }`}
              onMouseEnter={() => setHoveredAction(index)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mr-3 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <h3 className={`text-lg font-bold transition-all duration-300 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`}>
                    {action.title}
                  </h3>
                </div>
                
                <p className="text-slate-600 text-sm mb-3">
                  {action.description}
                </p>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${action.color} text-white border-0 transition-all duration-300`}
                  size="sm"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}