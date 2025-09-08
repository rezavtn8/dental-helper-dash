import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Building2, Plus, Crown, ChevronDown, Settings, LogOut, Home } from 'lucide-react';
import { getUserInitials } from '@/lib/taskUtils';
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
  const { session, user, userProfile, signOut } = useAuth();
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
          <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4 h-14 px-4">
              <SidebarTrigger />
              
              {/* Context Title Group */}
              <div className="flex items-center gap-1.5">
                <Building2 className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <h1 className="font-semibold text-lg text-foreground max-w-[55vw] sm:max-w-none truncate">
                  {clinic?.name || 'Your Clinic'}
                </h1>
              </div>
              
              {/* Spacer */}
              <div className="flex-1"></div>
              
              {/* Right: User Profile */}
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto p-2 hover:bg-muted/50 rounded-lg">
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium">
                          {getUserInitials(userProfile?.name || 'Owner')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden sm:block">
                        <p className="font-medium text-sm text-foreground">
                          {userProfile?.name || 'Practice Owner'}
                        </p>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs border-blue-100 h-4 px-1.5">
                            <Crown className="w-2.5 h-2.5 mr-1" />
                            Owner
                          </Badge>
                        </div>
                      </div>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 shadow-lg">
                    <DropdownMenuItem onClick={() => setActiveTab('settings')} className="hover:bg-muted/50 text-sm">
                      <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      signOut();
                    }} className="text-red-600 hover:bg-red-50 text-sm">
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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