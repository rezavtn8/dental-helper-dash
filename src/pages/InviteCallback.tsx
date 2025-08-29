import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { toast } from 'sonner';

const InviteCallback = () => {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleInviteCallback = async () => {
      try {
        // First, try to exchange code for session if we have auth code
        const code = searchParams.get('code');
        if (code) {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) {
            console.error('Error exchanging code for session:', sessionError);
            throw new Error('Failed to authenticate. Please try the link again.');
          }
        }

        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession?.user) {
          throw new Error('Authentication required. Please try the invitation link again.');
        }

        const currentUser = currentSession.user;
        
        // Get clinic_id and invitation_id from user metadata or URL params
        let clinicId = currentUser.user_metadata?.clinic_id;
        let invitationId = currentUser.user_metadata?.invitation_id;
        let role = currentUser.user_metadata?.role || 'assistant';

        // Fallback to URL params if metadata is missing
        if (!clinicId || !invitationId) {
          const urlParams = new URLSearchParams(window.location.search);
          clinicId = clinicId || urlParams.get('clinic_id');
          invitationId = invitationId || urlParams.get('invitation_id');
          role = role || urlParams.get('role') || 'assistant';
        }

        // If still missing, try to find by email
        if (!clinicId || !invitationId) {
          const { data: invitation, error: inviteError } = await supabase
            .from('invitations')
            .select('*')
            .eq('email', currentUser.email)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!inviteError && invitation) {
            clinicId = invitation.clinic_id;
            invitationId = invitation.id;
            role = invitation.role;
          } else {
            throw new Error('No valid invitation found for your email address.');
          }
        }

        if (!clinicId || !invitationId) {
          throw new Error('Missing invitation information. Please use a valid invitation link.');
        }

        await processInvitation(clinicId, invitationId, role, currentUser);
        
      } catch (error: any) {
        console.error('Error in invite callback:', error);
        setError(error.message || 'Failed to process invitation');
        setProcessing(false);
      }
    };

    handleInviteCallback();
  }, [searchParams]);

  const processInvitation = async (clinicId: string, invitationId: string, role: string, currentUser: any) => {
    try {
      setProcessing(true);
      
      console.log('Processing invitation:', { clinicId, invitationId, role, userId: currentUser.id });

      // Check if invitation is still valid
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invitation) {
        throw new Error('Invitation not found or has already been used.');
      }

      // Check if invitation has expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('This invitation has expired. Please request a new one.');
      }

      // Check if user email matches invitation email
      if (currentUser.email !== invitation.email) {
        throw new Error('This invitation was sent to a different email address.');
      }

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Assistant',
          role: role,
          clinic_id: clinicId,
          is_active: true
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      // Mark invitation as accepted and invalidate any other pending invitations for this email
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: currentUser.id
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Invalidate other pending invitations for this email
      await supabase
        .from('invitations')
        .update({ status: 'superseded' })
        .eq('email', currentUser.email)
        .eq('status', 'pending')
        .neq('id', invitationId);

      setSuccess(true);
      toast.success('Welcome to the team! You have been successfully added to the clinic.');
      
      // Redirect to assistant dashboard after a short delay
      setTimeout(() => {
        navigate('/assistant', { replace: true });
      }, 2000);

    } catch (error: any) {
      console.error('Error processing invitation:', error);
      setError(error.message || 'Failed to process invitation');
      toast.error(error.message || 'Failed to process invitation');
      setProcessing(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/', { replace: true });
  };

  const handleRequestNewInvite = () => {
    window.location.href = 'mailto:admin@clinic.com?subject=Request%20New%20Invitation&body=Hi,%20I%20need%20a%20new%20invitation%20link%20to%20join%20the%20team.';
  };

  // Show loading while processing
  if (processing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <RefreshCw className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <CardTitle>Processing Invitation</CardTitle>
            <CardDescription>
              Setting up your account and linking you to the clinic...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show success screen
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Welcome to the Team!</CardTitle>
            <CardDescription>
              You have been successfully added to the clinic. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show error screen  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle>Invitation Error</CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleBackToLogin} className="w-full">
            Back to Login
          </Button>
          <Button onClick={handleRequestNewInvite} variant="outline" className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Request New Invite
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <p>If you continue having issues, please contact your clinic administrator for a new invitation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteCallback;