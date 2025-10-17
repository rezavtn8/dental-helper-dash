import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Calendar, 
  Trophy,
  TrendingUp,
  Star,
  Target,
  BarChart3,
  Award,
  Flame,
  Building
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types/task';
import { isCompleted } from '@/lib/taskStatus';

interface MyStatsTabProps {
  tasks: Task[];
}

export default function MyStatsTab({ tasks }: MyStatsTabProps) {
  const { user, userProfile } = useAuth();
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
              To view your performance statistics and achievements, you need to join a clinic first.
            </p>
            <Button onClick={() => navigate('/join-clinic')}>
              Join a Clinic
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  
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
    { day: 'Mon', tasks: 8 },
    { day: 'Tue', tasks: 6 },
    { day: 'Wed', tasks: 10 },
    { day: 'Thu', tasks: 7 },
    { day: 'Fri', tasks: 9 },
    { day: 'Sat', tasks: completedToday },
    { day: 'Sun', tasks: 0 }
  ];

  const totalWeeklyTasks = weeklyData.reduce((sum, day) => sum + day.tasks, 0);
  const maxTasks = Math.max(...weeklyData.map(d => d.tasks));
  const weeklyAverage = Math.round(totalWeeklyTasks / 7);

  // Motivational messages based on performance - updated with blue theme
  const getMotivationalMessage = () => {
    if (completedToday >= 10) return { text: "You're on fire! 🔥", color: "bg-red-100 text-red-700 border-red-200", icon: Flame };
    if (completedToday >= 7) return { text: "Excellent work! ⭐", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Star };
    if (completedToday >= 5) return { text: "Great job! 👏", color: "bg-green-100 text-green-700 border-green-200", icon: Award };
    if (completedToday >= 3) return { text: "Keep it up! 💪", color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp };
    return { text: "Getting started! 🚀", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Target };
  };

  const motivation = getMotivationalMessage();
  const MotivationIcon = motivation.icon;

  const quickStats = [
    {
      title: "Today",
      value: completedToday,
      icon: CheckCircle2,
      color: "from-blue-400 to-blue-500", 
      bgColor: "bg-blue-50",
      metric: "completed"
    },
    {
      title: "Streak",
      value: streak,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      metric: "days"
    },
    {
      title: "Weekly",
      value: totalWeeklyTasks,
      icon: Trophy,
      color: "from-green-400 to-green-500",
      bgColor: "bg-green-50",
      metric: "tasks"
    },
    {
      title: "Average",
      value: weeklyAverage,
      icon: Target,
      color: "from-blue-400 to-blue-500",
      bgColor: "bg-blue-50",
      metric: "daily"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header - Updated to match other tabs */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-blue-900 mb-3">My Performance</h1>
        <p className="text-blue-600 text-lg">Track your daily progress and achievements</p>
      </div>

      {/* Interactive Wheel-Style Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div className="flex flex-col items-center space-y-2">
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
                    
                    <div className="text-center">
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

      {/* Motivational Badge */}
      <div className="flex justify-center">
        <Badge className={`${motivation.color} px-6 py-3 text-base font-semibold border-2`}>
          <MotivationIcon className="w-5 h-5 mr-2" />
          {motivation.text}
        </Badge>
      </div>

      {/* Weekly Performance Chart - Simplified */}
      <Card className="shadow-xl border-blue-100 bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center text-blue-900">
            <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
            Weekly Task Completion
          </CardTitle>
          <CardDescription className="text-blue-700">
            Your task completion over the past week
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-7 gap-3">
            {weeklyData.map((day, index) => {
              const height = maxTasks > 0 ? (day.tasks / maxTasks) * 100 : 0;
              const isToday = index === 5; // Saturday for demo
              
              return (
                <div key={`tasks-${day.day}`} className="text-center">
                  <div className="relative h-32 bg-blue-50 rounded-2xl mb-3 flex items-end justify-center border-2 border-blue-100">
                    <div 
                      className={`w-full rounded-2xl transition-all duration-700 ${
                        isToday 
                          ? 'bg-gradient-to-t from-blue-500 to-blue-400 shadow-lg' 
                          : 'bg-gradient-to-t from-blue-300 to-blue-200'
                      }`}
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                    {day.tasks > 0 && (
                      <span className="absolute text-sm font-bold text-white mb-2">
                        {day.tasks}
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
        </CardContent>
      </Card>

      {/* Achievement Badges - Updated to remove patient-related ones */}
      <Card className="shadow-xl border-blue-100 bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="flex items-center text-blue-900">
            <Trophy className="w-6 h-6 mr-3 text-yellow-600" />
            Today's Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {completedToday >= 5 && (
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border-2 border-yellow-200 shadow-lg">
                <Star className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-base font-bold text-yellow-800">Task Master</p>
                <p className="text-xs text-yellow-600 mt-1">5+ tasks completed</p>
              </div>
            )}
            
            {streak >= 7 && (
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-base font-bold text-blue-800">Consistent</p>
                <p className="text-xs text-blue-600 mt-1">7+ day streak</p>
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
          
          {completedToday < 3 && streak < 3 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-600 font-medium">Keep working to unlock achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}