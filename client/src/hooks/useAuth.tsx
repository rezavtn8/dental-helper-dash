import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: string;
  name: string;
  clinic_id: string;
  email?: string | null;
  pin?: string | null;
  pin_attempts: number;
  pin_locked_until?: string | null;
  last_login?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  created_by?: string | null;
  must_change_pin?: boolean | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithPin: (assistantName: string, pin: string, clinicId: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, userData: { name: string; role: 'owner' | 'assistant'; clinicCode?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  generatePinForAssistant: (assistantId: string) => Promise<{ pin?: string; error?: string }>;
  resetAssistantPin: (assistantId: string) => Promise<{ pin?: string; error?: string }>;
  getClinicAssistants: (clinicId: string) => Promise<UserProfile[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile from public.users table
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        // Check for assistant session from localStorage
        checkAssistantSession();
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAssistantSession = async () => {
    try {
      const assistantSession = localStorage.getItem('assistant_session');
      if (assistantSession) {
        const sessionData = JSON.parse(assistantSession);
        const { userId, expiresAt } = sessionData;
        
        // Check if session is still valid
        if (Date.now() < expiresAt) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .eq('is_active', true)
            .single();
            
          if (!error && data && data.role && data.name) {
            setUserProfile({
              ...data,
              role: data.role,
              name: data.name,
              pin_attempts: data.pin_attempts || 0,
              display_order: data.display_order || 0,
              is_active: data.is_active ?? true
            });
            setLoading(false);
            return;
          }
        }
        
        // Remove invalid or expired session
        localStorage.removeItem('assistant_session');
      }
    } catch (error) {
      console.error('Error checking assistant session:', error);
      localStorage.removeItem('assistant_session');
    }
    setLoading(false);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data && data.role && data.name) {
        setUserProfile({
          ...data,
          role: data.role,
          name: data.name,
          pin_attempts: data.pin_attempts || 0,
          display_order: data.display_order || 0,
          is_active: data.is_active ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signInWithPin = async (assistantName: string, pin: string, clinicId: string): Promise<{ error?: string }> => {
    try {
      console.log('Attempting PIN sign in:', { assistantName, pin, clinicId });
      
      // Find the assistant by name, PIN, and clinic
      const { data: assistantData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('name', assistantName)
        .eq('pin', pin)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .in('role', ['assistant', 'admin'])
        .maybeSingle();

      if (fetchError) {
        console.error('Database error during assistant lookup:', fetchError);
        return { error: 'Login failed. Please try again.' };
      }

      if (!assistantData) {
        console.error('Assistant not found with provided credentials');
        return { error: 'Invalid assistant name or PIN' };
      }

      console.log('Assistant found, creating session...');

      // Create session data for the assistant
      const sessionData = {
        assistantId: assistantData.id,
        clinicId: clinicId,
        name: assistantData.name,
        role: assistantData.role,
        loginTime: new Date().toISOString()
      };

      // Store session in localStorage for persistence
      localStorage.setItem('assistant_session', JSON.stringify(sessionData));

      // Update the user state
      setUser({
        id: assistantData.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: assistantData.email || '',
        app_metadata: {},
        user_metadata: {},
        created_at: assistantData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as User);

      // Set user profile
      setUserProfile({
        id: assistantData.id,
        name: assistantData.name || '',
        email: assistantData.email,
        role: assistantData.role || '',
        clinic_id: assistantData.clinic_id,
        pin: assistantData.pin,
        is_active: assistantData.is_active ?? true,
        pin_attempts: assistantData.pin_attempts || 0,
        pin_locked_until: assistantData.pin_locked_until,
        last_login: assistantData.last_login,
        display_order: assistantData.display_order || 0
      });

      // Update last login time
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', assistantData.id);

      console.log('PIN sign in successful');
      return {};

    } catch (error) {
      console.error('Error during PIN sign in:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  const generatePinForAssistant = async (assistantId: string): Promise<{ pin?: string; error?: string }> => {
    try {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { error } = await supabase
        .from('users')
        .update({ pin })
        .eq('id', assistantId);

      if (error) {
        return { error: error.message };
      }

      return { pin };
    } catch (error) {
      console.error('PIN generation error:', error);
      return { error: 'Failed to generate PIN' };
    }
  };

  const resetAssistantPin = async (assistantId: string): Promise<{ pin?: string; error?: string }> => {
    return generatePinForAssistant(assistantId);
  };

  const getClinicAssistants = async (clinicId: string): Promise<UserProfile[]> => {
    try {
      console.log('Fetching assistants for clinic:', clinicId);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, pin, role, is_active, clinic_id, email, display_order, pin_attempts, pin_locked_until, last_login, created_at, created_by')
        .eq('clinic_id', clinicId)
        .in('role', ['assistant', 'admin'])
        .eq('is_active', true)
        .not('pin', 'is', null)
        .neq('pin', '')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching clinic assistants:', error);
        return [];
      }

      console.log('Found assistants:', data);
      return (data || []).filter(assistant => 
        assistant.role && assistant.name
      ).map(assistant => ({
        ...assistant,
        role: assistant.role!,
        name: assistant.name!,
        pin_attempts: assistant.pin_attempts || 0,
        display_order: assistant.display_order || 0,
        is_active: assistant.is_active ?? true
      }));
    } catch (error) {
      console.error('Error in getClinicAssistants:', error);
      return [];
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Email sign-in error:', error);
      return { error: 'Authentication failed' };
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; role: 'owner' | 'assistant' }): Promise<{ error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        return { error: error.message };
      }

      // Create user profile in public.users table
      if (data.user) {
        // Get the first clinic (or create logic to assign to specific clinic)
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('id')
          .limit(1)
          .single();

        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            name: userData.name,
            role: userData.role,
            clinic_id: clinicData?.id
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { error: 'Failed to create user profile' };
        }
      }

      return {};
    } catch (error) {
      console.error('Sign-up error:', error);
      return { error: 'Registration failed' };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.removeItem('assistant_session');
    setSession(null);
    setUser(null);
    setUserProfile(null);
  };

  const value: AuthContextType = {
    session,
    user,
    userProfile,
    loading,
    signInWithEmail,
    signInWithPin,
    signUp,
    signOut,
    generatePinForAssistant,
    resetAssistantPin,
    getClinicAssistants,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};