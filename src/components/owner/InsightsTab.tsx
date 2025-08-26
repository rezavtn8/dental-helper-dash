import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock,
  Calendar,
  Target,
  Award
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
  completed_at?: string;
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

export default function InsightsTab({ tasks, assistants }: InsightsTabProps) {
  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => 
    ['completed', 'done'].includes(task.status?.toLowerCase())
  ).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Weekly stats (mock data for now)
  const thisWeekTasks = 23;
  const lastWeekTasks = 18;
  const weeklyGrowth = Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100);

  // High priority tasks
  const highPriorityTasks = tasks.filter(task => 
    task.priority?.toLowerCase() === 'high' && 
    !['completed', 'done'].includes(task.status?.toLowerCase())
  ).length;

  // Most active assistant
  const tasksByAssistant = assistants.map(assistant => {
    const assignedTasks = tasks.filter(task => task.assigned_to === assistant.id);
    const completedTasksCount = assignedTasks.filter(task => 
      ['completed', 'done'].includes(task.status?.toLowerCase())
    ).length;
    
    return {
      ...assistant,
      totalTasks: assignedTasks.length,
      completedTasks: completedTasksCount,
      completionRate: assignedTasks.length > 0 ? 
        Math.round((completedTasksCount / assignedTasks.length) * 100) : 0
    };
  }).sort((a, b) => b.completedTasks - a.completedTasks);

  const topPerformer = tasksByAssistant[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Practice Insights</h2>
        <p className="text-gray-600">Track your practice performance and team productivity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+{weeklyGrowth}%</span>
              <span className="text-sm text-gray-600 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{pendingTasks}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {highPriorityTasks > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {highPriorityTasks} High Priority
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-3xl font-bold text-gray-900">{assistants.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Active staff members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Overview */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-teal-600" />
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock weekly data */}
              {[
                { day: 'Monday', completed: 8, total: 12 },
                { day: 'Tuesday', completed: 6, total: 9 },
                { day: 'Wednesday', completed: 10, total: 14 },
                { day: 'Thursday', completed: 7, total: 11 },
                { day: 'Friday', completed: 5, total: 8 },
                { day: 'Saturday', completed: 3, total: 4 },
                { day: 'Sunday', completed: 2, total: 3 }
              ].map((dayData) => {
                const rate = Math.round((dayData.completed / dayData.total) * 100);
                return (
                  <div key={dayData.day} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900 w-20">
                        {dayData.day}
                      </span>
                      <div className="flex-1 w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {dayData.completed}/{dayData.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-teal-600" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasksByAssistant.slice(0, 5).map((assistant, index) => (
                <div key={assistant.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      ${index === 0 ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white' : 
                        index === 1 ? 'bg-gray-400 text-white' : 
                        index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{assistant.name}</p>
                      <p className="text-sm text-gray-600">
                        {assistant.completedTasks} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={assistant.completionRate >= 80 ? "default" : "secondary"}
                      className={assistant.completionRate >= 80 ? 
                        "bg-gradient-to-r from-teal-500 to-teal-600 text-white" : 
                        "bg-gray-100 text-gray-700"
                      }
                    >
                      {assistant.completionRate}%
                    </Badge>
                  </div>
                </div>
              ))}
              
              {assistants.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No team members yet</p>
                  <p className="text-sm text-gray-500">Add team members to see performance data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Goals */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-teal-600" />
            Practice Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Tasks Goal */}
            <div className="text-center p-6 rounded-lg border border-gray-100">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Daily Tasks</h3>
              <p className="text-3xl font-bold text-teal-600 mb-1">15</p>
              <p className="text-sm text-gray-600">Target per day</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
                    style={{ width: '73%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">11/15 completed today</p>
              </div>
            </div>

            {/* Weekly Completion */}
            <div className="text-center p-6 rounded-lg border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Completion Rate</h3>
              <p className="text-3xl font-bold text-green-600 mb-1">85%</p>
              <p className="text-sm text-gray-600">Weekly target</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Current: {completionRate}%</p>
              </div>
            </div>

            {/* Patient Satisfaction */}
            <div className="text-center p-6 rounded-lg border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Patient Satisfaction</h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">4.8</p>
              <p className="text-sm text-gray-600">Average rating</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{ width: '96%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Target: 4.5+</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}