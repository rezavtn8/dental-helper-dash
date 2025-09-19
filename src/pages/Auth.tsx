import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import AuthWidget from '@/components/auth/AuthWidget';
import ClinicSetupForm from '@/components/ClinicSetupForm';
import { AnimatedLogo } from '@/components/ui/animated-logo';

export default function Auth() {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && userProfile && !loading) {
      if (userProfile.role === 'owner') {
        navigate('/owner');
      } else if (userProfile.role === 'assistant') {
        navigate('/assistant');
      } else if (userProfile.role === 'front_desk') {
        navigate('/front-desk');
      }
    }
  }, [user, userProfile, navigate, loading]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-surface to-background">
      
      {/* Floating shapes background - matching landing page */}
      <div className="floating-shapes">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>
      
      {/* Enhanced animated background pattern - matching landing page */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(217_91%_85%_/_0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(217_91%_75%_/_0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(217_91%_90%_/_0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,hsl(217_91%_90%_/_0.05)_50%,transparent_51%)] bg-[length:30px_30px] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_49%,hsl(217_91%_85%_/_0.03)_50%,transparent_51%)] bg-[length:40px_40px]" />
      </div>

      {/* Navigation Header - matching landing page style */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo - matching landing page */}
            <div className="flex items-center space-x-3">
              <AnimatedLogo size={28} animated={false} className="text-primary" />
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  DentaLeague
                </span>
              </div>
            </div>

            {/* Back to Home Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          
          {/* Hero Section - matching landing page style */}
          <div className="text-center mb-12 space-y-8">
            {/* Large Animated Logo */}
            <div className="flex flex-col items-center space-y-4">
              <AnimatedLogo size={120} />
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">DentaLeague</h2>
              </div>
            </div>
            
            {/* Headline - matching landing page typography */}
            <div className="space-y-4">
              <h1 className="text-[2rem] md:text-[2.4rem] font-semibold leading-[2.4rem] md:leading-[2.8rem] bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Complete Your Setup' 
                  : 'Welcome Back'
                }
              </h1>
              <p className="text-[1rem] text-muted-foreground max-w-md mx-auto leading-[1.5rem]">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Let\'s set up your clinic to get started with your dental practice management' 
                  : 'Sign in to your account or create a new one to get started'
                }
              </p>
            </div>
          </div>

          {/* Auth Card - improved styling */}
          <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-8">
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  {/* Refined tab styling to match landing page */}
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-50/80 backdrop-blur-sm rounded-full p-1.5 border border-slate-200/60">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 data-[state=active]:border data-[state=active]:border-slate-200/60 text-slate-600 hover:text-slate-900"
                    >
                      <Crown className="w-4 h-4" />
                      <span className="hidden sm:inline">Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 data-[state=active]:border data-[state=active]:border-slate-200/60 text-slate-600 hover:text-slate-900"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Assistant</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="front_desk" 
                      className="flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/50 data-[state=active]:border data-[state=active]:border-slate-200/60 text-slate-600 hover:text-slate-900"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Front Desk</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-6 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto shadow-lg">
                        <Crown className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">Clinic Owner</h3>
                        <p className="text-muted-foreground text-sm">Manage your clinic and lead your dental team</p>
                      </div>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-6 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto shadow-lg">
                        <UserCheck className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">Dental Assistant</h3>
                        <p className="text-muted-foreground text-sm">Access tasks and track patient care</p>
                      </div>
                    </div>
                    <AuthWidget role="assistant" />
                  </TabsContent>

                  <TabsContent value="front_desk" className="space-y-6 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto shadow-lg">
                        <UserCheck className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">Front Desk</h3>
                        <p className="text-muted-foreground text-sm">Manage reception and patient scheduling</p>
                      </div>
                    </div>
                    <AuthWidget role="front_desk" />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Footer Text - refined styling */}
          <div className="text-center mt-8 text-sm text-muted-foreground space-y-2 opacity-70">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
            <p className="flex items-center justify-center space-x-1">
              <span>🔒</span>
              <span>Secure authentication powered by Supabase</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}