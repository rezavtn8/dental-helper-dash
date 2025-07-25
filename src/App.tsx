import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ClinicProvider } from "@/hooks/useClinic";
import Home from "./pages/Home";
import ClinicSetup from "./pages/ClinicSetup";
import ClinicLogin from "./pages/ClinicLogin";
import Login from "./pages/Login";
import AssistantDashboard from "./pages/AssistantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import ClinicManagement from "./pages/ClinicManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, userProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const RoleBasedRedirect = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (userProfile?.role === 'owner') {
    return <Navigate to="/owner" replace />;
  } else if (userProfile?.role === 'assistant') {
    return <Navigate to="/assistant" replace />;
  } else {
    return <Navigate to="/" replace />;
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
              <Route path="/setup" element={<ClinicSetup />} />
              <Route path="/clinic/:clinicCode" element={<ClinicLogin />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
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
