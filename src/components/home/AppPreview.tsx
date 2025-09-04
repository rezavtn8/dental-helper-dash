import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  Building2,
  BarChart3,
  Users,
  ClipboardList,
  Star,
  ChevronRight
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
            Get a glimpse of the intuitive dashboard your team will use daily
          </p>
        </div>

        {/* Browser Window Frame */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-background to-muted/50 rounded-xl shadow-2xl border overflow-hidden">
            {/* Browser Header */}
            <div className="bg-muted/80 px-4 py-3 border-b flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 bg-background/80 rounded-md px-3 py-1 mx-4">
                <p className="text-sm text-muted-foreground">app.dentaleague.com/dashboard</p>
              </div>
            </div>

            {/* App Interface */}
            <div className="bg-gradient-to-br from-background to-muted/20 min-h-[700px] flex">
              {/* Sidebar Preview */}
              <div className="w-64 bg-card/80 border-r p-4 hidden md:block">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Building2 className="w-6 h-6 text-primary" />
                    <span className="font-semibold">Smile Dental</span>
                  </div>
                  
                  <nav className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted/50 rounded-lg">
                      <ClipboardList className="w-4 h-4" />
                      <span className="text-sm">Tasks</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted/50 rounded-lg">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Team</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted/50 rounded-lg">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Schedule</span>
                    </div>
                  </nav>
                </div>
              </div>

              {/* Main Dashboard Preview */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[700px]">
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
                          <p className="text-sm text-muted-foreground">Tasks Complete</p>
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
                          <p className="text-sm text-muted-foreground">Team Score</p>
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
                    {/* Task List Preview */}
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
                            <p className="font-medium text-sm">Sterilize instruments - Room 2</p>
                            <p className="text-xs text-muted-foreground">Completed by Emma • 9:15 AM</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Done</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <Clock className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Prepare Room 1 for Dr. Johnson</p>
                            <p className="text-xs text-muted-foreground">Due in 15 minutes • High Priority</p>
                          </div>
                          <Badge className="bg-primary text-primary-foreground">In Progress</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Patient check-in - Mrs. Davis</p>
                            <p className="text-xs text-muted-foreground">Scheduled 2:30 PM</p>
                          </div>
                          <Badge variant="outline">Pending</Badge>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Inventory check - Supplies closet</p>
                            <p className="text-xs text-muted-foreground">Weekly routine</p>
                          </div>
                          <Badge variant="outline">Pending</Badge>
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

                    {/* Schedule Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Today's Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-2">
                            <div className="text-center min-w-[60px]">
                              <p className="text-xs text-muted-foreground">9:00 AM</p>
                            </div>
                            <div className="w-1 h-8 bg-green-400 rounded-full" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Mrs. Johnson - Cleaning</p>
                              <p className="text-xs text-muted-foreground">Room 1 • Dr. Smith</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2">
                            <div className="text-center min-w-[60px]">
                              <p className="text-xs text-muted-foreground">10:30 AM</p>
                            </div>
                            <div className="w-1 h-8 bg-blue-400 rounded-full" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Mr. Davis - Filling</p>
                              <p className="text-xs text-muted-foreground">Room 2 • Dr. Johnson</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2">
                            <div className="text-center min-w-[60px]">
                              <p className="text-xs text-muted-foreground">2:00 PM</p>
                            </div>
                            <div className="w-1 h-8 bg-purple-400 rounded-full" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Emergency - Walk-in</p>
                              <p className="text-xs text-muted-foreground">Room 3 • Available</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Team & Analytics */}
                  <div className="space-y-6">
                    {/* Team Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Team Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Sarah M.</p>
                            <p className="text-xs text-muted-foreground">18/23 tasks • Active</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Emma K.</p>
                            <p className="text-xs text-muted-foreground">12/15 tasks • Active</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Mike R.</p>
                            <p className="text-xs text-muted-foreground">Off today</p>
                          </div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Analytics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          This Week
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Task Completion</span>
                            <span className="font-medium">94%</span>
                          </div>
                          <div className="w-full bg-muted/50 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}} />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Patient Satisfaction</span>
                            <span className="font-medium">4.9/5</span>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({length: 5}).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">127</p>
                            <p className="text-xs text-muted-foreground">Patients served</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Below Preview */}
          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              Try DentaLeague Free
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground mt-2">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </div>
    </section>
  );
};