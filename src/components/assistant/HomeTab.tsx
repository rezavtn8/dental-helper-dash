import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Award, Calendar, TrendingUp, Users, Target, Sparkles, ChevronRight, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PatientCounter from './PatientCounter';

interface HomeTabProps {
  tasks: any[];
  patientCount: number;
  onPatientCountUpdate: (count: number) => void;
  onTabChange?: (tab: string) => void;
}

export default function HomeTab({ tasks, patientCount, onPatientCountUpdate, onTabChange }: HomeTabProps) {
  const { userProfile } = useAuth();
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
      color: "from-blue-400 to-blue-500",
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
      color: "from-blue-500 to-blue-600",
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
                    task.status === 'completed' ? 'bg-blue-500' : 
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