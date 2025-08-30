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
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  createInvitation: (email: string, name: string) => Promise<{ token?: string; error?: string }>;
  acceptInvitation: (token: string) => Promise<{ error?: string }>;
  getInvitations: () => Promise<{ invitations: any[]; error?: string }>;
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Check for existing session
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User profile doesn't exist, create it
          await createUserProfile(userId);
        } else {
          throw error;
        }
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileData = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: user.user_metadata?.role || 'assistant',
        clinic_id: user.user_metadata?.clinic_id || null,
        is_active: true
      };

      const { data, error } = await supabase
        .from('users')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
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
      return { error: 'Failed to sign in' };
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { error: 'Failed to sign in with Google' };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'owner' | 'assistant'): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
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
        return { error: error.message };
      }

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

  const createInvitation = async (email: string, name: string): Promise<{ token?: string; error?: string }> => {
    try {
      if (!userProfile?.clinic_id) {
        return { error: 'No clinic found' };
      }

      const { data, error } = await supabase.rpc('create_simple_invitation', {
        p_email: email,
        p_name: name,
        p_clinic_id: userProfile.clinic_id
      });

      if (error) {
        return { error: error.message };
      }

      const result = data[0];
      return { token: result.token };
    } catch (error) {
      console.error('Failed to create invitation:', error);
      return { error: 'Failed to create invitation' };
    }
  };

  const acceptInvitation = async (token: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('accept_simple_invitation', {
        p_token: token
      });

      if (error) {
        return { error: error.message };
      }

      const result = data[0];
      if (!result.success) {
        return { error: result.message };
      }

      // Refresh user profile after accepting invitation
      if (user) {
        await fetchUserProfile(user.id);
      }

      return {};
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      return { error: 'Failed to accept invitation' };
    }
  };

  const getInvitations = async (): Promise<{ invitations: any[]; error?: string }> => {
    try {
      if (!userProfile?.clinic_id) {
        return { invitations: [] };
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { invitations: [], error: error.message };
      }

      return { invitations: data || [] };
    } catch (error) {
      console.error('Failed to get invitations:', error);
      return { invitations: [], error: 'Failed to get invitations' };
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
      signUp,
      signOut,
      createInvitation,
      acceptInvitation,
      getInvitations,
      refreshUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};