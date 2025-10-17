import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ClinicRequiredRouteProps {
  children: React.ReactNode;
  requiredRole?: 'owner' | 'assistant' | 'front_desk' | 'admin';
}

export const ClinicRequiredRoute: React.FC<ClinicRequiredRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { userProfile, loading } = useAuth();
  const [roleVerified, setRoleVerified] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Server-side role verification when role is required
    if (requiredRole && userProfile?.clinic_id && !loading) {
      const verifyRole = async () => {
        setVerifying(true);
        try {
          const { data, error } = await supabase.rpc('verify_user_has_role', {
            required_role: requiredRole
          });

          if (error) {
            console.error('Role verification error:', error);
            setRoleVerified(false);
          } else {
            const result = data as { hasRole: boolean; userId: string; clinicId: string };
            setRoleVerified(result?.hasRole || false);
          }
        } catch (error) {
          console.error('Role verification failed:', error);
          setRoleVerified(false);
        } finally {
          setVerifying(false);
        }
      };

      verifyRole();
    } else if (!requiredRole || !userProfile?.clinic_id) {
      // No role required or no clinic, allow access
      setRoleVerified(true);
    }
  }, [requiredRole, userProfile?.clinic_id, loading]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Server-side verification failed
  if (requiredRole && roleVerified === false) {
    return <Navigate to="/hub" replace />;
  }

  return <>{children}</>;
};