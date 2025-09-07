import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

// Import new components
import { Navigation } from '@/components/home/Navigation';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureCards } from '@/components/home/FeatureCards';
import { MetricsStrip } from '@/components/home/MetricsStrip';
import { EducationSection } from '@/components/home/EducationSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { PricingCTA } from '@/components/home/PricingCTA';
import { AppPreview } from '@/components/home/AppPreview';
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

      {/* App Preview Section */}
      <AppPreview />

      {/* Education Section */}
      <EducationSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing CTA Section */}
      <section id="pricing">
        <PricingCTA />
      </section>


      {/* Footer */}
      <Footer />
    </div>
  );
}