import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Crown, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import AuthWidget from '@/components/auth/AuthWidget';
import ClinicSetupForm from '@/components/ClinicSetupForm';
import { AnimatedLogo } from '@/components/ui/animated-logo';

// Import new components
import { Navigation } from '@/components/home/Navigation';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureCards } from '@/components/home/FeatureCards';
import { MetricsStrip } from '@/components/home/MetricsStrip';
import { EducationSection } from '@/components/home/EducationSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { PricingCTA } from '@/components/home/PricingCTA';
import { Footer } from '@/components/home/Footer';

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
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Cards Section */}
      <section id="features" className="container mx-auto py-20">
        <div className="text-center mb-16">
          <h2 className="text-[1.75rem] font-semibold mb-4 leading-[2.25rem]">
            Why choose DentaLeague?
          </h2>
          <p className="text-muted-foreground text-base leading-[1.5rem] max-w-2xl mx-auto">
            Built for dental teams who value gentle structure, clear communication, and smooth daily operations
          </p>
        </div>
        
        <FeatureCards />
      </section>

      {/* Metrics Strip */}
      <MetricsStrip />

      {/* Education Section */}
      <EducationSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing CTA Section */}
      <section id="pricing">
        <PricingCTA />
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="container mx-auto py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-blue-200 shadow-xl bg-background/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <AnimatedLogo size={32} animated={false} className="text-blue-600 mb-4 mx-auto" />
              <CardTitle className="text-[1.75rem] font-semibold leading-[2.25rem]">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? 'Complete Setup' : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-base leading-[1.5rem]">
                {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? 'Set up your clinic information' : 'Choose your role to continue'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {user && userProfile?.role === 'owner' && !userProfile?.clinic_id ? (
                <ClinicSetupForm userProfile={userProfile} />
              ) : (
                <Tabs defaultValue="owner" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted p-1 h-11">
                    <TabsTrigger 
                      value="owner" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Owner</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center space-x-2 py-2 text-sm font-medium"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Assistant</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="owner" className="space-y-4">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Crown className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <h3 className="text-base font-semibold mb-1">Clinic Owner</h3>
                      <p className="text-muted-foreground text-sm mb-4">Manage your clinic and team</p>
                    </div>
                    <AuthWidget role="owner" />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="space-y-4">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <UserCheck className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <h3 className="text-base font-semibold mb-1">Dental Assistant</h3>
                      <p className="text-muted-foreground text-sm mb-4">Access your daily task list and patient tracking</p>
                    </div>
                    <AuthWidget role="assistant" />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}