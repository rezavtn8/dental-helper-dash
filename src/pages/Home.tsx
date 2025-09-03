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
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Hero Content */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium mb-6 text-foreground tracking-tight">
              Healthcare management
              <br />
              <span className="text-muted-foreground">made simple</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Streamlined practice management platform designed for modern healthcare teams
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
              <Button 
                size="lg" 
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full h-12 px-8 text-base font-medium"
              >
                Start your practice
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              
              <Button 
                size="lg" 
                variant="ghost" 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full h-12 px-8 text-base font-medium"
              >
                Learn more
              </Button>
            </div>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            
            {/* Assistant Card */}
            <Card className="border-0 shadow-sm bg-card/50 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg font-medium">Assistant Hub</CardTitle>
                    <CardDescription className="text-sm">Daily workflow management</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm font-medium">Room Preparation</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm font-medium">Patient Check-in</span>
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Owner Card */}
            <Card className="border-0 shadow-sm bg-card/50 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg font-medium">Owner Dashboard</CardTitle>
                    <CardDescription className="text-sm">Practice oversight & analytics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm font-medium">Team Analytics</span>
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm font-medium">Task Templates</span>
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center gap-8 text-muted-foreground text-sm">
            <span>500+ Active Clinics</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span>15K+ Healthcare Staff</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span>99.9% Uptime</span>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg bg-card">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AnimatedLogo size={24} />
              </div>
              <CardTitle className="text-2xl font-medium">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? 'Complete Setup' : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? 'Set up your clinic information' : 'Choose your role to continue'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 h-11 rounded-xl">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium rounded-lg"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium rounded-lg"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Assistant</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-4">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Crown className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-base font-medium mb-1">Clinic Owner</h3>
                      <p className="text-muted-foreground text-sm mb-4">Manage your clinic and team</p>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-4">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <UserCheck className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="text-base font-medium mb-1">Healthcare Assistant</h3>
                      <p className="text-muted-foreground text-sm mb-4">Access your workspace and tasks</p>
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
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-medium text-foreground mb-6">
            Everything you need
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful tools designed for modern healthcare teams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Feature 1 */}
          <Card className="border-0 shadow-sm bg-card/50">
            <CardHeader className="text-center pb-6">
              <div className="w-14 h-14 mx-auto mb-4 bg-accent/10 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="text-xl font-medium mb-2">Assistant Hub</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Streamlined task management for healthcare assistants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-accent" />
                  <span className="text-sm">Daily task overview</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-accent" />
                  <span className="text-sm">One-click completion</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-accent" />
                  <span className="text-sm">Performance tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-0 shadow-sm bg-card/50">
            <CardHeader className="text-center pb-6">
              <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Crown className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl font-medium mb-2">Owner Dashboard</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Comprehensive clinic management and oversight
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-primary" />
                  <span className="text-sm">Team management</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-primary" />
                  <span className="text-sm">Task templates</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-primary" />
                  <span className="text-sm">Analytics & insights</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-0 shadow-sm bg-card/50">
            <CardHeader className="text-center pb-6">
              <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <CardTitle className="text-xl font-medium mb-2">Secure & Compliant</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                HIPAA-compliant platform with enterprise security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                  <span className="text-sm">HIPAA compliance</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                  <span className="text-sm">Real-time sync</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                  <span className="text-sm">Mobile optimized</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-full h-12 px-8 text-base font-medium"
          >
            Start Your Practice Hub
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <AnimatedLogo size={20} />
              </div>
              <span className="text-lg font-medium text-foreground">DentaLeague</span>
            </div>

            <div className="flex justify-center items-center gap-8 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>99.9% Uptime</span>
              </div>
            </div>

            <div className="border-t pt-8">
              <p className="text-muted-foreground text-sm">
                &copy; 2024 DentaLeague. Empowering healthcare teams with intelligent practice management.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}