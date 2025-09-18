import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { FrontDeskSidebar } from '@/components/front-desk/FrontDeskSidebar';
import { FrontDeskDashboardTabs } from '@/components/front-desk/FrontDeskDashboardTabs';

export default function FrontDeskDashboard() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has front_desk role
  const hasFrontDeskRole = userProfile?.role === 'front_desk' || 
    userProfile?.roles?.includes('front_desk');

  if (!hasFrontDeskRole) {
    return <Navigate to="/hub" replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <FrontDeskSidebar />
      <main className="flex-1 overflow-hidden">
        <FrontDeskDashboardTabs />
      </main>
    </div>
  );
}