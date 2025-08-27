import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CheckCircle2, 
  Calendar, 
  Trophy,
  TrendingUp,
  Star,
  Target,
  Zap,
  Plus,
  Minus,
  BarChart3,
  Award,
  Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types/task';
import { isCompleted, TaskStatus } from '@/lib/taskStatus';

interface MyStatsTabProps {
  tasks: Task[];
  patientCount: number;
  onPatientCountUpdate: (count: number) => void;
}

export default function MyStatsTab({ tasks, patientCount, onPatientCountUpdate }: MyStatsTabProps) {
  const { user } = useAuth();
  
  // Calculate today's metrics
  const today = new Date().toISOString().split('T')[0];
  const myTasks = tasks.filter(task => task.assigned_to === user?.id);
  
  const completedToday = myTasks.filter(task => 
    task.completed_at && 
    new Date(task.completed_at).toISOString().split('T')[0] === today &&
    isCompleted(task.status)
  ).length;

  // Calculate streak (mock data - in real app this would come from database)
  const streak = 7;
  
  // Weekly data (mock for demonstration - replace with real data)
  const weeklyData = [
    { day: 'Mon', tasks: 8, patients: 12 },
    { day: 'Tue', tasks: 6, patients: 9 },
    { day: 'Wed', tasks: 10, patients: 15 },
    { day: 'Thu', tasks: 7, patients: 11 },
    { day: 'Fri', tasks: 9, patients: 13 },
    { day: 'Sat', tasks: completedToday, patients: patientCount },
    { day: 'Sun', tasks: 0, patients: 0 }
  ];

  const totalWeeklyTasks = weeklyData.reduce((sum, day) => sum + day.tasks, 0);
  const totalWeeklyPatients = weeklyData.reduce((sum, day) => sum + day.patients, 0);
  const maxTasks = Math.max(...weeklyData.map(d => d.tasks));
  const maxPatients = Math.max(...weeklyData.map(d => d.patients));

  const updatePatientCount = async (increment: boolean) => {
    const newCount = increment ? patientCount + 1 : Math.max(0, patientCount - 1);
    
    try {
      const { error } = await supabase
        .from('patient_logs')
        .upsert({
          assistant_id: user?.id,
          date: today,
          patient_count: newCount,
          clinic_id: user?.user_metadata?.clinic_id
        }, {
          onConflict: 'assistant_id,date',
          ignoreDuplicates: false
        });

      if (error) throw error;
      onPatientCountUpdate(newCount);
      
      toast.success(`Patient count updated: ${newCount}`);
    } catch (error) {
      console.error('Error updating patient count:', error);
      toast.error('Failed to update patient count');
    }
  };

  // Motivational messages based on performance
  const getMotivationalMessage = () => {
    if (completedToday >= 10) return { text: "You're on fire! 🔥", color: "bg-red-100 text-red-700 border-red-200", icon: Flame };
    if (completedToday >= 7) return { text: "Excellent work! ⭐", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Star };
    if (completedToday >= 5) return { text: "Great job! 👏", color: "bg-green-100 text-green-700 border-green-200", icon: Award };
    if (completedToday >= 3) return { text: "Keep it up! 💪", color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp };
    return { text: "Getting started! 🚀", color: "bg-teal-100 text-teal-700 border-teal-200", icon: Target };
  };

  const motivation = getMotivationalMessage();
  const MotivationIcon = motivation.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-teal-900 mb-3">My Performance</h1>
        <p className="text-teal-600 text-lg">Track your daily progress and achievements</p>
      </div>

      {/* Today's Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient Counter */}
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-5xl font-bold text-teal-900 mb-2">{patientCount}</p>
                <p className="text-teal-700 font-semibold text-lg">Patients Assisted Today</p>
              </div>
              <div className="flex items-center justify-center space-x-6">
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => updatePatientCount(false)}
                  disabled={patientCount === 0}
                  className="w-14 h-14 rounded-full border-2 border-teal-300 hover:bg-teal-50 hover:border-teal-400 touch-target"
                >
                  <Minus className="h-6 w-6 text-teal-600" />
                </Button>
                <Button 
                  size="lg"
                  onClick={() => updatePatientCount(true)}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25 touch-target"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Completed */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-5xl font-bold text-green-900 mb-2">{completedToday}</p>
                <p className="text-green-700 font-semibold text-lg">Tasks Completed Today</p>
              </div>
              <div className="flex items-center justify-center">
                <Badge className={`${motivation.color} px-6 py-3 text-base font-semibold border-2`}>
                  <MotivationIcon className="w-5 h-5 mr-2" />
                  {motivation.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-900">{streak}</p>
                <p className="text-sm text-purple-700 font-medium">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-900">{totalWeeklyTasks}</p>
                <p className="text-sm text-orange-700 font-medium">Tasks This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-900">{totalWeeklyPatients}</p>
                <p className="text-sm text-blue-700 font-medium">Patients This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Chart */}
      <Card className="shadow-xl border-teal-100 bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50">
          <CardTitle className="flex items-center text-teal-900">
            <BarChart3 className="w-6 h-6 mr-3 text-teal-600" />
            Weekly Performance Overview
          </CardTitle>
          <CardDescription className="text-teal-700">
            Your task completion and patient assistance over the past week
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Tasks Chart */}
            <div>
              <h4 className="font-bold text-teal-900 mb-6 text-lg">Tasks Completed Daily</h4>
              <div className="grid grid-cols-7 gap-3">
                {weeklyData.map((day, index) => {
                  const height = maxTasks > 0 ? (day.tasks / maxTasks) * 100 : 0;
                  const isToday = index === 5; // Saturday for demo
                  
                  return (
                    <div key={`tasks-${day.day}`} className="text-center">
                      <div className="relative h-32 bg-teal-50 rounded-2xl mb-3 flex items-end justify-center border-2 border-teal-100">
                        <div 
                          className={`w-full rounded-2xl transition-all duration-700 ${
                            isToday 
                              ? 'bg-gradient-to-t from-teal-500 to-teal-400 shadow-lg' 
                              : 'bg-gradient-to-t from-teal-300 to-teal-200'
                          }`}
                          style={{ height: `${Math.max(height, 10)}%` }}
                        />
                        {day.tasks > 0 && (
                          <span className="absolute text-sm font-bold text-white mb-2">
                            {day.tasks}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${isToday ? 'text-teal-700' : 'text-teal-600'}`}>
                        {day.day}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patients Chart */}
            <div>
              <h4 className="font-bold text-teal-900 mb-6 text-lg">Patients Assisted Daily</h4>
              <div className="grid grid-cols-7 gap-3">
                {weeklyData.map((day, index) => {
                  const height = maxPatients > 0 ? (day.patients / maxPatients) * 100 : 0;
                  const isToday = index === 5; // Saturday for demo
                  
                  return (
                    <div key={`patients-${day.day}`} className="text-center">
                      <div className="relative h-32 bg-blue-50 rounded-2xl mb-3 flex items-end justify-center border-2 border-blue-100">
                        <div 
                          className={`w-full rounded-2xl transition-all duration-700 ${
                            isToday 
                              ? 'bg-gradient-to-t from-blue-500 to-blue-400 shadow-lg' 
                              : 'bg-gradient-to-t from-blue-300 to-blue-200'
                          }`}
                          style={{ height: `${Math.max(height, 10)}%` }}
                        />
                        {day.patients > 0 && (
                          <span className="absolute text-sm font-bold text-white mb-2">
                            {day.patients}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-blue-600'}`}>
                        {day.day}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card className="shadow-xl border-teal-100 bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="flex items-center text-teal-900">
            <Trophy className="w-6 h-6 mr-3 text-yellow-600" />
            Today's Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {completedToday >= 5 && (
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border-2 border-yellow-200 shadow-lg">
                <Star className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-base font-bold text-yellow-800">Task Master</p>
                <p className="text-xs text-yellow-600 mt-1">5+ tasks completed</p>
              </div>
            )}
            
            {patientCount >= 10 && (
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-base font-bold text-blue-800">People Person</p>
                <p className="text-xs text-blue-600 mt-1">10+ patients helped</p>
              </div>
            )}
            
            {streak >= 7 && (
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-lg">
                <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-base font-bold text-purple-800">Consistent</p>
                <p className="text-xs text-purple-600 mt-1">7+ day streak</p>
              </div>
            )}
            
            {completedToday >= 10 && (
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-200 shadow-lg">
                <Flame className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-base font-bold text-red-800">On Fire!</p>
                <p className="text-xs text-red-600 mt-1">10+ tasks today</p>
              </div>
            )}
          </div>
          
          {completedToday < 3 && patientCount < 5 && streak < 3 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-teal-400 mx-auto mb-4" />
              <p className="text-teal-600 font-medium">Keep working to unlock achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}