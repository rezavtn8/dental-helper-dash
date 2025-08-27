import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Clinic {
  id: string;
  name: string;
  clinic_code: string;
  domain_slug?: string;
  is_active: boolean;
  subscription_status: string;
}

interface ClinicContextType {
  clinic: Clinic | null;
  clinicCode: string | null;
  loading: boolean;
  setClinicFromCode: (code: string) => Promise<boolean>;
  clearClinic: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [clinicCode, setClinicCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only try to load clinic on specific routes that need it
    const urlPath = window.location.pathname;
    const needsClinic = urlPath.startsWith('/clinic/') || urlPath.startsWith('/owner') || urlPath.startsWith('/assistant');
    
    if (!needsClinic) {
      setLoading(false);
      return;
    }
    
    const codeFromUrl = urlPath.startsWith('/clinic/') ? urlPath.split('/clinic/')[1] : null;
    const savedClinicCode = localStorage.getItem('clinic_code');
    
    if (codeFromUrl) {
      setClinicFromCode(codeFromUrl);
    } else if (savedClinicCode) {
      setClinicFromCode(savedClinicCode);
    } else {
      setLoading(false);
    }
  }, []);

  const setClinicFromCode = async (code: string): Promise<boolean> => {
    setLoading(true);
    
    // Check if we already failed to load this code recently to prevent spam
    const failedKey = `clinic_failed_${code}`;
    const lastFailed = localStorage.getItem(failedKey);
    if (lastFailed && Date.now() - parseInt(lastFailed) < 60000) { // 1 minute cooldown
      setLoading(false);
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('clinic_code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        // Cache the failure to prevent repeated attempts
        localStorage.setItem(failedKey, Date.now().toString());
        setLoading(false);
        return false;
      }

      setClinic(data);
      setClinicCode(code);
      localStorage.setItem('clinic_code', code);
      localStorage.removeItem(failedKey); // Clear any previous failure cache
      setLoading(false);
      return true;
    } catch (error) {
      localStorage.setItem(failedKey, Date.now().toString());
      setLoading(false);
      return false;
    }
  };

  const clearClinic = () => {
    setClinic(null);
    setClinicCode(null);
    localStorage.removeItem('clinic_code');
  };

  const value: ClinicContextType = {
    clinic,
    clinicCode,
    loading,
    setClinicFromCode,
    clearClinic,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};