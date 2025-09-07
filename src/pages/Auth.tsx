import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      }
    }
  }, [user, userProfile, navigate, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="w-full py-4 px-4 lg:px-8">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <AnimatedLogo size={28} animated={false} className="text-primary" />
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-900 bg-clip-text text-transparent">
              DentaLeague
            </span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-2 border-blue-200/50 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <AnimatedLogo size={28} animated={true} className="text-white" />
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                    ? 'Complete Setup' 
                    : 'Welcome to DentaLeague'
                  }
                </CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                    ? 'Set up your clinic information to get started' 
                    : 'Sign in to your account or create a new one'
                  }
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 h-12 rounded-lg">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center space-x-2 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Clinic Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center space-x-2 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Assistant</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-6 mt-0">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mx-auto shadow-md">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Clinic Owner</h3>
                        <p className="text-gray-600 text-sm">Manage your clinic and dental team</p>
                      </div>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-6 mt-0">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-md">
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Dental Assistant</h3>
                        <p className="text-gray-600 text-sm">Access your daily tasks and patient tracking</p>
                      </div>
                    </div>
                    <AuthWidget role="assistant" />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Footer Text */}
          <div className="text-center mt-8 text-sm text-gray-500 space-y-2">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
            <p>Secure authentication powered by Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}