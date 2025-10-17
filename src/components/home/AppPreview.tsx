import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, CheckSquare, Clock, User, Building2, BarChart3, Users, ClipboardList, Star, ChevronRight, LayoutDashboard, FileText, CalendarDays, MessageSquare, Settings, BookOpen, Award, TrendingUp, ScrollText, Crown, ChevronDown } from 'lucide-react';
export const AppPreview = () => {
  return <section className="relative overflow-hidden bg-background py-20 sm:py-24 lg:py-32 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
      
      <div className="container mx-auto relative">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            See DentaLeague in Action
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Explore the full-featured dashboards your team will use daily
          </p>
        </div>

        {/* Role Selector */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
          <Tabs defaultValue="owner" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 max-w-xs sm:max-w-md mx-auto mb-6 sm:mb-8">
              <TabsTrigger value="owner" className="flex items-center gap-2 text-xs sm:text-sm">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Owner Dashboard</span>
                <span className="sm:hidden">Owner</span>
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center gap-2 text-xs sm:text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Assistant Dashboard</span>
                <span className="sm:hidden">Assistant</span>
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
        
      </div>
    </section>;
};
const OwnerDashboardPreview = () => {
  const ownerNavItems = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    active: true
  }, {
    id: 'task-calendar',
    label: 'Task Calendar',
    icon: Calendar
  }, {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare
  }, {
    id: 'templates',
    label: 'Templates',
    icon: FileText
  }, {
    id: 'team',
    label: 'Team',
    icon: Users
  }, {
    id: 'schedule',
    label: 'Team Schedule',
    icon: CalendarDays
  }, {
    id: 'logs',
    label: 'Logs',
    icon: ScrollText
  }, {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare
  }, {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3
  }, {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  }];
  return <div className="bg-card rounded-lg sm:rounded-xl shadow-lg border overflow-hidden">
      {/* Browser Header */}
      <div className="bg-muted/50 px-2 sm:px-4 py-2 sm:py-3 border-b flex items-center gap-2">
        <div className="flex gap-1 sm:gap-1.5">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/70" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/70" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 bg-background/80 rounded-md px-2 sm:px-3 py-1 mx-2 sm:mx-4">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">app.dentaleague.com/owner</p>
        </div>
      </div>

      {/* App Interface */}
      <div className="bg-background min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] flex">
        {/* Sidebar Preview */}
        <div className="w-48 sm:w-60 lg:w-72 bg-card border-r p-2 sm:p-3 lg:p-4 hidden md:block">
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
              {ownerNavItems.map(item => {
              const Icon = item.icon;
              return <div key={item.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${item.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>;
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
        <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-y-auto max-h-[400px] sm:max-h-[500px] lg:max-h-[700px]">
          <OwnerDashboardContent />
        </div>
      </div>
    </div>;
};
const AssistantDashboardPreview = () => {
  const assistantNavItems = [{
    id: 'home',
    label: 'Dashboard',
    icon: LayoutDashboard,
    active: true
  }, {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare
  }, {
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar
  }, {
    id: 'stats',
    label: 'My Stats',
    icon: BarChart3
  }, {
    id: 'learning',
    label: 'Learning',
    icon: BookOpen
  }, {
    id: 'certifications',
    label: 'Certifications',
    icon: Award
  }, {
    id: 'feedback',
    label: 'Feedback & Growth',
    icon: TrendingUp
  }, {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  }];
  return <div className="bg-card rounded-xl shadow-lg border overflow-hidden">
      {/* Browser Header */}
      <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
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
      <div className="bg-background min-h-[700px] flex">
        {/* Sidebar Preview */}
        <div className="w-72 bg-card border-r p-4">
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
              {assistantNavItems.map(item => {
              const Icon = item.icon;
              return <div key={item.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${item.active ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:bg-muted/50'}`}>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>;
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
    </div>;
};
const OwnerDashboardContent = () => <div className="space-y-6">
    {/* Overview Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Assistants</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasks Completed (This Week)</p>
              <p className="text-2xl font-bold">87</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patients Assisted (This Month)</p>
              <p className="text-2xl font-bold">342</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <User className="w-4 h-4 mr-2" />
            Approve 3 Pending Requests
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Review Tasks
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="w-4 h-4 mr-2" />
            Manage Schedule
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest updates from your clinic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Tasks completed this week</span>
              <Badge variant="secondary">87</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Active team members</span>
              <Badge variant="secondary">8</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Patients assisted this month</span>
              <Badge variant="secondary">342</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Task Calendar & Analytics */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-600" />
              Task Calendar Overview
            </div>
            <Button variant="ghost" size="sm">
              View Full Calendar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
          <CardDescription>
            Today's schedule, overdue tasks, and weekly overview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Today's Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">24</div>
              <div className="text-sm text-blue-700 font-medium">Today's Tasks</div>
              <div className="text-xs text-muted-foreground mt-1">Dec 4</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">3</div>
              <div className="text-sm text-orange-700 font-medium">Overdue</div>
              <div className="text-xs text-muted-foreground mt-1">Needs attention</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">47</div>
              <div className="text-sm text-green-700 font-medium">This Week</div>
              <div className="text-xs text-muted-foreground mt-1">Total scheduled</div>
            </div>
          </div>
          
          {/* Upcoming Tasks */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Upcoming Tasks
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <div>
                  <div className="font-medium text-sm">Morning sterilization protocol</div>
                  <div className="text-xs text-muted-foreground">Dec 5, 8:00 AM</div>
                </div>
                <Badge variant="destructive" className="text-xs">high</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <div>
                  <div className="font-medium text-sm">Inventory check - supplies</div>
                  <div className="text-xs text-muted-foreground">Dec 5, 2:00 PM</div>
                </div>
                <Badge variant="secondary" className="text-xs">medium</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <div>
                  <div className="font-medium text-sm">Equipment maintenance</div>
                  <div className="text-xs text-muted-foreground">Dec 6, 10:00 AM</div>
                </div>
                <Badge variant="secondary" className="text-xs">low</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Analytics Overview
            </div>
            <Button variant="ghost" size="sm">
              View Details <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
          <CardDescription>
            Performance metrics and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-green-700 font-medium">Task Completion</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-blue-700 font-medium">Avg Tasks/Assistant</div>
            </div>
          </div>
          
          {/* Weekly Trend */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Weekly Trend
            </h4>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="font-medium text-green-800">+15% improvement</span>
              <Badge className="bg-green-100 text-green-800">↑ 15%</Badge>
            </div>
          </div>
          
          {/* Active Tasks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Active Tasks</span>
              <span className="text-sm font-bold">28</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{
              width: '85%'
            }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">85% capacity</div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>;
const AssistantDashboardContent = () => <div className="space-y-8">
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

      {/* Patient Counter */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Patients Assisted Today</p>
              <p className="text-3xl font-bold text-green-800">24</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-200">
                -
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                + Add Patient
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Interactive Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-lg">
        <CardContent className="p-0">
          <div className="absolute inset-0 bg-blue-50 opacity-60" />
          <div className="relative p-4 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  8
                </div>
                <div className="text-xs text-slate-500 font-medium">Pending</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-lg">
        <CardContent className="p-0">
          <div className="absolute inset-0 bg-blue-50 opacity-60" />
          <div className="relative p-4 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  15
                </div>
                <div className="text-xs text-slate-500 font-medium">Completed</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-lg">
        <CardContent className="p-0">
          <div className="absolute inset-0 bg-red-50 opacity-60" />
          <div className="relative p-4 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                  2
                </div>
                <div className="text-xs text-slate-500 font-medium">Overdue</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-rose-500" />
          </div>
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
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="font-medium text-slate-900">Morning sterilization protocol</p>
                <p className="text-sm text-slate-500">General</p>
              </div>
            </div>
            <Badge variant="default">Done</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Patient check-in - Room 2</p>
                <p className="text-sm text-slate-500">Patient Care</p>
              </div>
            </div>
            <Badge variant="secondary">Pending</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="font-medium text-slate-900">Inventory update - supplies</p>
                <p className="text-sm text-slate-500">Administration</p>
              </div>
            </div>
            <Badge variant="default">Done</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <div>
                <p className="font-medium text-slate-900">Equipment maintenance check</p>
                <p className="text-sm text-slate-500">Maintenance</p>
              </div>
            </div>
            <Badge variant="secondary">Pending</Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="group relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-lg">
        <CardContent className="p-0 h-full">
          <div className="absolute inset-0 bg-blue-50 opacity-60" />
          <div className="relative p-4 h-full flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Schedule
                </h3>
              </div>
              <p className="text-slate-600 text-sm mb-3">
                View your upcoming shifts and schedule for the week
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0" size="sm">
              <span className="flex items-center justify-center">
                View Schedule
                <ChevronRight className="w-4 h-4 ml-2" />
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-lg">
        <CardContent className="p-0 h-full">
          <div className="absolute inset-0 bg-blue-50 opacity-60" />
          <div className="relative p-4 h-full flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Certifications
                </h3>
              </div>
              <p className="text-slate-600 text-sm mb-3">
                Manage your professional certifications and track expiry dates
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0" size="sm">
              <span className="flex items-center justify-center">
                View Certifications
                <ChevronRight className="w-4 h-4 ml-2" />
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-lg">
        <CardContent className="p-0 h-full">
          <div className="absolute inset-0 bg-blue-50 opacity-60" />
          <div className="relative p-4 h-full flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  My Stats
                </h3>
              </div>
              <p className="text-slate-600 text-sm mb-3">
                Track your progress, feedback, and professional milestones
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0" size="sm">
              <span className="flex items-center justify-center">
                View My Stats
                <ChevronRight className="w-4 h-4 ml-2" />
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>;