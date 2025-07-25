import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AssistantSession {
  id: string;
  name: string;
  role: 'assistant';
  pin: string;
  clinic_id: string;
}

interface OwnerSession {
  id: string;
  email: string;
  role: 'owner';
  clinic_id: string;
}

type AuthSession = AssistantSession | OwnerSession | null;

interface AuthContextType {
  session: AuthSession;
  user: User | null;
  supabaseSession: Session | null;
  loading: boolean;
  signInWithPin: (userId: string, pin: string) => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(null);
  const [user, setUser] = useState<User | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSupabaseSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Owner session
          setSession({
            id: session.user.id,
            email: session.user.email!,
            role: 'owner',
            clinic_id: '' // Will be fetched from users table
          });
        } else if (!session) {
          // Check for assistant session in localStorage
          const assistantSession = localStorage.getItem('assistantSession');
          if (assistantSession) {
            try {
              const parsed = JSON.parse(assistantSession);
              setSession(parsed);
            } catch (error) {
              console.error('Error parsing assistant session:', error);
              localStorage.removeItem('assistantSession');
            }
          }
        }
        setLoading(false);
      }
    );

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
      setUser(session?.user ?? null);
    });

    // Check for assistant session in localStorage
    const assistantSession = localStorage.getItem('assistantSession');
    if (assistantSession && !supabaseSession) {
      try {
        const parsed = JSON.parse(assistantSession);
        setSession(parsed);
      } catch (error) {
        console.error('Error parsing assistant session:', error);
        localStorage.removeItem('assistantSession');
      }
    }

    setLoading(false);

    return () => subscription.unsubscribe();
  }, []);

  const signInWithPin = async (userId: string, pin: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('pin', parseInt(pin))
        .eq('role', 'assistant')
        .single();

      if (error || !data) {
        return { error: 'Invalid PIN or user not found' };
      }

      // Create assistant session
      const assistantSession: AssistantSession = {
        id: data.id,
        name: data.name,
        role: 'assistant',
        pin: data.pin.toString(),
        clinic_id: data.clinic_id
      };

      // Store in localStorage and state
      localStorage.setItem('assistantSession', JSON.stringify(assistantSession));
      setSession(assistantSession);

      return {};
    } catch (error) {
      console.error('PIN authentication error:', error);
      return { error: 'Authentication failed' };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Email authentication error:', error);
      return { error: 'Authentication failed' };
    }
  };

  const signOut = async () => {
    if (session?.role === 'assistant') {
      localStorage.removeItem('assistantSession');
      setSession(null);
    } else {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setSupabaseSession(null);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      supabaseSession,
      loading,
      signInWithPin,
      signInWithEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};