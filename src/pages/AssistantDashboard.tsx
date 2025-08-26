import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Menu, Clock } from 'lucide-react';
import AssistantSidebar from '@/components/assistant/AssistantSidebar';
import TodaysTasksTab from '@/components/assistant/TodaysTasksTab';
import MyStatsTab from '@/components/assistant/MyStatsTab';
import ChangePinTab from '@/components/assistant/ChangePinTab';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  'due-type': string;
  category: string;
  assigned_to: string | null;
  created_at: string;
  completed_at?: string;
}

const AssistantDashboard = () => {
  const { session, user, userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clinic, setClinic] = useState<any>(null);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    console.log('AssistantDashboard - session:', !!session, 'user:', !!user, 'userProfile:', userProfile);
    if (session && user && userProfile?.role === 'assistant') {
      fetchTasks();
      fetchTodayPatientCount();
      fetchClinic();
    }
  }, [session, user, userProfile]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${user?.id},assigned_to.is.null`)
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

  const fetchTodayPatientCount = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('patient_logs')
        .select('patient_count')
        .eq('assistant_id', user?.id)
        .eq('date', today)
        .maybeSingle();

      if (data) {
        setPatientCount(data.patient_count || 0);
      } else {
        setPatientCount(0);
      }
    } catch (error) {
      console.error('Error fetching patient count:', error);
      setPatientCount(0);
    }
  };

  const fetchClinic = async () => {
    try {
      if (!userProfile?.clinic_id) return;
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userProfile.clinic_id)
        .maybeSingle();

      if (data) {
        setClinic(data);
      }
    } catch (error) {
      console.error('Error fetching clinic:', error);
    }
  };

  const handleTaskUpdate = () => {
    fetchTasks();
  };

  const handlePatientCountUpdate = (newCount: number) => {
    setPatientCount(newCount);
  };

  // Show loading screen if still loading or if user profile doesn't exist yet
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-900 font-medium">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
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
          <TodaysTasksTab 
            tasks={tasks} 
            onTaskUpdate={handleTaskUpdate}
          />
        );
      case 'stats':
        return (
          <MyStatsTab 
            tasks={tasks} 
            patientCount={patientCount}
            onPatientCountUpdate={handlePatientCountUpdate}
          />
        );
      case 'pin':
        return <ChangePinTab />;
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
            {clinic?.name || 'Assistant Portal'}
          </h1>
        </div>
      </div>

      {/* Sidebar */}
      <AssistantSidebar
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

export default AssistantDashboard;