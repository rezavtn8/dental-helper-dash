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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      
      {/* Simplified background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 w-full bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <AnimatedLogo size={32} animated={false} className="text-primary" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">
                  DentaLeague
                </span>
              </div>
            </div>

            {/* Back to Home Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm font-medium flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          
          {/* Hero Section */}
          <div className="text-center mb-10 space-y-6">
            {/* Animated Logo */}
            <div className="flex justify-center mb-8">
              <AnimatedLogo size={80} className="text-primary" />
            </div>
            
            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Complete Your Setup' 
                  : 'Welcome to DentaLeague'
                }
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Let\'s set up your clinic to get started with your dental practice management' 
                  : 'Sign in to your account or create a new one to get started'
                }
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="bg-card/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-10">
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  {/* Modern tab styling */}
                  <TabsList className="grid w-full grid-cols-3 mb-10 bg-muted/50 rounded-lg p-1">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center justify-center space-x-2 py-3 text-sm font-semibold rounded-md"
                    >
                      <Crown className="w-4 h-4" />
                      <span className="hidden sm:inline">Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center justify-center space-x-2 py-3 text-sm font-semibold rounded-md"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Assistant</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="front_desk" 
                      className="flex items-center justify-center space-x-2 py-3 text-sm font-semibold rounded-md"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Front Desk</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-6 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto border border-blue-100">
                        <Crown className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">Clinic Owner</h3>
                        <p className="text-muted-foreground text-sm">Manage your clinic and lead your dental team</p>
                      </div>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-6 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto border border-green-100">
                        <UserCheck className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">Dental Assistant</h3>
                        <p className="text-muted-foreground text-sm">Access tasks and track patient care</p>
                      </div>
                    </div>
                    <AuthWidget role="assistant" />
                  </TabsContent>

                  <TabsContent value="front_desk" className="space-y-6 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto border border-purple-100">
                        <UserCheck className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">Front Desk</h3>
                        <p className="text-muted-foreground text-sm">Manage reception and patient scheduling</p>
                      </div>
                    </div>
                    <AuthWidget role="front_desk" />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Footer Text */}
          <div className="text-center mt-10 text-sm text-muted-foreground space-y-3">
            <p>By continuing, you agree to our <span className="text-foreground font-medium">Terms of Service</span> and <span className="text-foreground font-medium">Privacy Policy</span></p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure authentication powered by Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}