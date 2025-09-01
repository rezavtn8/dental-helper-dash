import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import OwnerDashboardTabs from '@/components/owner/OwnerDashboardTabs';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { useNavigate } from 'react-router-dom';

interface Clinic {
  id: string;
  name: string;
  clinic_code: string;
  address?: string;
  phone?: string;
  email?: string;
}

const OwnerDashboard = () => {
  const { session, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Show loading screen if still loading initial data or if user profile doesn't exist yet
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-background via-background to-muted/20">
        <OwnerSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clinic={clinic}
          userProfile={userProfile}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold text-foreground">
                  {clinic?.name || 'Clinic Management'}
                </h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {userProfile?.email}
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-6">
            <OwnerDashboardTabs 
              clinicId={clinic?.id} 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OwnerDashboard;