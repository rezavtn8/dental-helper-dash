import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  clinic_id: string | null;
  is_active: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Update last_login on sign_in events
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          updateLastLogin(session.user.id);
          fetchUserProfile(session.user.id);
        }, 0);
      } else if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user profile');
        return;
      }

      console.log('Profile fetch result:', data);

      if (!data) {
        console.log('No profile found, creating new profile');
        // User profile doesn't exist, create it
        await createUserProfile(userId);
      } else {
        console.log('Profile found, setting user profile');
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found when creating profile');
        return;
      }

      const profileData = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: user.user_metadata?.role || 'assistant',
        clinic_id: user.user_metadata?.clinic_id || null,
        is_active: true
      };

      console.log('Creating user profile:', profileData);

      const { data, error } = await supabase
        .from('users')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting user profile:', error);
        // Try to handle duplicate key error
        if (error.code === '23505') {
          console.log('Profile already exists, fetching existing profile');
          const { data: existingData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          if (existingData) {
            setUserProfile(existingData);
          }
        }
        return;
      }

      console.log('User profile created:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      console.log('Attempting sign in for:', email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error);
        return { error: error.message };
      }

      console.log('Sign-in successful:', data);

      // Update last_login timestamp
      if (data.user) {
        await updateLastLogin(data.user.id);
      }

      return {};
    } catch (error) {
      console.error('Email sign-in error:', error);
      return { error: 'Failed to sign in' };
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        return { error: error.message };
      }

      // Update last_login timestamp when auth state changes
      return {};
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { error: 'Failed to sign in with Google' };
    }
  };

  const signInWithMagicLink = async (email: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      console.error('Magic link error:', error);
      return { error: 'Failed to send magic link' };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'owner' | 'assistant' = 'assistant'): Promise<{ error?: string }> => {
    try {
      console.log('Attempting sign up for:', email, 'with role:', role);
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            role,
          }
        }
      });

      if (error) {
        console.error('Sign-up error:', error);
        return { error: error.message };
      }

      console.log('Sign-up successful:', data);
      return {};
    } catch (error) {
      console.error('Sign-up error:', error);
      return { error: 'Failed to create account' };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  // Function to update last login timestamp
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Function to refresh user profile (expose it)
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      userProfile,
      loading,
      signInWithEmail,
      signInWithGoogle,
      signInWithMagicLink,
      signUp,
      signOut,
      refreshUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};