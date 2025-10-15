import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Building2, XCircle, LogOut, Settings, ChevronDown, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/taskUtils';
import NewAssistantSidebar from '@/components/assistant/NewAssistantSidebar';
import AssistantDashboardTabs from '@/components/assistant/AssistantDashboardTabs';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { RoleSwitcher } from '@/components/ui/role-switcher';

const AssistantDashboard = () => {
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

  // Show message if user is not part of any clinic
  if (userProfile && !userProfile.clinic_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md border-blue-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-blue-800">No Clinic Assigned</CardTitle>
            <CardDescription className="text-blue-600">
              You're not currently part of any clinic.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>What you can do:</strong>
              </p>
              <ul className="text-sm text-blue-600 mt-2 space-y-1 text-left">
                <li>• Request to join a clinic using a clinic code</li>
                <li>• Accept an invitation if you've received one</li>
                <li>• Contact a clinic administrator for access</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/join-clinic')}
                className="flex-1"
              >
                Join a Clinic
              </Button>
              <Button 
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                variant="outline"
                className="flex-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen w-full flex bg-gradient-to-br from-background via-background to-muted/20">
        <NewAssistantSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clinic={clinic}
          userProfile={userProfile}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2 sm:gap-4 h-12 sm:h-14 px-2 sm:px-4">
              <SidebarTrigger className="md:hidden" />
              
              {/* Context Title Group */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                <h1 className="font-semibold text-base sm:text-lg text-foreground truncate">
                  {clinic?.name || 'Assistant Portal'}
                </h1>
              </div>
              
              {/* Right: User Profile */}
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 h-auto p-1 sm:p-2 hover:bg-muted/50 rounded-lg">
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8 border border-border">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium">
                          {getUserInitials(userProfile?.name || 'Assistant')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden lg:block">
                        <p className="font-medium text-sm text-foreground">
                          {userProfile?.name || 'Assistant'}
                        </p>
                        <div className="flex items-center gap-1">
                          <RoleSwitcher 
                            currentRole="assistant"
                            availableRoles={userProfile?.roles || ['assistant']}
                            userProfile={userProfile}
                            variant="dropdown"
                          />
                        </div>
                      </div>
                      <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
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
          <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
            <AssistantDashboardTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AssistantDashboard;