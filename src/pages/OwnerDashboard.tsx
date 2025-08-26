
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Menu, Clock } from 'lucide-react';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import TasksTab from '@/components/owner/TasksTab';
import TeamTab from '@/components/owner/TeamTab';
import InsightsTab from '@/components/owner/InsightsTab';
import SettingsTab from '@/components/owner/SettingsTab';

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
  const { session, user, userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        .eq('clinic_id', userProfile?.clinic_id)
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <TasksTab 
            tasks={tasks} 
            assistants={assistants} 
            onTaskUpdate={handleDataUpdate}
          />
        );
      case 'team':
        return (
          <TeamTab 
            assistants={assistants} 
            tasks={tasks} 
            onTeamUpdate={handleDataUpdate}
          />
        );
      case 'insights':
        return (
          <InsightsTab 
            tasks={tasks} 
            assistants={assistants} 
          />
        );
      case 'settings':
        return (
          <SettingsTab 
            clinic={clinic} 
            onUpdate={handleDataUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-gray-900">
            {clinic?.name || 'Dental Practice'}
          </h1>
        </div>
      </div>

      {/* Sidebar */}
      <OwnerSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        clinic={clinic}
        userProfile={userProfile}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'
      }`}>
        <div className="p-6 lg:p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
