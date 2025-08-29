import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ClinicProvider } from "@/hooks/useClinic";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import React from "react";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ClinicSetup from "./pages/ClinicSetup";
import AssistantDashboard from "./pages/AssistantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import ClinicManagement from "./pages/ClinicManagement";
import NotFound from "./pages/NotFound";
import AcceptInvitation from "./pages/AcceptInvitation";
import AdminAssistants from "./pages/AdminAssistants";
import InviteCallback from "./pages/InviteCallback";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, userProfile } = useAuth();

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

  if (!session) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated but no profile exists, stay on current page
  // This allows the useAuth hook to attempt profile creation
  return <>{children}</>;
};

const RoleBasedRedirect = () => {
  const { userProfile, loading, session, needsClinicSetup } = useAuth();
  const [redirectTimeout, setRedirectTimeout] = React.useState(false);

  // Set a timeout for profile loading to prevent infinite loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && session) {
        console.warn('Profile loading timeout - redirecting to home');
        setRedirectTimeout(true);
      }
    }, 20000); // 20 second timeout to allow for auto-linking

    return () => clearTimeout(timer);
  }, [loading, session]);

  if (loading && !redirectTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
          <p className="text-xs text-muted-foreground mt-2">Checking for clinic assignments...</p>
        </div>
      </div>
    );
  }

  if (!session || redirectTimeout) {
    return <Navigate to="/" replace />;
  }

  // If user needs clinic setup, redirect to setup page
  if (needsClinicSetup) {
    return <Navigate to="/setup" replace />;
  }

  if (userProfile?.role === 'owner' || userProfile?.role === 'admin') {
    return <Navigate to="/owner" replace />;
  } else if (userProfile?.role === 'assistant') {
    return <Navigate to="/assistant" replace />;
  } else {
    // Progressive fallback - try to determine role from session metadata
    const userRole = session.user?.user_metadata?.role;
    if (userRole === 'owner' || userRole === 'admin') {
      return <Navigate to="/owner" replace />;
    } else if (userRole === 'assistant') {
      return <Navigate to="/assistant" replace />;
    }
    
    // Final fallback - redirect to home with error indication
    console.warn('Unknown user role or profile unavailable, redirecting to home');
    return <Navigate to="/" replace />;
  }
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthErrorBoundary>
        <AuthProvider>
          <ClinicProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/owner-login" element={<Navigate to="/" replace />} />
                <Route path="/assistant-login" element={<Navigate to="/" replace />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/setup" element={<ClinicSetup />} />
                <Route path="/dashboard" element={<RoleBasedRedirect />} />
                <Route 
                  path="/assistant" 
                  element={
                    <ProtectedRoute>
                      <AssistantDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/owner" 
                  element={
                    <ProtectedRoute>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/clinic" 
                  element={
                    <ProtectedRoute>
                      <ClinicManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/accept-invitation" element={<AcceptInvitation />} />
                <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
                <Route 
                  path="/admin/assistants" 
                  element={
                    <ProtectedRoute>
                      <AdminAssistants />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/auth/invite-callback" element={<InviteCallback />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ClinicProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
