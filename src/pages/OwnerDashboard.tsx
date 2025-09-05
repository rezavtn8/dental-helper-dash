import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import OwnerDashboardTabs from '@/components/owner/OwnerDashboardTabs';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { useNavigate } from 'react-router-dom';
import ClinicSetupDialog from '@/components/ClinicSetupDialog';

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
        // No clinic setup yet - allow exploration
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userProfile.clinic_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching clinic:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        console.error('Clinic not found');
        setLoading(false);
        return;
      }

      setClinic(data);
    } catch (error) {
      console.error('Error fetching clinic:', error);
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
            {!userProfile?.clinic_id ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md">
                  <CardHeader className="text-center">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle>Create Your Clinic</CardTitle>
                    <CardDescription>
                      You need to create a clinic to access full features. Set up your clinic to start supporting your dental team with structured daily workflows.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={() => setShowCreateDialog(true)} 
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Clinic
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/hub')}
                      className="w-full"
                    >
                      Back to Hub
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <OwnerDashboardTabs 
                clinicId={clinic?.id} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
          </main>
        </div>
      </div>
      
      {/* Clinic Setup Dialog */}
      {userProfile && (
        <ClinicSetupDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          userProfile={userProfile}
          onSuccess={() => {
            // Refresh the clinic data after successful creation
            if (userProfile.clinic_id) {
              fetchClinic();
            }
          }}
        />
      )}
    </SidebarProvider>
  );
};

export default OwnerDashboard;