
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import CreateTaskDialog from '@/components/owner/CreateTaskDialog';
import OwnerTasks from '@/components/owner/OwnerTasks';
import OwnerTeam from '@/components/owner/OwnerTeam';
import OwnerAnalytics from '@/components/owner/OwnerAnalytics';
import OwnerTemplates from '@/components/owner/OwnerTemplates';
import OwnerSettings from '@/components/owner/OwnerSettings';
import { 
  Building2,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Clock
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  'due-type': string;
  category: string;
  assigned_to: string | null;
  recurrence: string;
  created_at: string;
}

interface Assistant {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

const OwnerDashboard = () => {
  const { session, user, userProfile, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    console.log('OwnerDashboard - session:', !!session, 'user:', !!user, 'userProfile:', userProfile);
    if (session && user && userProfile?.role === 'owner') {
      fetchTasks();
      fetchAssistants();
      fetchClinic();
    }
  }, [session, user, userProfile]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, is_active, created_at, last_login')
        .eq('role', 'assistant')
        .eq('clinic_id', userProfile?.clinic_id);

      if (error) throw error;
      setAssistants(data || []);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const fetchClinic = async () => {
    try {
      if (!userProfile?.clinic_id) return;
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userProfile.clinic_id)
        .single();

      if (error) throw error;
      setClinic(data);
    } catch (error) {
      console.error('Error fetching clinic:', error);
    }
  };

  const handleDataUpdate = () => {
    fetchTasks();
    fetchAssistants();
    fetchClinic();
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading screen if still loading or if user profile doesn't exist yet
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
          <p className="text-sm text-muted-foreground mt-2">
            {!userProfile ? 'Setting up your profile...' : 'Loading data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2 mr-8">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">{clinic?.name || 'Dental Clinic'}</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-fit grid-cols-5">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4 ml-auto">
            <CreateTaskDialog 
              assistants={assistants} 
              onTaskCreated={handleDataUpdate}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(userProfile?.name || 'Owner')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{userProfile?.name}</p>
                    <p className="text-xs text-muted-foreground">Owner</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="tasks" className="space-y-4">
            <OwnerTasks 
              tasks={tasks} 
              assistants={assistants} 
              onTaskUpdate={handleDataUpdate}
            />
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4">
            <OwnerTeam 
              assistants={assistants} 
              tasks={tasks} 
              onTeamUpdate={handleDataUpdate}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <OwnerAnalytics tasks={tasks} />
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <OwnerTemplates onTasksCreated={handleDataUpdate} />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <OwnerSettings clinic={clinic} onUpdate={handleDataUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;
