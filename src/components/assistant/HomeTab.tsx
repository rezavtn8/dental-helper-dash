import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Award, Calendar, TrendingUp, Users, Target, Sparkles, ChevronRight, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface HomeTabProps {
  tasks: any[];
  patientCount: number;
  onPatientCountUpdate: (count: number) => void;
}

export default function HomeTab({ tasks, patientCount, onPatientCountUpdate }: HomeTabProps) {
  const { user, userProfile } = useAuth();
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = task['due-date'] || task.custom_due_date;
    return dueDate && new Date(dueDate) < new Date();
  }).length;

  const updatePatientCount = async (increment: boolean) => {
    const newCount = increment ? patientCount + 1 : Math.max(0, patientCount - 1);
    
    if (!userProfile?.clinic_id) {
      toast.error('No clinic assigned to your account');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('patient_logs')
        .upsert({
          assistant_id: user?.id,
          date: today,
          patient_count: newCount,
          clinic_id: userProfile.clinic_id
        }, {
          onConflict: 'assistant_id,date,clinic_id'
        });

      if (error) throw error;
      onPatientCountUpdate(newCount);
      
      toast.success(`Patient count updated: ${newCount}`);
    } catch (error) {
      console.error('Error updating patient count:', error);
      toast.error('Failed to update patient count');
    }
  };

  const quickStats = [
    {
      title: "Patients Assisted",
      value: patientCount,
      icon: Users,
      color: "from-emerald-400 to-teal-500",
      bgColor: "bg-emerald-50",
      description: "helped today",
      metric: "patients"
    },
    {
      title: "Tasks Pending",
      value: pendingTasks,
      icon: Clock,
      color: "from-blue-400 to-indigo-500", 
      bgColor: "bg-blue-50",
      description: "to complete",
      metric: "tasks"
    },
    {
      title: "Tasks Completed",
      value: completedTasks,
      icon: Target,
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50", 
      description: "finished today",
      metric: "completed"
    },
    {
      title: "Overdue Items",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "from-red-400 to-rose-500",
      bgColor: "bg-red-50",
      description: "need attention",
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

      {/* Patient Tracking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Patient Counter */}
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-teal-600/10" />
          <CardContent className="p-8 relative z-10">
            <div className="text-center space-y-6">
              {/* Rotating Icon Wheel */}
              <div className={`w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform transition-all duration-500 hover:rotate-180 hover:scale-110`}>
                <div className="absolute inset-2 rounded-full bg-white/20" />
                <Users className="w-10 h-10 text-white z-10" />
              </div>
              
              <div>
                <p className="text-5xl font-bold text-teal-900 mb-2 transition-all duration-300 hover:scale-110">
                  {patientCount}
                </p>
                <p className="text-teal-700 font-semibold text-lg">Patients Assisted Today</p>
                <p className="text-teal-600 text-sm">Track your daily impact</p>
              </div>
              
              {/* Interactive Wheel Buttons */}
              <div className="flex items-center justify-center space-x-8">
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => updatePatientCount(false)}
                  disabled={patientCount === 0}
                  className="group w-16 h-16 rounded-full border-3 border-teal-300 hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-100 to-teal-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Minus className="h-6 w-6 text-teal-600 z-10 transition-all duration-300 group-hover:scale-125" />
                </Button>
                
                <Button 
                  size="lg"
                  onClick={() => updatePatientCount(true)}
                  className="group relative w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-xl shadow-teal-500/25 transition-all duration-300 hover:scale-125 hover:shadow-2xl hover:shadow-teal-500/40"
                >
                  {/* Rotating background effect */}
                  <div className="absolute inset-1 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  <Plus className="h-6 w-6 z-10 transition-all duration-300 group-hover:rotate-90" />
                </Button>
              </div>
              
              {/* Motivational Text */}
              <div className="pt-2">
                {patientCount >= 15 && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2 animate-pulse">
                    🌟 Outstanding day!
                  </Badge>
                )}
                {patientCount >= 10 && patientCount < 15 && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2">
                    💪 Great progress!
                  </Badge>
                )}
                {patientCount >= 5 && patientCount < 10 && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 px-4 py-2">
                    👍 Good start!
                  </Badge>
                )}
                {patientCount < 5 && patientCount > 0 && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-4 py-2">
                    🚀 Keep going!
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Target className="w-6 h-6 mr-3 text-blue-600" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/60 rounded-2xl">
                <p className="text-2xl font-bold text-blue-900">{completedTasks}</p>
                <p className="text-sm text-blue-600">Tasks Done</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-2xl">
                <p className="text-2xl font-bold text-blue-900">{pendingTasks}</p>
                <p className="text-sm text-blue-600">Tasks Pending</p>
              </div>
            </div>
            
            {patientCount > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    You've helped {patientCount} patient{patientCount !== 1 ? 's' : ''} today!
                  </p>
                </div>
              </div>
            )}
            
            {overdueTasks > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-2xl border border-red-200">
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">
                    {overdueTasks} overdue task{overdueTasks !== 1 ? 's' : ''} need attention
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Wheel-Style Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const isHovered = hoveredStat === index;
          return (
            <Card 
              key={index} 
              className={`relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                isHovered ? 'shadow-2xl' : 'hover:shadow-xl'
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
                <div className="relative p-6 z-10">
                  <div className="flex items-center justify-between mb-4">
                    {/* Rotating Icon Wheel */}
                    <div className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg transform transition-all duration-500 ${
                      isHovered ? 'rotate-180 scale-110' : ''
                    }`}>
                      {/* Inner rotating circle */}
                      <div className={`absolute inset-2 rounded-full bg-white/20 transition-all duration-700 ${
                        isHovered ? 'rotate-[-180deg]' : ''
                      }`} />
                      <Icon className={`w-8 h-8 text-white z-10 transition-all duration-500 ${
                        isHovered ? 'scale-125' : ''
                      }`} />
                    </div>
                    
                    {/* Animated Value */}
                    <div className="text-right">
                      <div className={`text-4xl font-bold transition-all duration-300 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent ${
                        isHovered ? 'scale-110' : ''
                      }`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                        {stat.metric}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content with slide effect */}
                  <div className={`transition-all duration-300 ${isHovered ? 'transform translate-y-[-2px]' : ''}`}>
                    <h3 className="font-bold text-slate-800 mb-1 text-lg">{stat.title}</h3>
                    <p className="text-sm text-slate-600">{stat.description}</p>
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

      {/* Interactive Quick Actions Wheel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const isHovered = hoveredAction === index;
          return (
            <Card 
              key={index} 
              className={`group relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                isHovered ? 'shadow-2xl' : 'hover:shadow-xl'
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
                <div className="relative p-6 h-full flex flex-col justify-between z-10">
                  {/* Icon and Title */}
                  <div>
                    <div className={`flex items-center mb-4 transition-all duration-500 ${
                      isHovered ? 'transform translate-y-[-4px]' : ''
                    }`}>
                      {/* Rotating Icon Wheel */}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mr-4 shadow-lg transform transition-all duration-500 ${
                        isHovered ? 'rotate-180 scale-110' : ''
                      }`}>
                        <Icon className={`w-6 h-6 text-white transition-all duration-500 ${
                          isHovered ? 'scale-125' : ''
                        }`} />
                      </div>
                      
                      <h3 className={`text-xl font-bold transition-all duration-300 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`}>
                        {action.title}
                      </h3>
                    </div>
                    
                    <p className={`text-slate-600 text-sm mb-4 transition-all duration-300 ${
                      isHovered ? 'text-slate-700' : ''
                    }`}>
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Interactive Button */}
                  <Button 
                    className={`group relative overflow-hidden bg-gradient-to-r ${action.color} text-white border-0 transition-all duration-300 ${
                      isHovered ? 'shadow-lg transform scale-105' : ''
                    }`}
                    size="sm"
                  >
                    {/* Button background wheel effect */}
                    <div className={`absolute inset-0 bg-white/20 transition-all duration-500 ${
                      isHovered ? 'scale-110 rotate-180' : 'scale-100'
                    }`} />
                    
                    <span className="relative z-10 flex items-center">
                      Get Started
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
                    <Sparkles className="absolute top-4 right-4 w-4 h-4 text-yellow-400 animate-pulse" />
                    <Sparkles className="absolute bottom-4 left-4 w-3 h-3 text-yellow-300 animate-pulse delay-300" />
                  </>
                )}
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
    </div>
  );
}