import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ui/error-fallback";
import { ClinicRequiredRoute } from "@/components/routes/ClinicRequiredRoute";
import { errorLogger } from "@/lib/errorLogger";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AssistantHub from './pages/AssistantHub';
import JoinClinic from './pages/JoinClinic';
import AssistantDashboard from './pages/AssistantDashboard';
import FrontDeskDashboard from './pages/FrontDeskDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: false,
      onError: (error) => {
        errorLogger.logError(error as Error, {
          component: 'ReactQuery',
          action: 'mutation_error'
        });
      }
    },
  },
});

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

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/hub" element={<ProtectedRoute><AssistantHub /></ProtectedRoute>} />
      <Route path="/join" element={<ProtectedRoute><JoinClinic /></ProtectedRoute>} />
      <Route path="/assistant" element={
        <ProtectedRoute>
          <ClinicRequiredRoute requiredRole="assistant">
            <AssistantDashboard />
          </ClinicRequiredRoute>
        </ProtectedRoute>
      } />
      <Route path="/front-desk" element={
        <ProtectedRoute>
          <ClinicRequiredRoute requiredRole="front_desk">
            <FrontDeskDashboard />
          </ClinicRequiredRoute>
        </ProtectedRoute>
      } />
      <Route path="/owner" element={
        <ProtectedRoute>
          <ClinicRequiredRoute requiredRole="owner">
            <OwnerDashboard />
          </ClinicRequiredRoute>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <ErrorBoundary 
    FallbackComponent={ErrorFallback}
    onError={(error, errorInfo) => {
      errorLogger.logError(error, {
        component: 'AppErrorBoundary',
        action: 'react_error',
        additionalData: { componentStack: errorInfo.componentStack }
      });
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthErrorBoundary>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </AuthErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;