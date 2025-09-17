import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

// Import redesigned components
import { ModernNavigation } from '@/components/home/ModernNavigation';
import { ImmersiveHero } from '@/components/home/ImmersiveHero';
import { BentoFeatures } from '@/components/home/BentoFeatures';
import { MetricsStrip } from '@/components/home/MetricsStrip';
import { TheFlow } from '@/components/home/TheFlow';
import { RealImpact } from '@/components/home/RealImpact';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { ChooseYourJourney } from '@/components/home/ChooseYourJourney';
import { ModernFooter } from '@/components/home/ModernFooter';
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
  return <div className="min-h-screen bg-background">
      
      {/* Loading State */}
      {loading && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>}

      {/* Modern Navigation */}
      <ModernNavigation />

      {/* Immersive Hero Section */}
      <section id="hero">
        <ImmersiveHero />
      </section>

      {/* Bento Grid Features Section */}
      <section id="features">
        <BentoFeatures />
      </section>

      {/* Metrics Strip */}
      <MetricsStrip />

      {/* The Flow Section */}
      <section id="how-it-works">
        <TheFlow />
      </section>

      {/* Real Impact Section */}
      <section id="impact">
        <RealImpact />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials">
        <TestimonialsSection />
      </section>

      {/* Choose Your Journey Pricing */}
      <section id="pricing">
        <ChooseYourJourney />
      </section>

      {/* Modern Footer */}
      <ModernFooter />
    </div>;
}