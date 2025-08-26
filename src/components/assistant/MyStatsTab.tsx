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
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Task {
  id: string;
  title: string;
  status: string;
  completed_at?: string;
  created_at: string;
  assigned_to: string | null;
}

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
  
  const completedToday = myTasks.filter(task => {
    if (!task.completed_at) return false;
    const completedDate = new Date(task.completed_at).toISOString().split('T')[0];
    return completedDate === today && ['completed', 'done'].includes(task.status?.toLowerCase());
  }).length;

  // Calculate streak (mock data for now)
  const streak = 7; // This would come from actual data
  
  // Weekly data (mock for now)
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
        });

      if (error) throw error;
      onPatientCountUpdate(newCount);
      
      toast({
        title: "Updated",
        description: `Patient count: ${newCount}`,
      });
    } catch (error) {
      console.error('Error updating patient count:', error);
      toast({
        title: "Error",
        description: "Failed to update patient count",
        variant: "destructive"
      });
    }
  };

  // Motivational messages based on performance
  const getMotivationalMessage = () => {
    if (completedToday >= 10) return { text: "You're on fire! 🔥", color: "bg-red-100 text-red-700", icon: Zap };
    if (completedToday >= 7) return { text: "Excellent work! ⭐", color: "bg-yellow-100 text-yellow-700", icon: Star };
    if (completedToday >= 5) return { text: "Great job! 👏", color: "bg-green-100 text-green-700", icon: Trophy };
    if (completedToday >= 3) return { text: "Keep it up! 💪", color: "bg-blue-100 text-blue-700", icon: TrendingUp };
    return { text: "Getting started! 🚀", color: "bg-gray-100 text-gray-700", icon: Target };
  };

  const motivation = getMotivationalMessage();
  const MotivationIcon = motivation.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Performance</h2>
        <p className="text-gray-600 text-lg">Track your daily progress and achievements</p>
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Counter */}
        <Card className="shadow-md border-2 border-teal-100">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-900 mb-2">{patientCount}</p>
                <p className="text-gray-600 font-medium">Patients Assisted Today</p>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => updatePatientCount(false)}
                  disabled={patientCount === 0}
                  className="w-12 h-12 rounded-full border-2 hover:bg-gray-50"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  onClick={() => updatePatientCount(true)}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Completed */}
        <Card className="shadow-md border-2 border-green-100">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-gray-900 mb-2">{completedToday}</p>
                <p className="text-gray-600 font-medium">Tasks Completed Today</p>
              </div>
              <div className="flex items-center justify-center">
                <Badge className={`${motivation.color} px-4 py-2 text-sm font-medium`}>
                  <MotivationIcon className="w-4 h-4 mr-2" />
                  {motivation.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{streak}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalWeeklyTasks}</p>
                <p className="text-sm text-gray-600">Tasks This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalWeeklyPatients}</p>
                <p className="text-sm text-gray-600">Patients This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
            Weekly Performance
          </CardTitle>
          <CardDescription>
            Your task completion and patient assistance over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tasks Chart */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Tasks Completed</h4>
              <div className="grid grid-cols-7 gap-2">
                {weeklyData.map((day, index) => {
                  const height = maxTasks > 0 ? (day.tasks / maxTasks) * 100 : 0;
                  const isToday = index === 5; // Saturday for demo
                  
                  return (
                    <div key={`tasks-${day.day}`} className="text-center">
                      <div className="relative h-24 bg-gray-100 rounded-lg mb-2 flex items-end justify-center">
                        <div 
                          className={`w-full rounded-lg transition-all duration-500 ${
                            isToday 
                              ? 'bg-gradient-to-t from-teal-500 to-teal-400' 
                              : 'bg-gradient-to-t from-gray-400 to-gray-300'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                        {day.tasks > 0 && (
                          <span className="absolute text-xs font-bold text-white mb-1">
                            {day.tasks}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-medium ${isToday ? 'text-teal-600' : 'text-gray-600'}`}>
                        {day.day}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patients Chart */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Patients Assisted</h4>
              <div className="grid grid-cols-7 gap-2">
                {weeklyData.map((day, index) => {
                  const height = maxPatients > 0 ? (day.patients / maxPatients) * 100 : 0;
                  const isToday = index === 5; // Saturday for demo
                  
                  return (
                    <div key={`patients-${day.day}`} className="text-center">
                      <div className="relative h-24 bg-gray-100 rounded-lg mb-2 flex items-end justify-center">
                        <div 
                          className={`w-full rounded-lg transition-all duration-500 ${
                            isToday 
                              ? 'bg-gradient-to-t from-blue-500 to-blue-400' 
                              : 'bg-gradient-to-t from-gray-400 to-gray-300'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                        {day.patients > 0 && (
                          <span className="absolute text-xs font-bold text-white mb-1">
                            {day.patients}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
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
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-teal-600" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {completedToday >= 5 && (
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-yellow-800">Task Master</p>
                <p className="text-xs text-yellow-600">5+ tasks completed</p>
              </div>
            )}
            
            {patientCount >= 10 && (
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-800">People Person</p>
                <p className="text-xs text-blue-600">10+ patients helped</p>
              </div>
            )}
            
            {streak >= 7 && (
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-800">Consistent</p>
                <p className="text-xs text-purple-600">7+ day streak</p>
              </div>
            )}
            
            {completedToday >= 10 && (
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                <Zap className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-red-800">On Fire!</p>
                <p className="text-xs text-red-600">10+ tasks today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}