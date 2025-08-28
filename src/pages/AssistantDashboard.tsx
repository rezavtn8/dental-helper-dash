import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { toast } from 'sonner';
import AssistantSidebar from '@/components/assistant/AssistantSidebar';
import TodaysTasksTab from '@/components/assistant/TodaysTasksTab';
import MyStatsTab from '@/components/assistant/MyStatsTab';
import SettingsTab from '@/components/assistant/SettingsTab';
import InvitationPendingCard from '@/components/assistant/InvitationPendingCard';
import { Task } from '@/types/task';
import { TasksTabSkeleton } from '@/components/ui/dashboard-skeleton';
import { SectionErrorBanner } from '@/components/ui/error-banner';

interface AssistantDataLoadingState {
  tasks: 'loading' | 'loaded' | 'error';
  clinic: 'loading' | 'loaded' | 'error';
  patientCount: 'loading' | 'loaded' | 'error';
}

interface AssistantDataErrors {
  tasks?: string;
  clinic?: string;
  patientCount?: string;
}

const AssistantDashboard = () => {
  const { session, user, userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clinic, setClinic] = useState<any>(null);
  const [patientCount, setPatientCount] = useState(0);
  const [loadingStates, setLoadingStates] = useState<AssistantDataLoadingState>({
    tasks: 'loading',
    clinic: 'loading',
    patientCount: 'loading'
  });
  const [errors, setErrors] = useState<AssistantDataErrors>({});
  const [activeTab, setActiveTab] = useState('tasks');

  // Calculate if all data is loaded
  const isPageLoading = Object.values(loadingStates).some(state => state === 'loading');
  const hasAnyErrors = Object.values(loadingStates).some(state => state === 'error');

  const fetchTasks = useCallback(async () => {
    if (!userProfile?.clinic_id) {
      setLoadingStates(prev => ({ ...prev, tasks: 'loaded' }));
      setTasks([]);
      return;
    }

    setLoadingStates(prev => ({ ...prev, tasks: 'loading' }));
    setErrors(prev => ({ ...prev, tasks: undefined }));
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
        .or(`assigned_to.eq.${user?.id},assigned_to.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
      setLoadingStates(prev => ({ ...prev, tasks: 'loaded' }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoadingStates(prev => ({ ...prev, tasks: 'error' }));
      setErrors(prev => ({ 
        ...prev, 
        tasks: error instanceof Error ? error.message : 'Failed to load tasks'
      }));
    }
  }, [userProfile?.clinic_id, user?.id]);

  const fetchTodayPatientCount = useCallback(async () => {
    if (!userProfile?.clinic_id) {
      setLoadingStates(prev => ({ ...prev, patientCount: 'loaded' }));
      setPatientCount(0);
      return;
    }

    setLoadingStates(prev => ({ ...prev, patientCount: 'loading' }));
    setErrors(prev => ({ ...prev, patientCount: undefined }));
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('patient_logs')
        .select('patient_count')
        .eq('clinic_id', userProfile.clinic_id)
        .eq('assistant_id', user?.id)
        .eq('date', today)
        .maybeSingle();

      if (data) {
        setPatientCount(data.patient_count || 0);
      } else {
        setPatientCount(0);
      }
      setLoadingStates(prev => ({ ...prev, patientCount: 'loaded' }));
    } catch (error) {
      console.error('Error fetching patient count:', error);
      setPatientCount(0);
      setLoadingStates(prev => ({ ...prev, patientCount: 'error' }));
      setErrors(prev => ({ 
        ...prev, 
        patientCount: error instanceof Error ? error.message : 'Failed to load patient count'
      }));
    }
  }, [userProfile?.clinic_id, user?.id]);

  const fetchClinic = useCallback(async () => {
    if (!userProfile?.clinic_id) {
      setLoadingStates(prev => ({ ...prev, clinic: 'loaded' }));
      setClinic(null);
      return;
    }

    setLoadingStates(prev => ({ ...prev, clinic: 'loading' }));
    setErrors(prev => ({ ...prev, clinic: undefined }));
    
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userProfile.clinic_id)
        .maybeSingle();

      if (data) {
        setClinic(data);
      }
      setLoadingStates(prev => ({ ...prev, clinic: 'loaded' }));
    } catch (error) {
      console.error('Error fetching clinic:', error);
      setLoadingStates(prev => ({ ...prev, clinic: 'error' }));
      setErrors(prev => ({ 
        ...prev, 
        clinic: error instanceof Error ? error.message : 'Failed to load clinic information'
      }));
    }
  }, [userProfile?.clinic_id]);

  const fetchAllData = useCallback(() => {
    fetchTasks();
    fetchTodayPatientCount();
    fetchClinic();
  }, [fetchTasks, fetchTodayPatientCount, fetchClinic]);

  useEffect(() => {
    console.log('AssistantDashboard - session:', !!session, 'user:', !!user, 'userProfile:', userProfile);
    if (session && user && userProfile?.role === 'assistant') {
      fetchAllData();
    }
  }, [session, user, userProfile, fetchAllData]);

  const handleInvitationAccepted = () => {
    // Force a page reload to refresh user profile and data
    window.location.reload();
  };

  // Show invitation screen if user has no clinic_id
  if (userProfile && !userProfile.clinic_id) {
    return <InvitationPendingCard onInvitationAccepted={handleInvitationAccepted} />;
  }

  // Show loading screen if still loading initial data or if user profile doesn't exist yet
  if (isPageLoading || !userProfile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-teal-50 to-blue-50">
          {/* Global trigger that is ALWAYS visible */}
          <header className="fixed top-0 left-0 right-0 h-16 flex items-center bg-white/80 backdrop-blur-sm border-b border-teal-100 z-40 lg:hidden">
            <div className="ml-4 h-6 w-6 bg-teal-200 rounded animate-pulse" />
            <div className="ml-4 h-6 w-32 bg-teal-200 rounded animate-pulse" />
          </header>

          {/* Sidebar Skeleton */}
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

          {/* Main Content */}
          <main className="flex-1 pt-16 lg:pt-0 lg:pl-80">
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
              <div 
                className="sr-only" 
                aria-live="polite" 
                aria-label="Loading assistant dashboard data"
              >
                {!userProfile ? 'Setting up your profile...' : 'Loading dashboard data...'}
              </div>
              <TasksTabSkeleton />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const renderTabContent = () => {
    const renderTabWithErrorHandling = (content: React.ReactNode, dependencies: (keyof AssistantDataLoadingState)[]) => {
      const tabErrors = dependencies.filter(dep => loadingStates[dep] === 'error');
      
      if (tabErrors.length > 0) {
        return (
          <div className="space-y-6">
            {tabErrors.map(errorType => (
              <SectionErrorBanner
                key={errorType}
                section={errorType}
                error={errors[errorType] || `Error loading ${errorType} data`}
                onRetry={() => {
                  switch(errorType) {
                    case 'tasks':
                      fetchTasks();
                      break;
                    case 'clinic':
                      fetchClinic();
                      break;
                    case 'patientCount':
                      fetchTodayPatientCount();
                      break;
                  }
                }}
              />
            ))}
            {content}
          </div>
        );
      }
      
      return content;
    };

    switch (activeTab) {
      case 'tasks':
        return renderTabWithErrorHandling(
          <TodaysTasksTab 
            tasks={tasks}
            onTaskUpdate={fetchTasks}
          />, 
          ['tasks']
        );
      case 'stats':
        return renderTabWithErrorHandling(
          <MyStatsTab 
            tasks={tasks}
            patientCount={patientCount}
            onPatientCountUpdate={setPatientCount}
          />, 
          ['tasks', 'patientCount']
        );
      case 'settings':
        return <SettingsTab />;
      default:
        return renderTabWithErrorHandling(
          <TodaysTasksTab 
            tasks={tasks}
            onTaskUpdate={fetchTasks}
          />, 
          ['tasks']
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-teal-50 to-blue-50">
        {/* Global trigger that is ALWAYS visible */}
        <header className="fixed top-0 left-0 right-0 h-16 flex items-center bg-white/80 backdrop-blur-sm border-b border-teal-100 z-40 lg:hidden">
          <SidebarTrigger className="ml-4" />
          <div className="ml-4">
            <h1 className="font-semibold text-teal-900">{clinic?.name || 'Assistant Portal'}</h1>
          </div>
        </header>

        {/* Sidebar */}
        <AssistantSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clinic={clinic}
          userProfile={userProfile}
        />

        {/* Main Content */}
        <main className="flex-1 pt-16 lg:pt-0 lg:pl-80">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="sr-only" aria-live="polite">
              Currently viewing: {activeTab === 'tasks' ? 'Today\'s Tasks' : activeTab === 'stats' ? 'My Statistics' : 'Settings'}
            </div>
            {renderTabContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AssistantDashboard;