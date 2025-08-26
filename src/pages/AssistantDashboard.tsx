import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
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
      toast.error('Failed to load tasks');
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
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-6 text-teal-600" />
          <p className="text-teal-900 font-semibold text-lg">Loading dashboard...</p>
          <p className="text-sm text-teal-600 mt-2">
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-teal-50 to-blue-50">
        {/* Global trigger that is ALWAYS visible */}
        <header className="fixed top-0 left-0 right-0 h-16 flex items-center bg-white/80 backdrop-blur-sm border-b border-teal-100 z-40 lg:hidden">
          <SidebarTrigger className="ml-4 text-teal-600 hover:bg-teal-50" />
          <h1 className="ml-4 font-semibold text-teal-900">
            {clinic?.name || 'Assistant Portal'}
          </h1>
        </header>

        <AssistantSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clinic={clinic}
          userProfile={userProfile}
        />

        {/* Main Content */}
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AssistantDashboard;