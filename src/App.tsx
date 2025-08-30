import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import React from "react";
import Home from "./pages/Home";
import ClinicSetup from "./pages/ClinicSetup";
import AssistantDashboard from "./pages/AssistantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import JoinTeam from "./pages/JoinTeam";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

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

  return <>{children}</>;
};

const DashboardRedirect = () => {
  const { userProfile, loading, session } = useAuth();

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

  // If owner has no clinic, go to setup
  if (userProfile?.role === 'owner' && !userProfile?.clinic_id) {
    return <Navigate to="/setup" replace />;
  }

  // Redirect based on role
  if (userProfile?.role === 'owner') {
    return <Navigate to="/owner" replace />;
  } else if (userProfile?.role === 'assistant') {
    return <Navigate to="/assistant" replace />;
  }

  // Fallback to home
  return <Navigate to="/" replace />;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/setup" element={<ClinicSetup />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/assistant" element={<ProtectedRoute><AssistantDashboard /></ProtectedRoute>} />
              <Route path="/owner" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
              <Route path="/join" element={<JoinTeam />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AuthErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;