import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

// Import new components
import { Navigation } from '@/components/home/Navigation';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureCards } from '@/components/home/FeatureCards';
import { ThreeRoles } from '@/components/home/ThreeRoles';
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
  return <div className="min-h-screen bg-background">
      
      {/* Loading State */}
      {loading && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>}

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Cards Section */}
      <section id="features">
        <FeatureCards />
      </section>

      {/* Three Roles Section */}
      <ThreeRoles />

      {/* Metrics Strip */}
      <MetricsStrip />

      {/* App Preview Section */}
      <section id="how-it-works">
        <AppPreview />
      </section>

      {/* Education Section */}
      <EducationSection />

      {/* Testimonials Section */}
      <section id="testimonials">
        <TestimonialsSection />
      </section>

      {/* Pricing CTA Section */}
      <section id="pricing">
        <PricingCTA />
      </section>


      {/* Footer */}
      <Footer />
    </div>;
}