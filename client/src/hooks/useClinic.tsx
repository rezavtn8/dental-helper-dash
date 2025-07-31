import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Clinic {
  id: string;
  name: string;
  clinic_code: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  subscription_status: string;
  created_at?: string;
  updated_at?: string;
}

interface ClinicContextType {
  clinic: Clinic | null;
  clinicCode: string | null;
  loading: boolean;
  setClinicFromCode: (code: string) => Promise<boolean>;
  clearClinic: () => void;
  refreshClinic: () => Promise<void>;
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

  // Completely clear all clinic-related state and cache
  const clearAllState = () => {
    console.log('🧹 Clearing all clinic state and cache');
    setClinic(null);
    setClinicCode(null);
    // Don't clear recentClinics here - that's managed by Home component
  };

  // Extract clinic code from current URL
  const getClinicCodeFromUrl = (): string | null => {
    const path = window.location.pathname;
    if (path.startsWith('/clinic/')) {
      const code = path.split('/clinic/')[1]?.split('?')[0]?.split('/')[0];
      return code ? decodeURIComponent(code.trim()) : null;
    }
    return null;
  };

  // Fetch clinic data from database
  const fetchClinicByCode = async (code: string): Promise<Clinic | null> => {
    const normalizedCode = code.toLowerCase().trim();
    console.log('🔍 Fetching clinic for code:', normalizedCode);

    try {
      // First, debug what clinics exist
      const { data: allClinics } = await supabase
        .from('clinics')
        .select('id, name, clinic_code, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('📋 Available clinics in database:', allClinics);

      // Search for exact match
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('clinic_code', normalizedCode)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('❌ Exact match failed:', error);
        
        // Try case-insensitive fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('clinics')
          .select('*')
          .ilike('clinic_code', normalizedCode)
          .eq('is_active', true)
          .single();

        if (fallbackError || !fallbackData) {
          console.error('❌ Case-insensitive fallback also failed:', fallbackError);
          return null;
        }

        console.log('✅ Found clinic via fallback search:', fallbackData);
        return {
          ...fallbackData,
          is_active: fallbackData.is_active ?? true,
          subscription_status: fallbackData.subscription_status || 'active'
        };
      }

      console.log('✅ Found clinic via exact match:', {
        id: data.id,
        name: data.name,
        clinic_code: data.clinic_code
      });

      return {
        ...data,
        is_active: data.is_active ?? true,
        subscription_status: data.subscription_status || 'active'
      };
    } catch (error) {
      console.error('❌ Database error:', error);
      return null;
    }
  };

  // Set clinic from code with proper state management
  const setClinicFromCode = async (code: string): Promise<boolean> => {
    const normalizedCode = code.toLowerCase().trim();
    console.log('🎯 Setting clinic from code:', normalizedCode);

    if (!normalizedCode) {
      console.error('❌ Empty clinic code provided');
      return false;
    }

    setLoading(true);
    clearAllState();

    try {
      const clinicData = await fetchClinicByCode(normalizedCode);
      
      if (!clinicData) {
        console.error('❌ No clinic found for code:', normalizedCode);
        setLoading(false);
        return false;
      }

      console.log('✅ Successfully loaded clinic:', clinicData.name);
      setClinic(clinicData);
      setClinicCode(normalizedCode);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('❌ Error in setClinicFromCode:', error);
      setLoading(false);
      return false;
    }
  };

  // Refresh current clinic data
  const refreshClinic = async () => {
    if (!clinicCode) return;
    
    console.log('🔄 Refreshing clinic data');
    await setClinicFromCode(clinicCode);
  };

  // Clear clinic state
  const clearClinic = () => {
    console.log('🧹 Clearing clinic state');
    clearAllState();
    setLoading(false);
  };

  // Handle URL changes
  useEffect(() => {
    const handleUrlChange = async () => {
      const urlCode = getClinicCodeFromUrl();
      console.log('🔄 URL changed, extracted code:', urlCode);

      if (urlCode) {
        // Only fetch if it's a different clinic or we don't have clinic data
        if (!clinic || clinic.clinic_code !== urlCode.toLowerCase()) {
          console.log('🔄 Loading new clinic from URL');
          await setClinicFromCode(urlCode);
        } else {
          console.log('✅ Clinic already loaded for this code');
          setLoading(false);
        }
      } else {
        // Not on a clinic page
        console.log('🏠 Not on clinic page, clearing state');
        clearClinic();
      }
    };

    handleUrlChange();
  }, [window.location.pathname]);

  const value: ClinicContextType = {
    clinic,
    clinicCode,
    loading,
    setClinicFromCode,
    clearClinic,
    refreshClinic,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};
