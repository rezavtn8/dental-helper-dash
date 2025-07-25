import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings,
  UserCheck,
  UserX,
  RotateCcw,
  ChevronDown,
  Award,
  Target,
  Activity,
  Zap
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  'due-type': string;
  category: string;
  assigned_to: string | null;
  created_at: string;
}

interface Assistant {
  id: string;
  name: string;
  email: string;
  is_active?: boolean;
}

interface TeamPerformanceTabProps {
  tasks: Task[];
  assistants: Assistant[];
  onAddAssistant?: (assistantData: { name: string; email: string; pin: string }) => Promise<void>;
  onRemoveAssistant?: (assistantId: string) => Promise<void>;
  onToggleAssistantStatus?: (assistantId: string, isActive: boolean) => Promise<void>;
}

const TeamPerformanceTab: React.FC<TeamPerformanceTabProps> = ({ 
  tasks, 
  assistants, 
  onAddAssistant,
  onRemoveAssistant,
  onToggleAssistantStatus
}) => {
  const [expandedAssistant, setExpandedAssistant] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [assistantToRemove, setAssistantToRemove] = useState<Assistant | null>(null);
  
  const [newAssistant, setNewAssistant] = useState({
    name: '',
    email: '',
    pin: ''
  });

  
  // Generate random PIN
  const generateRandomPin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleAddAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddAssistant) return;

    try {
      await onAddAssistant(newAssistant);
      setNewAssistant({ name: '', email: '', pin: '' });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding assistant:', error);
    }
  };

  const handleRemoveAssistant = async () => {
    if (!assistantToRemove || !onRemoveAssistant) return;

    try {
      await onRemoveAssistant(assistantToRemove.id);
      setAssistantToRemove(null);
    } catch (error) {
      console.error('Error removing assistant:', error);
    }
  };

  const handleToggleStatus = async (assistantId: string, currentStatus: boolean) => {
    if (!onToggleAssistantStatus) return;

    try {
      await onToggleAssistantStatus(assistantId, !currentStatus);
    } catch (error) {
      console.error('Error toggling assistant status:', error);
    }
  };

  // Mock data for patient loads and performance metrics
  const getAssistantMetrics = (assistantId: string) => {
    const assistantTasks = tasks.filter(task => task.assigned_to === assistantId);
    const completedTasks = assistantTasks.filter(task => task.status === 'Done');
    const overdueTasks = assistantTasks.filter(task => 
      task.status !== 'Done' && task['due-type'] === 'Before Opening'
    );
    
    // Mock patient data - in real app this would come from patient_logs table
    const todayPatients = Math.floor(Math.random() * 15) + 5; // 5-20 patients today
    const weeklyPatients = Math.floor(Math.random() * 80) + 30; // 30-110 patients this week
    
    const completionRate = assistantTasks.length > 0 
      ? Math.round((completedTasks.length / assistantTasks.length) * 100)
      : 100;

    return {
      completionRate,
      todayPatients,
      weeklyPatients,
      overdueTasks: overdueTasks.length,
      totalTasks: assistantTasks.length,
      completedTasks: completedTasks.length,
      recentTasks: assistantTasks.slice(0, 5)
    };
  };

  // Mock weekly performance data
  const getWeeklyData = (assistantId: string) => [
    { day: 'Mon', completed: Math.floor(Math.random() * 10) + 5, patients: Math.floor(Math.random() * 15) + 8 },
    { day: 'Tue', completed: Math.floor(Math.random() * 10) + 5, patients: Math.floor(Math.random() * 15) + 8 },
    { day: 'Wed', completed: Math.floor(Math.random() * 10) + 5, patients: Math.floor(Math.random() * 15) + 8 },
    { day: 'Thu', completed: Math.floor(Math.random() * 10) + 5, patients: Math.floor(Math.random() * 15) + 8 },
    { day: 'Fri', completed: Math.floor(Math.random() * 10) + 5, patients: Math.floor(Math.random() * 15) + 8 },
    { day: 'Sat', completed: Math.floor(Math.random() * 8) + 2, patients: Math.floor(Math.random() * 10) + 3 },
    { day: 'Sun', completed: Math.floor(Math.random() * 5) + 1, patients: Math.floor(Math.random() * 8) + 2 }
  ];

  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (assistants.length === 0) {
      return {
        totalOverdue: 0,
        topAssistant: null,
        topAssistantRate: 0,
        avgCompletionRate: 0,
        totalAssistants: 0,
        activeAssistants: 0
      };
    }

    const allMetrics = assistants.map(assistant => ({
      assistant,
      metrics: getAssistantMetrics(assistant.id)
    }));

    const totalOverdue = allMetrics.reduce((sum, { metrics }) => sum + metrics.overdueTasks, 0);
    const topAssistant = allMetrics.length > 0 ? allMetrics.reduce((best, current) => 
      current.metrics.completionRate > best.metrics.completionRate ? current : best
    ) : null;

    const avgCompletionRate = allMetrics.length > 0 
      ? Math.round(allMetrics.reduce((sum, { metrics }) => sum + metrics.completionRate, 0) / allMetrics.length)
      : 0;

    return {
      totalOverdue,
      topAssistant: topAssistant?.assistant || null,
      topAssistantRate: topAssistant?.metrics.completionRate || 0,
      avgCompletionRate,
      totalAssistants: assistants.length,
      activeAssistants: assistants.filter(a => a.is_active !== false).length
    };
  }, [assistants, tasks]);

  const chartConfig = {
    completed: {
      label: "Completed Tasks",
      color: "hsl(var(--primary))",
    },
    patients: {
      label: "Patients Assisted",
      color: "hsl(var(--clinical-mint))",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Team Overview Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Team Performance</h2>
            <p className="text-muted-foreground">Monitor your team's productivity and patient care</p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Users className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Assistant</DialogTitle>
                  <DialogDescription>
                    Create a new assistant account for your clinic
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAssistant} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assistant-name">Full Name</Label>
                    <Input
                      id="assistant-name"
                      value={newAssistant.name}
                      onChange={(e) => setNewAssistant({ ...newAssistant, name: e.target.value })}
                      placeholder="Enter assistant's full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assistant-email">Email Address</Label>
                    <Input
                      id="assistant-email"
                      type="email"
                      value={newAssistant.email}
                      onChange={(e) => setNewAssistant({ ...newAssistant, email: e.target.value })}
                      placeholder="assistant@clinic.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assistant-pin">PIN Code</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="assistant-pin"
                        value={newAssistant.pin}
                        onChange={(e) => setNewAssistant({ ...newAssistant, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="4-digit PIN"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNewAssistant({ ...newAssistant, pin: generateRandomPin() })}
                        className="px-3"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The assistant will use this PIN to log in
                    </p>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Add Assistant
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <Badge variant="outline" className="px-3 py-1">
              <Users className="h-3 w-3 mr-1" />
              {teamStats.activeAssistants} Active
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assistants.map((assistant) => {
            const metrics = getAssistantMetrics(assistant.id);
            const isExpanded = expandedAssistant === assistant.id;
            
            return (
              <Card 
                key={assistant.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                  isExpanded ? 'ring-2 ring-primary ring-opacity-20' : ''
                }`}
                onClick={() => setExpandedAssistant(isExpanded ? null : assistant.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {assistant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{assistant.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {assistant.is_active !== false ? (
                            <span className="flex items-center text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-500">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                              Inactive
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Completion Rate */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                        Tasks Completed
                      </span>
                      <span className="font-semibold">{metrics.completionRate}%</span>
                    </div>
                    <Progress 
                      value={metrics.completionRate} 
                      className="h-2"
                    />
                  </div>

                  {/* Patient Load */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-clinical-sky/10 rounded-lg">
                      <div className="font-semibold text-clinical-sky">{metrics.todayPatients}</div>
                      <div className="text-xs text-muted-foreground">Patients Today</div>
                    </div>
                    <div className="text-center p-2 bg-clinical-mint/10 rounded-lg">
                      <div className="font-semibold text-clinical-mint">{metrics.weeklyPatients}</div>
                      <div className="text-xs text-muted-foreground">This Week</div>
                    </div>
                  </div>

                  {/* Overdue Tasks Alert */}
                  {metrics.overdueTasks > 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">
                        {metrics.overdueTasks} overdue task{metrics.overdueTasks > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Expanded Content */}
                  <Collapsible open={isExpanded}>
                    <CollapsibleContent className="space-y-4 pt-4 border-t animate-accordion-down">
                      {/* Weekly Performance Chart */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center">
                          <Activity className="h-3 w-3 mr-1" />
                          Weekly Performance
                        </h4>
                        <div className="h-32">
                          <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getWeeklyData(assistant.id)}>
                                <XAxis 
                                  dataKey="day" 
                                  fontSize={10}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis hide />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar 
                                  dataKey="completed" 
                                  fill="var(--color-completed)"
                                  radius={[2, 2, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </div>

                      {/* Recent Tasks */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Recent Tasks
                        </h4>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {metrics.recentTasks.length > 0 ? (
                            metrics.recentTasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between text-xs p-1">
                                <span className="truncate flex-1">{task.title}</span>
                                <Badge 
                                  variant={task.status === 'Done' ? 'default' : 'secondary'}
                                  className="ml-2 text-xs"
                                >
                                  {task.status}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">No tasks assigned yet</p>
                          )}
                        </div>
                      </div>

                      {/* Admin Controls */}
                      <div className="flex items-center space-x-2 pt-2 border-t">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reset PIN
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reset PIN for {assistant.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will generate a new PIN and the assistant will need to use the new PIN to log in.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction>Reset PIN</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button 
                          variant={assistant.is_active !== false ? "outline" : "default"} 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleToggleStatus(assistant.id, assistant.is_active !== false)}
                        >
                          {assistant.is_active !== false ? (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="text-xs">
                              <UserX className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove <strong>{assistant.name}</strong> from your clinic team.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => setAssistantToRemove(assistant)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Yes, Remove Assistant
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Team Statistics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Team Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Top Performer */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-yellow-600">
                {teamStats.topAssistant?.name || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {teamStats.topAssistantRate}% completion rate
              </p>
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${teamStats.totalOverdue > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {teamStats.totalOverdue}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all assistants
              </p>
            </CardContent>
          </Card>

          {/* Team Average */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Average</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {teamStats.avgCompletionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Task completion rate
              </p>
            </CardContent>
          </Card>

          {/* Productivity Trend */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productivity</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {teamStats.avgCompletionRate > 80 ? '↗' : teamStats.avgCompletionRate > 60 ? '→' : '↘'}
              </div>
              <p className="text-xs text-muted-foreground">
                {teamStats.avgCompletionRate > 80 ? 'Trending up' : teamStats.avgCompletionRate > 60 ? 'Steady' : 'Needs attention'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final Confirmation Dialog for Removing Assistant */}
      <AlertDialog open={!!assistantToRemove} onOpenChange={() => setAssistantToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              🚨 FINAL WARNING - Are you REALLY sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>You are about to <strong>permanently delete</strong> {assistantToRemove?.name} from your clinic system.</p>
              
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="font-semibold text-destructive">This will:</p>
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  <li>Remove all their task assignments</li>
                  <li>Delete their login access permanently</li>
                  <li>Remove them from all clinic records</li>
                  <li>This action <strong>CANNOT BE UNDONE</strong></li>
                </ul>
              </div>
              
              <p className="text-sm">
                Type <strong>DELETE</strong> below to confirm this action:
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2 border rounded-md"
              onChange={(e) => {
                const deleteButton = document.getElementById('final-delete-button') as HTMLButtonElement;
                if (deleteButton) {
                  deleteButton.disabled = e.target.value !== 'DELETE';
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel - Keep Assistant</AlertDialogCancel>
            <AlertDialogAction
              id="final-delete-button"
              disabled={true}
              onClick={handleRemoveAssistant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              🗑️ PERMANENTLY DELETE ASSISTANT
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamPerformanceTab;