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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      
      {/* Modern geometric background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply blur-xl animate-pulse animation-delay-0"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full mix-blend-multiply blur-xl animate-pulse animation-delay-2s"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full mix-blend-multiply blur-xl animate-pulse animation-delay-4s"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <AnimatedLogo size={32} animated={false} className="text-slate-700" />
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  DentaLeague
                </span>
              </div>
            </div>

            {/* Back to Home Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 flex items-center space-x-2 transition-all duration-200"
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
            {/* Animated Logo with glow effect */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-2xl animate-pulse"></div>
                <AnimatedLogo size={80} className="relative z-10 text-slate-700" />
              </div>
            </div>
            
            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Complete Your Setup' 
                  : 'Welcome to DentaLeague'
                }
              </h1>
              <p className="text-slate-600 max-w-md mx-auto text-lg leading-relaxed">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Let\'s set up your clinic to get started with your dental practice management' 
                  : 'Sign in to your account or create a new one to get started'
                }
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl shadow-slate-200/50">
            <CardContent className="p-10">
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  {/* Modern tab styling */}
                  <TabsList className="grid w-full grid-cols-3 mb-10 bg-slate-100/80 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/40 shadow-inner">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center justify-center space-x-2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/60 data-[state=active]:border data-[state=active]:border-slate-200/40 text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    >
                      <Crown className="w-4 h-4" />
                      <span className="hidden sm:inline">Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center justify-center space-x-2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/60 data-[state=active]:border data-[state=active]:border-slate-200/40 text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Assistant</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="front_desk" 
                      className="flex items-center justify-center space-x-2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:shadow-slate-200/60 data-[state=active]:border data-[state=active]:border-slate-200/40 text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Front Desk</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-8 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center mx-auto shadow-xl shadow-blue-200/40 border border-blue-100">
                        <Crown className="w-9 h-9 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">Clinic Owner</h3>
                        <p className="text-slate-600">Manage your clinic and lead your dental team</p>
                      </div>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-8 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 flex items-center justify-center mx-auto shadow-xl shadow-emerald-200/40 border border-emerald-100">
                        <UserCheck className="w-9 h-9 text-emerald-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">Dental Assistant</h3>
                        <p className="text-slate-600">Access tasks and track patient care</p>
                      </div>
                    </div>
                    <AuthWidget role="assistant" />
                  </TabsContent>

                  <TabsContent value="front_desk" className="space-y-8 mt-0">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 flex items-center justify-center mx-auto shadow-xl shadow-purple-200/40 border border-purple-100">
                        <UserCheck className="w-9 h-9 text-purple-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">Front Desk</h3>
                        <p className="text-slate-600">Manage reception and patient scheduling</p>
                      </div>
                    </div>
                    <AuthWidget role="front_desk" />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Footer Text */}
          <div className="text-center mt-10 text-sm text-slate-500 space-y-3">
            <p>By continuing, you agree to our <span className="text-slate-700 font-medium">Terms of Service</span> and <span className="text-slate-700 font-medium">Privacy Policy</span></p>
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure authentication powered by Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}