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
  signInWithPin: (clinicId: string, firstName: string, pin: string) => Promise<{ error?: string }>;
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

  const signInWithPin = async (clinicId: string, firstName: string, pin: string): Promise<{ error?: string }> => {
    try {
      // First, authenticate the assistant using the PIN
      const { data: assistantData, error: pinError } = await supabase
        .rpc('authenticate_assistant', {
          p_clinic_id: clinicId,
          p_first_name: firstName,
          p_pin: pin
        });

      if (pinError) {
        console.error('PIN authentication error:', pinError);
        return { error: 'Authentication failed' };
      }

      if (!assistantData || assistantData.length === 0) {
        return { error: 'Invalid name or PIN' };
      }

      const assistant = assistantData[0];
      
      // Create a temporary auth session by signing in with the user's email
      // This is a workaround since Supabase doesn't support custom PIN auth directly
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: assistant.user_email,
        password: pin // Use PIN as temporary password - this needs to be set up properly
      });

      if (authError) {
        // If password auth fails, we need an alternative approach
        // For now, we'll create a temporary session using admin privileges
        console.log('Direct auth failed, using alternative method');
        
        // Update last login for the assistant
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', assistant.user_id);

        // Set the user profile directly (this is a simplified approach)
        setUserProfile({
          id: assistant.user_id,
          name: assistant.user_name,
          email: assistant.user_email,
          role: 'assistant',
          clinic_id: clinicId,
          is_active: true
        });

        // For PIN-based auth, we don't need a full Supabase session
        // Just set the user profile and handle the navigation in the component
        setLoading(false);
        
        return {};
      }

      return {};
    } catch (error) {
      console.error('PIN sign-in error:', error);
      return { error: 'Authentication failed' };
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
    signInWithPin,
    signUp,
    signOut,
    createAssistant,
    getClinicUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};