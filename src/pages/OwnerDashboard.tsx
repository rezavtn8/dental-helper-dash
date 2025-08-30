
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Menu } from 'lucide-react';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import TasksTab from '@/components/owner/TasksTab';
import UnifiedTeamView from '@/components/owner/UnifiedTeamView';
import InsightsTab from '@/components/owner/InsightsTab';
import SettingsTab from '@/components/owner/SettingsTab';
import { Task, Assistant } from '@/types/task';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { SectionErrorBanner } from '@/components/ui/error-banner';


interface DataLoadingState {
  tasks: 'loading' | 'loaded' | 'error';
  assistants: 'loading' | 'loaded' | 'error';
  clinic: 'loading' | 'loaded' | 'error';
}

interface DataErrors {
  tasks?: string;
  assistants?: string;
  clinic?: string;
}

const OwnerDashboard = () => {
  const { session, user, userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [clinic, setClinic] = useState<any>(null);
  const [loadingStates, setLoadingStates] = useState<DataLoadingState>({
    tasks: 'loading',
    assistants: 'loading',
    clinic: 'loading'
  });
  const [errors, setErrors] = useState<DataErrors>({});
  const [activeTab, setActiveTab] = useState('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Calculate if all data is loaded
  const isPageLoading = Object.values(loadingStates).some(state => state === 'loading');
  const hasAnyErrors = Object.values(loadingStates).some(state => state === 'error');

  useEffect(() => {
    console.log('OwnerDashboard - session:', !!session, 'user:', !!user, 'userProfile:', userProfile);
    if (session && user && userProfile?.role === 'owner') {
      fetchAllData();
    }
  }, [session, user, userProfile]);

  const fetchAllData = () => {
    fetchTasks();
    fetchAssistants();
    fetchClinic();
  };

  const fetchTasks = async () => {
    setLoadingStates(prev => ({ ...prev, tasks: 'loading' }));
    setErrors(prev => ({ ...prev, tasks: undefined }));
    
    try {
      if (!userProfile?.clinic_id) {
        setTasks([]);
        setLoadingStates(prev => ({ ...prev, tasks: 'loaded' }));
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
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
  };

  const fetchAssistants = async () => {
    setLoadingStates(prev => ({ ...prev, assistants: 'loading' }));
    setErrors(prev => ({ ...prev, assistants: undefined }));
    
    try {
      if (!userProfile?.clinic_id) {
        setAssistants([]);
        setLoadingStates(prev => ({ ...prev, assistants: 'loaded' }));
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, is_active, created_at, last_login')
        .eq('role', 'assistant')
        .eq('clinic_id', userProfile.clinic_id);

      if (error) throw error;
      setAssistants(data || []);
      setLoadingStates(prev => ({ ...prev, assistants: 'loaded' }));
    } catch (error) {
      console.error('Error fetching assistants:', error);
      setLoadingStates(prev => ({ ...prev, assistants: 'error' }));
      setErrors(prev => ({ 
        ...prev, 
        assistants: error instanceof Error ? error.message : 'Failed to load team members'
      }));
    }
  };

  const fetchClinic = async () => {
    setLoadingStates(prev => ({ ...prev, clinic: 'loading' }));
    setErrors(prev => ({ ...prev, clinic: undefined }));
    
    try {
      if (!userProfile?.clinic_id) {
        throw new Error('No clinic ID found');
      }
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userProfile.clinic_id)
        .single();

      if (error) throw error;
      setClinic(data);
      setLoadingStates(prev => ({ ...prev, clinic: 'loaded' }));
    } catch (error) {
      console.error('Error fetching clinic:', error);
      setLoadingStates(prev => ({ ...prev, clinic: 'error' }));
      setErrors(prev => ({ 
        ...prev, 
        clinic: error instanceof Error ? error.message : 'Failed to load clinic information'
      }));
    }
  };

  const handleDataUpdate = () => {
    fetchAllData();
  };

  // Show loading screen if still loading initial data or if user profile doesn't exist yet
  if (isPageLoading || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" disabled>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg border-r border-gray-200 hidden lg:block">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-80">
          <div className="p-6 lg:p-8">
            <div 
              className="sr-only" 
              aria-live="polite" 
              aria-label="Loading dashboard data"
            >
              {!userProfile ? 'Setting up your profile...' : 'Loading dashboard data...'}
            </div>
            <DashboardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    const renderTabWithErrorHandling = (content: React.ReactNode, dependencies: (keyof DataLoadingState)[]) => {
      const tabErrors = dependencies.filter(dep => loadingStates[dep] === 'error');
      
      if (tabErrors.length > 0) {
        return (
          <div className="space-y-4">
            {tabErrors.map(dep => (
              <SectionErrorBanner
                key={dep}
                section={dep}
                error={errors[dep] || ''}
                onRetry={() => {
                  if (dep === 'tasks') fetchTasks();
                  else if (dep === 'assistants') fetchAssistants();
                  else if (dep === 'clinic') fetchClinic();
                }}
              />
            ))}
            {tabErrors.length < dependencies.length && content}
          </div>
        );
      }
      
      return content;
    };

    switch (activeTab) {
      case 'tasks':
        return renderTabWithErrorHandling(
          <TasksTab 
            tasks={tasks} 
            assistants={assistants} 
            onTaskUpdate={handleDataUpdate}
          />,
          ['tasks', 'assistants']
        );
      case 'team':
        return renderTabWithErrorHandling(
          <UnifiedTeamView 
            assistants={assistants.map(assistant => ({ 
              ...assistant, 
              type: 'member' as const
            }))} 
            tasks={tasks}
            onTeamUpdate={fetchAssistants}
          />,
          ['assistants', 'tasks']
        );
      case 'insights':
        return renderTabWithErrorHandling(
          <InsightsTab 
            tasks={tasks} 
            assistants={assistants} 
          />,
          ['tasks', 'assistants']
        );
      case 'settings':
        return renderTabWithErrorHandling(
          <SettingsTab 
            clinic={clinic} 
            onUpdate={handleDataUpdate}
          />,
          ['clinic']
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
          {/* Live region for status updates */}
          <div 
            className="sr-only" 
            aria-live="polite" 
            aria-label="Dashboard status"
          >
            {hasAnyErrors && 'Some data failed to load. Please use the retry buttons.'}
          </div>
          
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
