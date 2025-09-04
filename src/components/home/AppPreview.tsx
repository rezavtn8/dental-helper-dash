import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  CheckCircle,
  CheckSquare,
  Clock, 
  User, 
  Building2,
  BarChart3,
  Users,
  ClipboardList,
  Star,
  ChevronRight,
  LayoutDashboard,
  FileText,
  CalendarDays,
  MessageSquare,
  Settings,
  BookOpen,
  Award,
  TrendingUp,
  ScrollText,
  Crown,
  ChevronDown
} from 'lucide-react';

export const AppPreview = () => {
  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-br from-muted/20 via-background to-muted/30">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            See DentaLeague in Action
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore the full-featured dashboards your team will use daily
          </p>
        </div>

        {/* Role Selector */}
        <div className="max-w-6xl mx-auto mb-8">
          <Tabs defaultValue="owner" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="owner" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Owner Dashboard
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Assistant Dashboard
              </TabsTrigger>
            </TabsList>

            {/* Owner Dashboard Preview */}
            <TabsContent value="owner">
              <OwnerDashboardPreview />
            </TabsContent>

            {/* Assistant Dashboard Preview */}
            <TabsContent value="assistant">
              <AssistantDashboardPreview />
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA Below Preview */}
        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            Try DentaLeague Free
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-2">No credit card required • 14-day free trial</p>
        </div>
      </div>
    </section>
  );
};

const OwnerDashboardPreview = () => {
  const ownerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
    { id: 'task-calendar', label: 'Task Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'schedule', label: 'Team Schedule', icon: CalendarDays },
    { id: 'logs', label: 'Logs', icon: ScrollText },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-gradient-to-br from-background to-muted/50 rounded-xl shadow-2xl border overflow-hidden">
      {/* Browser Header */}
      <div className="bg-muted/80 px-4 py-3 border-b flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 bg-background/80 rounded-md px-3 py-1 mx-4">
          <p className="text-sm text-muted-foreground">app.dentaleague.com/owner</p>
        </div>
      </div>

      {/* App Interface */}
      <div className="bg-gradient-to-br from-background to-muted/20 min-h-[700px] flex">
        {/* Sidebar Preview */}
        <div className="w-72 bg-card/80 border-r p-4">
          <div className="space-y-6">
            {/* Clinic Header */}
            <div className="flex items-center gap-2 pb-4 border-b">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Smile Dental Practice</h1>
                <p className="text-xs text-muted-foreground">Owner Portal</p>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">DR</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Dr. Roberts</p>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs">
                  <Crown className="w-2.5 h-2.5 mr-1" />
                  Owner
                </Badge>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>
            
            <nav className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-2">NAVIGATION</p>
              {ownerNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    item.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                );
              })}
            </nav>

            {/* Clinic Code */}
            <div className="bg-muted/50 rounded-lg p-3 border mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Clinic Code</p>
              <p className="font-mono text-xs font-semibold tracking-wide">SMILE2024</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[700px]">
          <OwnerDashboardContent />
        </div>
      </div>
    </div>
  );
};

const AssistantDashboardPreview = () => {
  const assistantNavItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard, active: true },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'stats', label: 'My Stats', icon: BarChart3 },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'feedback', label: 'Feedback & Growth', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-gradient-to-br from-background to-muted/50 rounded-xl shadow-2xl border overflow-hidden">
      {/* Browser Header */}
      <div className="bg-muted/80 px-4 py-3 border-b flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 bg-background/80 rounded-md px-3 py-1 mx-4">
          <p className="text-sm text-muted-foreground">app.dentaleague.com/assistant</p>
        </div>
      </div>

      {/* App Interface */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-[700px] flex">
        {/* Sidebar Preview */}
        <div className="w-72 bg-white/95 border-r p-4">
          <div className="space-y-6">
            {/* Clinic Header */}
            <div className="flex items-center gap-2 pb-4 border-b">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Smile Dental Practice</h1>
                <p className="text-xs text-muted-foreground">Clinic Dashboard</p>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">SM</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Sarah Miller</p>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs">
                  Assistant
                </Badge>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>
            
            <nav className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-2">NAVIGATION</p>
              {assistantNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    item.active ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:bg-muted/50'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                );
              })}
            </nav>

            {/* Clinic Code */}
            <div className="bg-muted/50 rounded-lg p-3 border mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Clinic Code</p>
              <p className="font-mono text-xs font-semibold tracking-wide">SMILE2024</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[700px]">
          <AssistantDashboardContent />
        </div>
      </div>
    </div>
  );
};

