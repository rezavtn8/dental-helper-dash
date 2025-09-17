import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

// Import clean minimal components
import { CleanNavigation } from '@/components/home/CleanNavigation';
import { CleanHero } from '@/components/home/CleanHero';
import { CleanFeatures } from '@/components/home/CleanFeatures';
import { CleanFooter } from '@/components/home/CleanFooter';
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

      {/* Clean Navigation */}
      <CleanNavigation />

      {/* Hero Section */}
      <CleanHero />

      {/* Features Section */}
      <CleanFeatures />

      {/* Footer */}
      <CleanFooter />
    </div>
  );
}