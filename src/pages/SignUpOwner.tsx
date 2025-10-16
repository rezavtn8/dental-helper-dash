import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import OwnerSignUpForm from '@/components/auth/OwnerSignUpForm';
import ClinicSetupForm from '@/components/ClinicSetupForm';

export default function SignUpOwner() {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();

  // Redirect authenticated users appropriately
  useEffect(() => {
    if (user && userProfile && !loading) {
      if (userProfile.role === 'owner' && userProfile.clinic_id) {
        navigate('/owner');
      } else if (userProfile.role !== 'owner') {
        // Non-owner trying to access owner signup
        navigate('/');
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
            <div className="flex items-center space-x-3">
              <AnimatedLogo size={32} animated={false} className="text-primary" />
              <span className="text-xl font-bold text-foreground">DentaLeague</span>
            </div>
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
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <Crown className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Complete Your Clinic Setup' 
                  : 'Start Your Dental Practice'
                }
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id 
                  ? 'Set up your clinic to begin managing your dental team' 
                  : 'Create your clinic owner account and start managing your team'
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
                <OwnerSignUpForm />
              )}
            </CardContent>
          </Card>

          {/* Sign In Link */}
          {!user && (
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-primary"
                  onClick={() => navigate('/signin')}
                >
                  Sign in
                </Button>
              </p>
            </div>
          )}

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
