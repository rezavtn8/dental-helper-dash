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
import AssistantDashboard from "./components/AssistantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ClinicManagement from "./pages/ClinicManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, userProfile } = useAuth();

  console.log('ProtectedRoute check:', { 
    loading, 
    hasSession: !!session, 
    hasUserProfile: !!userProfile, 
    userRole: userProfile?.role 
  });

  if (loading) {
    console.log('ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // For assistant sessions, we might not have a traditional session but we have userProfile
  if (!session && !userProfile) {
    console.log('ProtectedRoute: No session and no userProfile, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
};

const RoleBasedRedirect = () => {
  const { userProfile, loading } = useAuth();

  console.log('RoleBasedRedirect check:', { 
    loading, 
    userProfile, 
    role: userProfile?.role 
  });

  if (loading) {
    console.log('RoleBasedRedirect: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  switch (userProfile?.role) {
    case 'owner':
      console.log('RoleBasedRedirect: Rendering OwnerDashboard');
      return <OwnerDashboard />;
    case 'admin':
      console.log('RoleBasedRedirect: Rendering AdminDashboard');
      return <AdminDashboard />;
    case 'assistant':
      console.log('RoleBasedRedirect: Rendering AssistantDashboard');
      return <AssistantDashboard />;
    default:
      console.log('RoleBasedRedirect: Unknown role, redirecting to home', userProfile?.role);
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
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <RoleBasedRedirect />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assistant" 
                element={
                  <ProtectedRoute>
                    <AssistantDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
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
