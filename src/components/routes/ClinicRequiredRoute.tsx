import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ClinicRequiredRouteProps {
  children: React.ReactNode;
  requiredRole?: 'owner' | 'assistant' | 'admin';
}

export const ClinicRequiredRoute: React.FC<ClinicRequiredRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
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

  // Check if user has a clinic
  if (!userProfile?.clinic_id) {
    return <Navigate to="/hub" replace />;
  }

  // Check role if specified
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to="/hub" replace />;
  }

  return <>{children}</>;
};