import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AssistantSidebar from '@/components/assistant/AssistantSidebar';
import HomeTab from '@/components/assistant/HomeTab';
import TasksTab from '@/components/assistant/TasksTab';
import ScheduleTab from '@/components/assistant/ScheduleTab';
import MyStatsTab from '@/components/assistant/MyStatsTab';
import LearningTab from '@/components/assistant/LearningTab';
import CertificationsTab from '@/components/assistant/CertificationsTab';
import FeedbackTab from '@/components/assistant/FeedbackTab';
import SettingsTab from '@/components/assistant/SettingsTab';
import { Task } from '@/types/task';
import { TasksTabSkeleton } from '@/components/ui/dashboard-skeleton';

const AssistantDashboard = () => {
  const { session, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clinic, setClinic] = useState<any>(null);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const fetchTasks = async () => {
    if (!userProfile?.clinic_id || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
        .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const fetchTodayPatientCount = async () => {
    if (!userProfile?.clinic_id || !user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('patient_logs')
        .select('patient_count')
        .eq('clinic_id', userProfile.clinic_id)
        .eq('assistant_id', user.id)
        .eq('date', today)
        .maybeSingle();

      setPatientCount(data?.patient_count || 0);
    } catch (error) {
      console.error('Error fetching patient count:', error);
    }
  };

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

  const fetchAllData = async () => {
    if (userProfile?.clinic_id) {
      await Promise.all([
        fetchTasks(),
        fetchTodayPatientCount(),
        fetchClinic()
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session && user && userProfile) {
      fetchAllData();
    }
  }, [session, user, userProfile]);

  if (loading || !userProfile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-teal-50 to-blue-50">
          <header className="fixed top-0 left-0 right-0 h-16 flex items-center bg-white/80 backdrop-blur-sm border-b border-teal-100 z-40 lg:hidden">
            <div className="ml-4 h-6 w-6 bg-teal-200 rounded animate-pulse" />
            <div className="ml-4 h-6 w-32 bg-teal-200 rounded animate-pulse" />
          </header>
          <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
            <div className="flex flex-col flex-grow bg-white border-r border-teal-100">
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="h-8 bg-teal-200 rounded w-32 animate-pulse" />
                  <div className="h-4 bg-teal-100 rounded w-24 animate-pulse" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-teal-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <main className="flex-1 pt-16 lg:pt-0 lg:pl-80">
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
              <TasksTabSkeleton />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // This check is now handled by ClinicRequiredRoute wrapper

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab 
            tasks={tasks}
            patientCount={patientCount}
            onPatientCountUpdate={setPatientCount}
            onTabChange={setActiveTab}
          />
        );
      case 'tasks':
        return (
          <TasksTab 
            tasks={tasks}
            onTaskUpdate={fetchTasks}
          />
        );
      case 'schedule':
        return <ScheduleTab />;
      case 'stats':
        return (
          <MyStatsTab 
            tasks={tasks}
          />
        );
      case 'learning':
        return <LearningTab />;
      case 'certifications':
        return <CertificationsTab />;
      case 'feedback':
        return <FeedbackTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return (
          <HomeTab 
            tasks={tasks}
            patientCount={patientCount}
            onPatientCountUpdate={setPatientCount}
            onTabChange={setActiveTab}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-teal-50 to-blue-50">
        <header className="fixed top-0 left-0 right-0 h-16 flex items-center bg-white/80 backdrop-blur-sm border-b border-teal-100 z-40 lg:hidden">
          <SidebarTrigger className="ml-4" />
          <div className="ml-4">
            <h1 className="font-semibold text-teal-900">{clinic?.name || 'Assistant Portal'}</h1>
          </div>
        </header>

        <AssistantSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clinic={clinic}
          userProfile={userProfile}
        />

        <main className="flex-1 pt-16 lg:pt-0 lg:pl-80">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AssistantDashboard;