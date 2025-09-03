import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, BookOpen, XCircle, LogOut } from 'lucide-react';
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
          <main className="flex-1 pt-16 lg:pt-0">
            <div className="p-6 lg:p-8">
              <TasksTabSkeleton />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
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
                supabase.auth.signOut();
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

  // Show loading while fetching initial data
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    // If no clinic, show different content for each tab
    if (!userProfile?.clinic_id) {
      const NoClinicMessage = ({ tabName }: { tabName: string }) => (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Join a Clinic</CardTitle>
              <CardDescription>
                You need to join a clinic to access {tabName.toLowerCase()} features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/join')} 
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Join a Clinic
              </Button>
            </CardContent>
          </Card>
        </div>
      );

      const WelcomeMessage = () => (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Welcome to the Assistant Portal
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get started by exploring the features available to you, or join a clinic to unlock the full experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Available Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Learning resources and courses
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Certification tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Profile settings
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Requires Clinic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-orange-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    Task management
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    Schedule viewing
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    Performance statistics
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="inline-block">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Ready to get started?</h3>
                <p className="text-slate-600 mb-4">
                  Join a clinic to access all features and start collaborating with your team.
                </p>
                <Button onClick={() => navigate('/join')} size="lg" className="mr-3">
                  <Users className="w-4 h-4 mr-2" />
                  Join a Clinic
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('learning')} size="lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );

      switch (activeTab) {
        case 'learning':
          return <LearningTab />; // Allow learning without clinic
        case 'certifications':
          return <CertificationsTab />; // Allow certifications without clinic
        case 'settings':
          return <SettingsTab />; // Allow settings without clinic
        case 'home':
          return <WelcomeMessage />; // Show welcome screen instead of generic message
        case 'tasks':
        case 'schedule':
        case 'stats':
        case 'feedback':
        default:
          return <NoClinicMessage tabName={activeTab} />;
      }
    }

    // Normal clinic-based content
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
            <h1 className="font-semibold text-teal-900">
              {clinic?.name || 'Assistant Portal'}
            </h1>
          </div>
        </header>

        <AssistantSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clinic={clinic}
          userProfile={userProfile}
        />

        <main className="flex-1 pt-16 lg:pt-0">
          <div className="p-6 lg:p-8">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AssistantDashboard;