import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, Building2 } from 'lucide-react';
import OwnerDashboardTabs from '@/components/owner/OwnerDashboardTabs';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Clinic {
  id: string;
  name: string;
  clinic_code: string;
  address?: string;
  phone?: string;
  email?: string;
}

const OwnerDashboard = () => {
  const { session, user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && user && userProfile) {
      if (userProfile.role === 'owner' && userProfile.clinic_id) {
        // Only fetch if we don't already have clinic data for this clinic_id
        if (!clinic || clinic.id !== userProfile.clinic_id) {
          fetchClinic();
        } else {
          setLoading(false);
        }
      } else if (userProfile.role !== 'owner') {
        // Redirect non-owners
        navigate('/hub', { replace: true });
      } else {
        // Owner with no clinic_id
        setLoading(false);
      }
    }
  }, [session, user, userProfile, navigate]);

  const fetchClinic = async () => {
    try {
      if (!userProfile?.clinic_id) {
        // No clinic setup yet, redirect to home
        navigate('/', { replace: true });
        return;
      }
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userProfile.clinic_id)
        .single();

      if (error) throw error;
      setClinic(data);
    } catch (error) {
      console.error('Error fetching clinic:', error);
      // If clinic not found or other error, redirect to home
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const copyClinicCode = () => {
    if (clinic?.clinic_code) {
      navigator.clipboard.writeText(clinic.clinic_code);
      toast.success('Clinic code copied to clipboard!');
    }
  };

  // Show loading screen if still loading initial data or if user profile doesn't exist yet
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{clinic?.name || 'Clinic Owner'}</h1>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {clinic?.clinic_code && (
                    <>
                      <span>Code:</span>
                      <button
                        onClick={copyClinicCode}
                        className="font-mono font-semibold px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                        title="Click to copy clinic code"
                      >
                        {clinic.clinic_code}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {userProfile.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <OwnerDashboardTabs clinicId={clinic?.id} />
      </div>
    </div>
  );
};

export default OwnerDashboard;