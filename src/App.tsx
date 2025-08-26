import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ClinicProvider } from "@/hooks/useClinic";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ClinicSetup from "./pages/ClinicSetup";
import ClinicLogin from "./pages/ClinicLogin";
import AssistantDashboard from "./pages/AssistantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import ClinicManagement from "./pages/ClinicManagement";
import NotFound from "./pages/NotFound";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  // If user needs clinic setup, redirect to setup page
  if (needsClinicSetup) {
    return <Navigate to="/setup" replace />;
  }

  if (userProfile?.role === 'owner') {
    return <Navigate to="/owner" replace />;
  } else if (userProfile?.role === 'assistant') {
    return <Navigate to="/assistant" replace />;
  } else if (userProfile?.role === 'admin') {
    return <Navigate to="/owner" replace />; // Admins use owner dashboard
  } else {
    // If no profile or unknown role, wait a bit more or redirect to home
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClinicProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<ClinicSetup />} />
              <Route path="/clinic/:clinicCode" element={<ClinicLogin />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ClinicProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
