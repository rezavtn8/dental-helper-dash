import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Clinic {
  id: string;
  name: string;
  clinic_code: string;
  domain_slug?: string | null;
  is_active: boolean | null;
  subscription_status: string | null;
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
    // Only get clinic from URL, don't auto-load from localStorage
    // This prevents the "most recent clinic" bug
    const urlPath = window.location.pathname;
    const codeFromUrl = urlPath.startsWith('/clinic/') ? urlPath.split('/clinic/')[1] : null;
    
    if (codeFromUrl) {
      console.log('Loading clinic from URL:', codeFromUrl);
      setClinicFromCode(codeFromUrl);
    } else {
      // Clear any existing clinic state when not on a clinic page
      setClinic(null);
      setClinicCode(null);
      setLoading(false);
    }
  }, [window.location.pathname]); // React to URL changes

  const setClinicFromCode = async (code: string): Promise<boolean> => {
    setLoading(true);
    
    // Clear previous clinic state first to prevent stale data
    setClinic(null);
    setClinicCode(null);
    
    try {
      console.log('Fetching clinic with code:', code);
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('clinic_code', code.toLowerCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Clinic not found for code:', code, error);
        localStorage.removeItem('clinic_code'); // Clear invalid code
        setLoading(false);
        return false;
      }

      console.log('Found clinic:', data);
      const clinicData = {
        ...data,
        is_active: data.is_active ?? true,
        subscription_status: data.subscription_status || 'active'
      };
      
      setClinic(clinicData);
      setClinicCode(code.toLowerCase().trim());
      localStorage.setItem('clinic_code', code.toLowerCase().trim());
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error fetching clinic:', error);
      localStorage.removeItem('clinic_code'); // Clear on error
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