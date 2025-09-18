import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import AuthWidget from '@/components/auth/AuthWidget';
import ClinicSetupForm from '@/components/ClinicSetupForm';
import { StaticLogo } from '@/components/ui/static-logo';

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
    <div className="min-h-screen relative overflow-hidden" 
         style={{ background: 'var(--gradient-hero)' }}>
      
      {/* Floating geometric shapes */}
      <div className="floating-shapes">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>

      {/* Additional avant-garde elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-accent/5 blur-xl"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-blue-400/10 blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rotate-45 bg-blue-200/20 blur-sm"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full py-6 px-4 lg:px-8">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <StaticLogo size={32} className="text-accent" />
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold text-accent">
                DentaLeague
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">dental teamwork, simplified</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-muted-foreground hover:text-accent glow-effect rounded-xl"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          
          {/* Large Logo Section */}
          <div className="text-center mb-12 space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl scale-150"></div>
              <div className="flex flex-col items-center space-y-3 mb-6">
                <StaticLogo size={64} className="text-accent" />
                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">DentaLeague</h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">dental teamwork, simplified</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-display font-bold text-foreground">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Complete Your Setup' 
                  : 'Welcome to DentaLeague'
                }
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Let\'s set up your clinic to get started with your dental practice management' 
                  : 'Modern dental practice management made simple and efficient'
                }
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-8">
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-surface-muted/50 p-2 h-14 rounded-2xl backdrop-blur-sm">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center space-x-2 py-3 text-sm font-medium rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all duration-200"
                    >
                      <Crown className="w-5 h-5" />
                      <span>Clinic Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center space-x-2 py-3 text-sm font-medium rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all duration-200"
                    >
                      <UserCheck className="w-5 h-5" />
                      <span>Assistant</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="front_desk" 
                      className="flex items-center space-x-2 py-3 text-sm font-medium rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all duration-200"
                    >
                      <UserCheck className="w-5 h-5" />
                      <span>Front Desk</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-6 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg glass-card">
                        <Crown className="w-8 h-8 text-accent" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-display font-semibold text-foreground">Clinic Owner</h3>
                        <p className="text-muted-foreground">Manage your clinic and lead your dental team to excellence</p>
                      </div>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-6 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg glass-card">
                        <UserCheck className="w-8 h-8 text-accent" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-display font-semibold text-foreground">Dental Assistant</h3>
                        <p className="text-muted-foreground">Access your tasks and track patient care seamlessly</p>
                      </div>
                    </div>
                    <AuthWidget role="assistant" />
                  </TabsContent>

                  <TabsContent value="front_desk" className="space-y-6 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg glass-card">
                        <UserCheck className="w-8 h-8 text-accent" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-display font-semibold text-foreground">Front Desk</h3>
                        <p className="text-muted-foreground">Manage reception tasks and patient scheduling efficiently</p>
                      </div>
                    </div>
                    <AuthWidget role="front_desk" />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Footer Text */}
          <div className="text-center mt-8 text-sm text-muted-foreground space-y-2 opacity-80">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
            <p>🔒 Secure authentication powered by Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}