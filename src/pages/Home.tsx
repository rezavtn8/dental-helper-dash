import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  LogIn, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Stethoscope, 
  Building2, 
  UserCheck, 
  Crown,
  Calendar,
  BarChart3,
  Zap,
  Heart,
  Star,
  Globe,
  Lock,
  Clock,
  TrendingUp,
  Hand,
  Undo2,
  ArrowUp,
  CalendarDays,
  MousePointer,
  Sparkles,
  Timer,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import AuthWidget from '@/components/auth/AuthWidget';
import ClinicSetupForm from '@/components/ClinicSetupForm';

export default function Home() {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && userProfile && !loading) {
      if (userProfile.role === 'owner') {
        navigate('/owner');
      } else if (userProfile.role === 'assistant') {
        navigate('/assistant');
      }
    }
  }, [user, userProfile, navigate, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 relative overflow-hidden">
      
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
                  ClinicFlow
                </span>
                <div className="text-xs text-blue-600 font-medium tracking-wide">HEALTHCARE PLATFORM</div>
              </div>
            </div>
            
            <Button 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })} 
              variant="default"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <LogIn className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-5xl mx-auto">
          
          {/* Badge */}
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1 text-sm font-medium border-0">
            <Stethoscope className="w-4 h-4 mr-2" />
            Complete Healthcare Platform
          </Badge>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 bg-clip-text text-transparent">
              Healthcare
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
              Operations Hub
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-blue-800/80 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Complete clinic management platform with Assistant Hub, Owner Dashboard, 
            team coordination, and intelligent workflow automation.
          </p>

          {/* Interactive Demo Preview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-12 max-w-6xl mx-auto border border-blue-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold text-blue-900 mb-2">Dual Dashboard System</h3>
              <p className="text-blue-700">Specialized interfaces for owners and assistants</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Assistant Hub */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-900">Assistant Hub</h4>
                    <p className="text-sm text-green-600">Daily task management</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="text-sm text-blue-900">Room Preparation</span>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Hand className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="text-sm text-blue-900">Patient Check-in</span>
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <Undo2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Owner Dashboard */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-900">Owner Dashboard</h4>
                    <p className="text-sm text-indigo-600">Team & clinic oversight</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="text-sm text-blue-900">Team Analytics</span>
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="text-sm text-blue-900">Task Templates</span>
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <CalendarDays className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-900">Calendar Integration</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-900">Team Management</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-white rounded-lg border border-teal-100">
                <TrendingUp className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-900">Analytics & Reports</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-white rounded-lg border border-rose-100">
                <Shield className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-900">HIPAA Compliance</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center items-center gap-8 mb-12 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-blue-900">500+</div>
              <div className="text-blue-600 text-sm font-medium">Active Clinics</div>
            </div>
            <div className="w-px h-12 bg-blue-200 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-blue-900">15K+</div>
              <div className="text-blue-600 text-sm font-medium">Healthcare Staff</div>
            </div>
            <div className="w-px h-12 bg-blue-200 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-blue-900">99.9%</div>
              <div className="text-blue-600 text-sm font-medium">Platform Uptime</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-105"
            >
              <Stethoscope className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Start Your Clinic Hub
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold transition-all duration-300 group"
            >
              <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Explore All Features
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="font-medium">4.9/5 from 200+ reviews</span>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border border-blue-100/50 overflow-hidden bg-white/95 backdrop-blur-md">
            <CardHeader className="text-center py-6 bg-gradient-to-br from-blue-50/80 to-white/50">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-display font-bold text-blue-900">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Complete Setup' 
                  : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-sm text-blue-700">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id
                  ? 'Set up your clinic information'
                  : 'Choose your role to continue'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-50 p-1 h-12">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Assistant</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-3">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Crown className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-display font-bold text-blue-900 mb-1">Clinic Owner</h3>
                      <p className="text-blue-700 text-xs mb-3">Manage your clinic and team</p>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-3">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-display font-bold text-blue-900 mb-1">Healthcare Assistant</h3>
                      <p className="text-blue-700 text-xs mb-3">Access your workspace and tasks</p>
                    </div>
                    <AuthWidget role="assistant" />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
        <div className="container mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <Badge className="mb-6 bg-blue-100 text-blue-700 px-4 py-1 text-sm font-medium border-0">
              <Building2 className="w-4 h-4 mr-2" />
              Complete Healthcare Management Suite
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Everything Your
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                Clinic Needs
              </span>
            </h2>
            
            <p className="text-xl text-blue-100 leading-relaxed">
              From Assistant Hub to Owner Dashboard - comprehensive tools for every role in your healthcare team.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Feature 1 - Assistant Hub */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-300/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-bold text-white mb-3">Assistant Hub</CardTitle>
                <CardDescription className="text-blue-200 text-base leading-relaxed">
                  Dedicated workspace for healthcare assistants with task management, calendar, and team coordination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    <span className="text-sm">Today's tasks overview</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    <span className="text-sm">One-click task completion</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    <span className="text-sm">Calendar integration</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    <span className="text-sm">Performance tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 - Owner Dashboard */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-300/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-bold text-white mb-3">Owner Dashboard</CardTitle>
                <CardDescription className="text-blue-200 text-base leading-relaxed">
                  Comprehensive clinic management with team oversight, analytics, and task template creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm">Team management</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm">Task template builder</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm">Analytics & insights</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm">Clinic configuration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 - Smart Features */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-300/20 hover:bg-white/15 transition-all duration-300 group transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display font-bold text-white mb-3">Smart Automation</CardTitle>
                <CardDescription className="text-blue-200 text-base leading-relaxed">
                  Intelligent features that streamline workflows and enhance productivity across your entire team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                    <span className="text-sm">Instant undo actions</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                    <span className="text-sm">Real-time synchronization</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                    <span className="text-sm">HIPAA compliance</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                    <span className="text-sm">Mobile optimized</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-blue-300/10">
            <h3 className="text-3xl font-display font-bold text-white text-center mb-8">More Powerful Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Analytics Dashboard</h4>
                <p className="text-blue-200 text-sm">Track performance, identify trends, optimize workflows</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Calendar Views</h4>
                <p className="text-blue-200 text-sm">Weekly schedules, task planning, appointment integration</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Template System</h4>
                <p className="text-blue-200 text-sm">Create, share, and manage task templates across teams</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Real-time Updates</h4>
                <p className="text-blue-200 text-sm">Instant notifications, live status updates, team coordination</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:scale-105"
            >
              <Building2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Launch Your Healthcare Hub
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-blue-950 border-t border-blue-800 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            
            {/* Logo */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-white">ClinicFlow</span>
                <div className="text-xs text-blue-300 font-medium tracking-wide">HEALTHCARE PLATFORM</div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center items-center gap-8 mb-8 flex-wrap">
              <div className="flex items-center space-x-2 text-blue-300">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-300">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-300">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-blue-800 pt-8">
              <p className="text-blue-300 text-sm">
                &copy; 2024 ClinicFlow. All rights reserved. Empowering healthcare teams worldwide with intelligent practice management.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}