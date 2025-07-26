import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: string;
  name: string;
  clinic_id: string;
  pin?: string;
  pin_attempts: number;
  pin_locked_until?: string;
  last_login?: string;
  display_order: number;
  is_active: boolean;
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
            
          if (!error && data) {
            setUserProfile(data);
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
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signInWithPin = async (assistantName: string, pin: string, clinicId: string): Promise<{ error?: string }> => {
    try {
      // First, check if the assistant exists and is active with a valid PIN
      const { data: assistant, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('name', assistantName)
        .eq('clinic_id', clinicId)
        .in('role', ['assistant', 'admin'])
        .eq('is_active', true)
        .not('pin', 'is', null)
        .single();

      if (fetchError || !assistant) {
        return { error: 'Assistant not found or inactive' };
      }

      // Check if PIN matches
      if (assistant.pin !== pin) {
        // Increment pin attempts
        await supabase
          .from('users')
          .update({ 
            pin_attempts: (assistant.pin_attempts || 0) + 1,
            pin_locked_until: (assistant.pin_attempts || 0) >= 2 ? 
              new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
          })
          .eq('id', assistant.id);

        return { error: 'Invalid PIN' };
      }

      // Check if account is locked
      if (assistant.pin_locked_until && new Date(assistant.pin_locked_until) > new Date()) {
        return { error: 'Account temporarily locked. Try again later.' };
      }

      // Create session data
      const sessionData = {
        userId: assistant.id,
        clinicId: assistant.clinic_id,
        name: assistant.name,
        role: assistant.role,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      // Reset pin attempts and update last login
      await supabase
        .from('users')
        .update({ 
          pin_attempts: 0,
          pin_locked_until: null,
          last_login: new Date().toISOString()
        })
        .eq('id', assistant.id);

      // Set user profile immediately for faster response
      setUserProfile(assistant);
      setLoading(false);
      
      // Store session in localStorage
      localStorage.setItem('assistant_session', JSON.stringify(sessionData));

      return {};
    } catch (error) {
      console.error('PIN sign-in error:', error);
      return { error: 'Authentication failed' };
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clinic_id', clinicId)
        .in('role', ['assistant', 'admin'])
        .eq('is_active', true)
        .not('pin', 'is', null)  // Only include assistants with PINs
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching assistants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching assistants:', error);
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