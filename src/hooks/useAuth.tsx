import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthError } from './useAuthError';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  clinic_id: string;
  last_login?: string;
  is_active: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  needsClinicSetup: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  createAssistantInvitation: (email: string, name: string) => Promise<{ invitationToken?: string; invitationId?: string; error?: string }>;
  resendInvitation: (invitationId: string) => Promise<{ error?: string; token?: string; newExpiryDate?: string; resendCount?: number }>;
  cancelInvitation: (invitationId: string) => Promise<{ error?: string }>;
  acceptInvitation: (token: string) => Promise<{ error?: string; clinicId?: string }>;
  getInvitations: () => Promise<{ invitations: any[]; error?: string }>;
  getPendingInvitationsByEmail: (email: string) => Promise<{ invitations: any[]; error?: string }>;
  checkAndLinkPendingInvitation: (userId: string, email: string) => Promise<{ linked: boolean; clinicId?: string }>;
  signUp: (email: string, password: string, userData: { name: string; role: 'owner' | 'assistant'; clinicId?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  createAssistant: (email: string, name: string, clinicId: string) => Promise<{ error?: string }>;
  getClinicUsers: (clinicId: string) => Promise<{ users: any[]; error?: string }>;
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
  const [needsClinicSetup, setNeedsClinicSetup] = useState(false);
  const { handleAuthError } = useAuthError();

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Defer async operations to prevent deadlocks
      if (session?.user && event === 'SIGNED_IN') {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else if (!session?.user) {
        setUserProfile(null);
        setNeedsClinicSetup(false);
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

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const TIMEOUT_MS = 10000;
    
    try {
      setLoading(true);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), TIMEOUT_MS)
      );
      
      // Race between profile fetch and timeout
      const profilePromise = supabase
        .from('users')
        .select('id, name, email, role, clinic_id, is_active, created_at, last_login, created_by')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('User profile not found, will need to create one');
          // Try to create profile from auth user data
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await createUserProfileFromAuth(user);
          }
        } else {
          throw error;
        }
      } else {
        setUserProfile(data);
        
        // Check if this is an owner without a clinic
        if (data.role === 'owner' && !data.clinic_id) {
          setNeedsClinicSetup(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Retry logic for transient failures
      if (retryCount < MAX_RETRIES && error.message !== 'Profile fetch timeout') {
        console.log(`Retrying profile fetch (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => fetchUserProfile(userId, retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      // If all retries failed, set a fallback state
      console.error('Profile fetch failed after retries:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfileFromAuth = async (user: any) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: user.user_metadata?.role || 'assistant',
        clinic_id: user.user_metadata?.clinic_id || null,
        is_active: true
      };

      // For assistants without clinic_id, check for pending invitations
      if (profileData.role === 'assistant' && !profileData.clinic_id) {
        const { data: invitationData } = await supabase
          .from('invitations')
          .select('clinic_id')
          .eq('email', user.email)
          .eq('status', 'pending')
          .single();
        
        if (invitationData) {
          profileData.clinic_id = invitationData.clinic_id;
        }
      }

      const { data, error } = await supabase
        .from('users')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      
      setUserProfile(data);
      
      if (data.role === 'owner' && !data.clinic_id) {
        setNeedsClinicSetup(true);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const createAssistant = async (email: string, name: string, clinicId: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.admin.createUser({
        email,
        password: 'temp-password-' + Math.random(),
        email_confirm: true,
        user_metadata: { name, role: 'assistant', clinic_id: clinicId }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Failed to create assistant:', error);
      return { error: 'Failed to create assistant account' };
    }
  };

  const getClinicUsers = async (clinicId: string): Promise<{ users: any[]; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, clinic_id, is_active, created_at, last_login, created_by')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get clinic users error:', error);
        throw error;
      }

      return { users: data || [] };
    } catch (error) {
      console.error('Failed to get clinic users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get clinic users';
      return { users: [], error: errorMessage };
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        const userMessage = handleAuthError(error);
        return { error: userMessage };
      }
      
      return {};
    } catch (error) {
      console.error('Google sign-in error:', error);
      const userMessage = handleAuthError(error);
      return { error: userMessage };
    }
  };

  const createAssistantInvitation = async (email: string, name: string): Promise<{ invitationToken?: string; invitationId?: string; error?: string }> => {
    try {
      if (!userProfile?.clinic_id) {
        return { error: 'Clinic ID not found' };
      }

      const { data, error } = await supabase.rpc('create_assistant_invitation', {
        p_clinic_id: userProfile.clinic_id,
        p_email: email,
        p_name: name
      });

      if (error) {
        console.error('Create invitation error:', error);
        return { error: error.message };
      }

      const { invitation_id, invitation_token } = data[0];

      // Get clinic name for the email
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', userProfile.clinic_id)
        .single();

      if (clinicError) {
        console.error('Clinic fetch error:', clinicError);
        return { error: 'Failed to fetch clinic details' };
      }

      // Send invitation email via edge function
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitationToken: invitation_token,
          recipientEmail: email,
          recipientName: name,
          clinicName: clinicData.name,
          invitationId: invitation_id
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        return { error: 'Invitation created but email failed to send' };
      }

      return { 
        invitationToken: invitation_token, 
        invitationId: invitation_id 
      };
    } catch (error) {
      console.error('Failed to create assistant invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create invitation';
      return { error: errorMessage };
    }
  };

  const resendInvitation = async (invitationId: string): Promise<{ error?: string; token?: string; newExpiryDate?: string; resendCount?: number }> => {
    try {
      if (!userProfile?.clinic_id) {
        return { error: 'Clinic ID not found' };
      }

      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('invitations')
        .select('email, token, clinic_id, resend_count')
        .eq('id', invitationId)
        .eq('clinic_id', userProfile.clinic_id)
        .single();

      if (fetchError || !invitation) {
        return { error: 'Invitation not found' };
      }

      // Get clinic name
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', invitation.clinic_id)
        .single();

      if (clinicError) {
        return { error: 'Failed to fetch clinic details' };
      }

      // Update invitation expiry and reset email status  
      const newExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const newResendCount = (invitation?.resend_count || 0) + 1;
      
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ 
          expires_at: newExpiryDate,
          email_status: 'pending',
          resend_count: newResendCount
        })
        .eq('id', invitationId);

      if (updateError) {
        return { error: 'Failed to update invitation' };
      }

      // Resend email
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitationToken: invitation.token,
          recipientEmail: invitation.email,
          recipientName: invitation.email.split('@')[0], // Fallback name
          clinicName: clinicData.name,
          invitationId: invitationId
        }
      });

      if (emailError) {
        return { error: 'Failed to resend email' };
      }

      return { 
        token: invitation.token,
        newExpiryDate,
        resendCount: newResendCount
      };
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      return { error: 'Failed to resend invitation' };
    }
  };

  const cancelInvitation = async (invitationId: string): Promise<{ error?: string }> => {
    try {
      if (!userProfile || userProfile.role !== 'owner') {
        return { error: 'Only owners can cancel invitations' };
      }

      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)
        .eq('clinic_id', userProfile.clinic_id);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      return { error: 'Failed to cancel invitation' };
    }
  };

  const acceptInvitation = async (token: string): Promise<{ error?: string; clinicId?: string }> => {
    try {
      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_token: token
      });

      if (error) {
        console.error('Accept invitation error:', error);
        return { error: error.message };
      }

      const result = data[0];
      if (!result.success) {
        return { error: result.message };
      }

      // If user is logged in and accepts invitation, update their profile with clinic_id
      if (user && userProfile && !userProfile.clinic_id) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ clinic_id: result.clinic_id })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user profile with clinic_id:', updateError);
        } else {
          // Update local state
          setUserProfile({ ...userProfile, clinic_id: result.clinic_id });
        }
      }

      return { clinicId: result.clinic_id };
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept invitation';
      return { error: errorMessage };
    }
  };

  const getInvitations = async (): Promise<{ invitations: any[]; error?: string }> => {
    try {
      if (!userProfile?.clinic_id) {
        return { invitations: [], error: 'No clinic ID found' };
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
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

  const getPendingInvitationsByEmail = async (email: string): Promise<{ invitations: any[]; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          clinics!inner(name)
        `)
        .eq('email', email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get pending invitations error:', error);
        throw error;
      }

      return { invitations: data || [] };
    } catch (error) {
      console.error('Failed to get pending invitations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get pending invitations';
      return { invitations: [], error: errorMessage };
    }
  };

  const checkAndLinkPendingInvitation = async (userId: string, email: string): Promise<{ linked: boolean; clinicId?: string }> => {
    try {
      // Check for pending invitations
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('clinic_id, token')
        .eq('email', email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !invitation) {
        return { linked: false };
      }

      // Auto-accept the invitation
      const acceptResult = await acceptInvitation(invitation.token);
      
      if (acceptResult.error) {
        console.error('Auto-accept invitation failed:', acceptResult.error);
        return { linked: false };
      }

      return { linked: true, clinicId: acceptResult.clinicId };
    } catch (error) {
      console.error('Error checking pending invitations:', error);
      return { linked: false };
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const userMessage = handleAuthError(error);
        return { error: userMessage };
      }

      return {};
    } catch (error) {
      console.error('Email sign-in error:', error);
      const userMessage = handleAuthError(error);
      return { error: userMessage };
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; role: 'owner' | 'assistant'; clinicId?: string }): Promise<{ error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { ...userData, clinic_id: userData.clinicId }
        }
      });

      if (error) {
        const userMessage = handleAuthError(error);
        return { error: userMessage };
      }

      // The user profile will be created automatically by the handle_new_user trigger
      return {};
    } catch (error) {
      console.error('Sign-up error:', error);
      const userMessage = handleAuthError(error);
      return { error: userMessage };
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
    resendInvitation,
    cancelInvitation,
    acceptInvitation,
    getInvitations,
    getPendingInvitationsByEmail,
    checkAndLinkPendingInvitation,
    signUp,
    signOut,
    createAssistant,
    getClinicUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};