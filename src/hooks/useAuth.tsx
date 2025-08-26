import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: string;
  name: string;
  email: string;
  clinic_id: string;
  last_login?: string;
  is_active: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  needsClinicSetup: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  createAssistantInvitation: (email: string, name: string) => Promise<{ invitationId?: string; token?: string; error?: string }>;
  acceptInvitation: (token: string) => Promise<{ success: boolean; message: string; clinicId?: string }>;
  getInvitations: () => Promise<{ invitations: any[]; error?: string }>;
  signUp: (email: string, password: string, userData: { name: string; role: 'owner' | 'assistant'; clinicId?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  createAssistant: (email: string, name: string, clinicId: string) => Promise<{ error?: string }>;
  getClinicUsers: (clinicId: string) => Promise<UserProfile[]>;
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
  const [needsClinicSetup, setNeedsClinicSetup] = useState(false);
  const [profileCreationInProgress, setProfileCreationInProgress] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
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
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (profileCreationInProgress) {
      console.log('Profile creation already in progress, skipping...');
      return;
    }

    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        console.log('User profile found:', data);
        setUserProfile(data);
        setNeedsClinicSetup(false);
      } else {
        console.log('No user profile found, attempting to create one...');
        setProfileCreationInProgress(true);
        
        // Try to create a user profile for users who logged in
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          await createUserProfileFromAuth(authUser.user);
        }
        
        setProfileCreationInProgress(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfileCreationInProgress(false);
    }
  };

  const createUserProfileFromAuth = async (user: any) => {
    try {
      console.log('Creating user profile from auth user:', user);
      const userMetadata = user.user_metadata || {};
      const userRole = userMetadata.role || 'assistant';
      
      // For owners without a clinic_id, set the flag instead of redirecting
      if (userRole === 'owner' && !userMetadata.clinic_id) {
        console.log('Owner without clinic_id detected, flagging for clinic setup');
        setNeedsClinicSetup(true);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: userMetadata.full_name || userMetadata.name || user.email?.split('@')[0] || 'User',
          role: userRole,
          clinic_id: userMetadata.clinic_id || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        // If it's a constraint error and user is an owner, flag for setup
        if (error.code === '23502' && userRole === 'owner') {
          console.log('Flagging owner for clinic setup due to missing clinic_id');
          setNeedsClinicSetup(true);
          setLoading(false);
          return;
        }
        return;
      }

      if (data) {
        console.log('User profile created:', data);
        setUserProfile(data);
        setNeedsClinicSetup(false);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const createAssistant = async (email: string, name: string, clinicId: string): Promise<{ error?: string }> => {
    try {
      // Generate a temporary password
      const tempPassword = `temp${Math.floor(Math.random() * 100000)}`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/clinic`,
          data: { 
            name, 
            role: 'assistant',
            clinic_id: clinicId,
            must_change_password: true
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Assistant creation error:', error);
      return { error: 'Failed to create assistant' };
    }
  };

  const getClinicUsers = async (clinicId: string): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('role', { ascending: true });

      if (error) {
        console.error('Error fetching clinic users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching clinic users:', error);
      return [];
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { error: 'Google authentication failed' };
    }
  };

  const createAssistantInvitation = async (email: string, name: string): Promise<{ invitationId?: string; token?: string; error?: string }> => {
    try {
      console.log('Creating assistant invitation:', { email, name });
      
      if (!userProfile?.clinic_id) {
        throw new Error('No clinic ID available');
      }

      const { data, error } = await supabase.rpc('create_assistant_invitation', {
        p_clinic_id: userProfile.clinic_id,
        p_email: email.toLowerCase().trim(),
        p_name: name.trim()
      });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const result = data[0];
        console.log('Invitation created successfully:', result);
        return { 
          invitationId: result.invitation_id, 
          token: result.invitation_token 
        };
      }

      throw new Error('No data returned from invitation creation');
    } catch (error) {
      console.error('Failed to create invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create invitation';
      return { error: errorMessage };
    }
  };

  const acceptInvitation = async (token: string): Promise<{ success: boolean; message: string; clinicId?: string }> => {
    try {
      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_token: token
      });

      if (error) {
        console.error('Accept invitation error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const result = data[0];
        return {
          success: result.success,
          message: result.message,
          clinicId: result.clinic_id
        };
      }

      return { success: false, message: 'No response from server' };
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept invitation';
      return { success: false, message: errorMessage };
    }
  };

  const getInvitations = async (): Promise<{ invitations: any[]; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get invitations error:', error);
        throw error;
      }

      return { invitations: data || [] };
    } catch (error) {
      console.error('Failed to get invitations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get invitations';
      return { invitations: [], error: errorMessage };
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

  const signUp = async (email: string, password: string, userData: { name: string; role: 'owner' | 'assistant'; clinicId?: string }): Promise<{ error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { ...userData, clinic_id: userData.clinicId }
        }
      });

      if (error) {
        return { error: error.message };
      }

      // The user profile will be created automatically by the handle_new_user trigger
      return {};
    } catch (error) {
      console.error('Sign-up error:', error);
      return { error: 'Registration failed' };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserProfile(null);
  };

  const value: AuthContextType = {
    session,
    user,
    userProfile,
    loading,
    needsClinicSetup,
    signInWithEmail,
    signInWithGoogle,
    createAssistantInvitation,
    acceptInvitation,
    getInvitations,
    signUp,
    signOut,
    createAssistant,
    getClinicUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};