import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { LogIn, Shield, Users, CheckCircle, ArrowRight, Stethoscope, Building2, UserCheck, Crown, Calendar, BarChart3, Zap, Heart, Star, Globe, Lock, Clock, TrendingUp, Hand, Undo2, ArrowUp, CalendarDays, MousePointer, Sparkles, Timer, Target, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import AuthWidget from '@/components/auth/AuthWidget';
import ClinicSetupForm from '@/components/ClinicSetupForm';
import { AnimatedLogo } from '@/components/ui/animated-logo';

export default function Home() {
  const navigate = useNavigate();
  const {
    user,
    userProfile,
    loading
  } = useAuth();

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
    <div className="min-h-screen bg-background">
      
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <AnimatedLogo size={24} />
              </div>
              <span className="text-lg font-medium text-foreground">DentaLeague</span>
            </div>
            
            <Button 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full h-9 px-4"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
        {/* Enhanced rough texture overlay */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.4) 1px, transparent 0)`,
          backgroundSize: '15px 15px',
        }}></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 8px 12px, rgba(37, 99, 235, 0.3) 1px, transparent 0)`,
          backgroundSize: '22px 22px',
        }}></div>
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: `radial-gradient(circle at 5px 3px, rgba(29, 78, 216, 0.4) 2px, transparent 0)`,
          backgroundSize: '18px 18px',
        }}></div>
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `radial-gradient(ellipse 3px 1px at 12px 8px, rgba(59, 130, 246, 0.5) 0px, transparent 2px)`,
          backgroundSize: '35px 35px',
        }}></div>
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          
          {/* Hero Content */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium mb-6 text-blue-900 tracking-tight">
              Dental teamwork,
              <br />
              <span className="text-blue-600">simplified.</span>
            </h1>
            
            <p className="text-xl text-blue-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Dentaleague helps dental clinics run smoother — with structured daily tasks, gentle reminders, and tools that support assistants and owners alike.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
              <Button 
                size="lg" 
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full h-12 px-8 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
              >
                Start your clinic
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full h-12 px-8 text-base font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Learn more
              </Button>
            </div>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            
            {/* Assistant Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg font-medium text-blue-900">Assistant Hub</CardTitle>
                    <CardDescription className="text-sm text-blue-600">A daily homebase for every assistant</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-blue-200 shadow-sm">
                    <span className="text-sm font-medium text-blue-800">Room Preparation</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-blue-200 shadow-sm">
                    <span className="text-sm font-medium text-blue-800">Patient Check-in</span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full shadow-sm"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Owner Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg font-medium text-blue-900">Clinic Dashboard</CardTitle>
                    <CardDescription className="text-sm text-blue-600">Support your team with structure</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-blue-200 shadow-sm">
                    <span className="text-sm font-medium text-blue-800">Create recurring tasks</span>
                    <Crown className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-blue-200 shadow-sm">
                    <span className="text-sm font-medium text-blue-800">View daily task status</span>
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center gap-8 text-blue-600 text-sm bg-white/60 backdrop-blur-sm rounded-full px-8 py-4 border border-blue-200 shadow-lg">
            <span className="font-medium">2000+ Dental Patients Served Daily</span>
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <span className="font-medium">500+ Dental Teams</span>
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <span className="font-medium">99.9% Uptime</span>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="container mx-auto px-6 py-20 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
        {/* Enhanced rough texture overlay */}
        <div className="absolute inset-0 opacity-35" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.5) 1px, transparent 0)`,
          backgroundSize: '18px 18px',
        }}></div>
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: `radial-gradient(circle at 10px 15px, rgba(37, 99, 235, 0.4) 1px, transparent 0)`,
          backgroundSize: '25px 25px',
        }}></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(ellipse 2px 1px at 6px 9px, rgba(29, 78, 216, 0.6) 0px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}></div>
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `radial-gradient(circle at 20px 5px, rgba(59, 130, 246, 0.3) 2px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}></div>
        
        <div className="max-w-md mx-auto relative z-10">
          <Card className="border-2 border-blue-300 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <AnimatedLogo size={24} />
              </div>
              <CardTitle className="text-2xl font-medium text-blue-900">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? 'Complete Setup' : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-base text-blue-600">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? 'Set up your clinic information' : 'Choose your role to continue'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-50 p-1 h-11 rounded-xl border border-blue-200">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Assistant</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-4">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-medium mb-1 text-blue-900">Clinic Owner</h3>
                      <p className="text-blue-600 text-sm mb-4">Manage your clinic and team</p>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-4">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-medium mb-1 text-blue-900">Dental Assistant</h3>
                      <p className="text-blue-600 text-sm mb-4">Access your daily task list and patient tracking</p>
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
      <section id="features" className="container mx-auto px-6 py-20 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
        {/* Enhanced texture overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 3px 3px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 15px 8px, rgba(37, 99, 235, 0.25) 1px, transparent 0)`,
          backgroundSize: '35px 35px',
        }}></div>
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `radial-gradient(ellipse 4px 2px at 22px 18px, rgba(29, 78, 216, 0.4) 0px, transparent 2px)`,
          backgroundSize: '45px 45px',
        }}></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 8px 25px, rgba(59, 130, 246, 0.5) 2px, transparent 0)`,
          backgroundSize: '55px 55px',
        }}></div>
        
        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-medium text-blue-900 mb-6">
            Why Choose Dentaleague?
          </h2>
          <p className="text-xl text-blue-600">
            Built for dental teams who value gentle structure, clear communication, and smooth daily operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative z-10">
          
          {/* Feature 1 */}
          <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-white hover:shadow-2xl transition-all duration-300 hover:from-blue-100 hover:to-blue-50 group">
            <CardHeader className="text-center pb-6">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-medium mb-2 text-blue-900">Assistant Hub</CardTitle>
              <CardDescription className="text-base text-blue-600">
                Start every shift with clarity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <CheckCircle className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm text-blue-700">Auto-updated task list</span>
                </div>
                <div className="flex items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <CheckCircle className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm text-blue-700">Gentle reminders & tracking</span>
                </div>
                <div className="flex items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <CheckCircle className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm text-blue-700">Patient check-in tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-2 border-blue-300 shadow-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:shadow-2xl transition-all duration-300 hover:from-blue-700 hover:to-blue-800 group text-white">
            <CardHeader className="text-center pb-6">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-medium mb-2 text-white">Clinic Dashboard</CardTitle>
              <CardDescription className="text-base text-blue-100">
                Keep everyone in sync — no clipboard needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-2 bg-white/10 rounded-lg border border-white/20">
                  <CheckCircle className="w-4 h-4 mr-3 text-blue-200" />
                  <span className="text-sm text-white">Auto-repeat daily tasks</span>
                </div>
                <div className="flex items-center p-2 bg-white/10 rounded-lg border border-white/20">
                  <CheckCircle className="w-4 h-4 mr-3 text-blue-200" />
                  <span className="text-sm text-white">Spot bottlenecks early</span>
                </div>
                <div className="flex items-center p-2 bg-white/10 rounded-lg border border-white/20">
                  <CheckCircle className="w-4 h-4 mr-3 text-blue-200" />
                  <span className="text-sm text-white">Review without micromanaging</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-white hover:shadow-2xl transition-all duration-300 hover:from-blue-100 hover:to-blue-50 group">
            <CardHeader className="text-center pb-6">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-medium mb-2 text-blue-900">Trust comes built-in</CardTitle>
              <CardDescription className="text-base text-blue-600">
                HIPAA-compliant and secure, syncs across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <CheckCircle className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm text-blue-700">HIPAA compliance</span>
                </div>
                <div className="flex items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <CheckCircle className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm text-blue-700">Multi-op, multi-location</span>
                </div>
                <div className="flex items-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <CheckCircle className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm text-blue-700">Mobile optimized</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center relative z-10">
          <Button 
            size="lg" 
            onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-full h-12 px-8 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
          >
            Start Your Dental Hub
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-blue-600 to-blue-700 py-16 text-white relative overflow-hidden">
        {/* Intense dark texture overlay for footer */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(30, 58, 138, 0.6) 1px, transparent 0)`,
          backgroundSize: '12px 12px',
        }}></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 6px 9px, rgba(15, 23, 42, 0.5) 1px, transparent 0)`,
          backgroundSize: '18px 18px',
        }}></div>
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: `radial-gradient(ellipse 3px 1px at 4px 6px, rgba(30, 58, 138, 0.7) 0px, transparent 1px)`,
          backgroundSize: '15px 15px',
        }}></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 12px 3px, rgba(15, 23, 42, 0.6) 2px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                <AnimatedLogo size={20} />
              </div>
              <span className="text-lg font-medium text-white">DentaLeague</span>
            </div>

            <div className="flex justify-center items-center gap-8 mb-8 text-sm text-blue-100">
              <div className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <Lock className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <Globe className="w-4 h-4" />
                <span>99.9% Uptime</span>
              </div>
            </div>

            <div className="border-t border-white/20 pt-8">
              <p className="text-blue-200 text-sm">
                &copy; 2024 DentaLeague. Empowering dental teams with gentle structure and clear communication.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}