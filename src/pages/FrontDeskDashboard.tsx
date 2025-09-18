import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Building2, XCircle, LogOut, Settings, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/taskUtils';
import NewFrontDeskSidebar from '@/components/front-desk/NewFrontDeskSidebar';
import { FrontDeskDashboardTabs } from '@/components/front-desk/FrontDeskDashboardTabs';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { RoleSwitcher } from '@/components/ui/role-switcher';

const FrontDeskDashboard = () => {
  const { session, user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const fetchClinic = async () => {
    if (!userProfile?.clinic_id) return;
    
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userProfile.clinic_id)
        .maybeSingle();

      if (data) setClinic(data);
    } catch (error) {
      console.error('Error fetching clinic:', error);
    }
  };

  useEffect(() => {
    if (session && user && userProfile) {
      if (userProfile.clinic_id) {
        fetchClinic();
      }
    }
    setLoading(false);
  }, [session, user, userProfile]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSkeleton />
      </div>
    );
  }

  // Check if user has front_desk role
  const hasFrontDeskRole = userProfile?.role === 'front_desk' || 
    userProfile?.roles?.includes('front_desk');

  if (!hasFrontDeskRole) {
    return <Navigate to="/hub" replace />;
  }

  // Show deactivated status if user is inactive
  if (userProfile && !userProfile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Account Deactivated</CardTitle>
            <CardDescription className="text-red-600">
              Your account has been temporarily deactivated by your clinic administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                <strong>What this means:</strong>
              </p>
              <ul className="text-sm text-red-600 mt-2 space-y-1 text-left">
                <li>• You cannot access clinic features</li>
                <li>• Your tasks and data are preserved</li>
                <li>• Contact your clinic administrator for reactivation</li>
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Need help? Contact your clinic administrator:</p>
              <p className="font-medium">{clinic?.name || 'Your Clinic'}</p>
            </div>
            <Button 
              onClick={() => {
                signOut();
                navigate('/');
              }}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-background via-background to-muted/20">
        <NewFrontDeskSidebar 
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
                  {clinic?.name || 'Front Desk Portal'}
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
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-medium">
                          {getUserInitials(userProfile?.name || 'Front Desk')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden sm:block">
                        <p className="font-medium text-sm text-foreground">
                          {userProfile?.name || 'Front Desk User'}
                        </p>
                        <div className="flex items-center gap-1">
                          <RoleSwitcher 
                            currentRole="front_desk"
                            availableRoles={userProfile?.roles || ['front_desk']}
                            userProfile={userProfile}
                            variant="dropdown"
                          />
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
            <FrontDeskDashboardTabs />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FrontDeskDashboard;