const OwnerDashboardContent = () => (
  <div>
    {/* Dashboard Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Owner Dashboard 👑</h1>
        <p className="text-muted-foreground">Manage your clinic operations and team performance</p>
      </div>
      <Button size="sm" className="hidden sm:flex">
        <Users className="w-4 h-4 mr-2" />
        Manage Team
      </Button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Assistants</p>
              <p className="text-2xl font-bold text-green-700">8</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              <p className="text-2xl font-bold text-blue-700">142/150</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-purple-700">4.9</p>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-orange-700">$24.5K</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Two Column Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Performance Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Sarah M.", tasks: "18/23", score: 94, status: "active" },
            { name: "Emma K.", tasks: "15/15", score: 98, status: "active" },
            { name: "Mike R.", tasks: "12/20", score: 87, status: "active" },
            { name: "Lisa P.", tasks: "8/12", score: 92, status: "break" },
          ].map((member) => (
            <div key={member.name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">{member.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.tasks} tasks • {member.score}% score</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-orange-400'}`} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <div className="flex-1">
              <p><strong>Sarah</strong> completed sterilization protocol</p>
              <p className="text-xs text-muted-foreground">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 text-sm">
            <Users className="w-4 h-4 text-blue-500" />
            <div className="flex-1">
              <p><strong>Emma</strong> joined team meeting</p>
              <p className="text-xs text-muted-foreground">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 text-sm">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <div className="flex-1">
              <p>Patient feedback received: 5 stars</p>
              <p className="text-xs text-muted-foreground">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 text-sm">
            <FileText className="w-4 h-4 text-orange-500" />
            <div className="flex-1">
              <p>New template created: "Morning Setup"</p>
              <p className="text-xs text-muted-foreground">3 hours ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const AssistantDashboardContent = () => (
  <div>
    {/* Dashboard Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Good morning, Sarah! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening at your clinic today</p>
      </div>
      <Button size="sm" className="hidden sm:flex">
        <CheckCircle className="w-4 h-4 mr-2" />
        Mark Complete
      </Button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Patients Today</p>
              <p className="text-2xl font-bold text-green-700">24</p>
            </div>
            <User className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">My Tasks</p>
              <p className="text-2xl font-bold text-blue-700">18/23</p>
            </div>
            <ClipboardList className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">My Score</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-purple-700">4.9</p>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Two Column Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Tasks */}
      <div className="lg:col-span-2 space-y-6">
        {/* Priority Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Priority Tasks
              <Badge variant="destructive">2 urgent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <Clock className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Prepare Room 1 for emergency</p>
                <p className="text-xs text-muted-foreground">Due now • High Priority</p>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Clock className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Equipment maintenance - Unit 3</p>
                <p className="text-xs text-muted-foreground">Overdue by 2 days</p>
              </div>
              <Badge variant="destructive">Overdue</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Today's Tasks
              <Badge variant="secondary">5 remaining</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Morning sterilization protocol</p>
                <p className="text-xs text-muted-foreground">Completed at 8:30 AM</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Done</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Clock className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Patient check-in - Mrs. Johnson</p>
                <p className="text-xs text-muted-foreground">Due in 15 minutes</p>
              </div>
              <Badge className="bg-primary text-primary-foreground">In Progress</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm">Afternoon inventory check</p>
                <p className="text-xs text-muted-foreground">Scheduled 2:30 PM</p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Info */}
      <div className="space-y-6">
        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sterilization Course</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Patient Care Module</span>
                <span className="font-medium">Complete</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full" />
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-3">
              Continue Learning
            </Button>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Perfect Week</p>
                <p className="text-xs text-muted-foreground">All tasks completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">5-Star Rating</p>
                <p className="text-xs text-muted-foreground">Patient feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);