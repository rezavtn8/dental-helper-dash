import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

import { Navigation } from '@/components/home/Navigation';
import { HeroSection } from '@/components/home/HeroSection';
import { ScrollSequence } from '@/components/home/ScrollSequence';
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
      } else if (userProfile.role === 'front_desk') {
        navigate('/front-desk');
      } else if (userProfile.roles?.length) {
        // Multi-role user - redirect to primary role
        if (userProfile.roles.includes('owner')) {
          navigate('/owner');
        } else if (userProfile.roles.includes('assistant')) {
          navigate('/assistant');
        } else if (userProfile.roles.includes('front_desk')) {
          navigate('/front-desk');
        }
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

      {/* Scroll Sequence - Train, Track, Analyze */}
      <ScrollSequence />

      {/* Footer */}
      <Footer />
    </div>;
}