import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const InviteCallback = () => {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL parameters for clinic info
    const urlParams = new URLSearchParams(window.location.search);
    const clinicIdFromUrl = urlParams.get('clinic_id');
    const invitationIdFromUrl = urlParams.get('invitation_id');
    const roleFromUrl = urlParams.get('role');

    if (session && user && clinicIdFromUrl && invitationIdFromUrl) {
      console.log('Processing invitation with URL params:', {
        clinicIdFromUrl,
        invitationIdFromUrl,
        roleFromUrl,
        userId: user.id
      });
      processInvitationFromUrl(clinicIdFromUrl, invitationIdFromUrl, roleFromUrl || 'assistant');
    }
  }, [session, user]);

  const processInvitationFromUrl = async (clinicId: string, invitationId: string, role: string) => {
    try {
      setProcessing(true);
      
      console.log('Processing invitation:', { clinicId, invitationId, role, userId: user?.id });

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
      if (user?.email !== invitation.email) {
        throw new Error('This invitation was sent to a different email address.');
      }

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Assistant',
          role: role,
          clinic_id: clinicId,
          is_active: true
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: user.id
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

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
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    const urlParams = new URLSearchParams(window.location.search);
    const clinicIdFromUrl = urlParams.get('clinic_id');
    const invitationIdFromUrl = urlParams.get('invitation_id');
    const roleFromUrl = urlParams.get('role');
    
    if (clinicIdFromUrl && invitationIdFromUrl) {
      processInvitationFromUrl(clinicIdFromUrl, invitationIdFromUrl, roleFromUrl || 'assistant');
    } else {
      setError('Missing invitation parameters in URL');
    }
  };

  const handleBackToLogin = () => {
    navigate('/', { replace: true });
  };

  if (!session || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign up or sign in to accept this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackToLogin} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {processing && (
            <>
              <RefreshCw className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <CardTitle>Processing Invitation</CardTitle>
              <CardDescription>
                Setting up your account and linking you to the clinic...
              </CardDescription>
            </>
          )}
          
          {success && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Welcome to the Team!</CardTitle>
              <CardDescription>
                You have been successfully added to the clinic. Redirecting to your dashboard...
              </CardDescription>
            </>
          )}
          
          {error && (
            <>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle>Invitation Error</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        {error && (
          <CardContent className="space-y-3">
            <Button onClick={handleRetry} className="w-full" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleBackToLogin} className="w-full">
              Back to Login
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <p>If you continue having issues, please contact your clinic administrator for a new invitation.</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default InviteCallback;