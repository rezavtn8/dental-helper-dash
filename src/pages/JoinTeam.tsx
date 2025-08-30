import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  ArrowRight, 
  Building2, 
  UserCheck,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface InvitationData {
  id: string;
  email: string;
  role: string;
  clinic_id: string;
  expires_at: string;
  clinic_name?: string;
}

export default function JoinTeam() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, signInWithGoogle, signInWithEmail, signUp } = useAuth();
  
  const token = searchParams.get('token');
  const fromMagic = searchParams.get('from') === 'magic';
  
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'loading' | 'invalid' | 'sign-in' | 'processing' | 'success' | 'error'>('loading');
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!token) {
      setStep('invalid');
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    validateInvitation();
  }, [token]);

  useEffect(() => {
    // If user is already signed in and we have invitation data, process it
    if (session && invitationData && step === 'sign-in') {
      processInvitation();
    }
  }, [session, invitationData, step]);

  const validateInvitation = async () => {
    try {
      setLoading(true);
      setProgress(20);

      // Validate the invitation token
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .select(`
          *,
          clinics!inner(name)
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      setProgress(60);

      if (inviteError || !invitation) {
        setStep('invalid');
        setError(inviteError?.message || 'Invalid or expired invitation');
        return;
      }

      // Set invitation data with clinic name
      const invitationWithClinic = {
        ...invitation,
        clinic_name: invitation.clinics?.name || 'the team'
      };
      
      setInvitationData(invitationWithClinic);
      setProgress(80);

      // If user is already signed in, proceed to processing
      if (session) {
        await processInvitation(invitationWithClinic);
      } else {
        setStep('sign-in');
        setProgress(100);
      }

    } catch (error: any) {
      console.error('Error validating invitation:', error);
      setStep('error');
      setError(error.message || 'Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const processInvitation = async (inviteData?: InvitationData) => {
    const invitation = inviteData || invitationData;
    if (!session?.user || !invitation) return;

    try {
      setStep('processing');
      setProgress(20);

      // Check if user email matches invitation email
      if (session.user.email !== invitation.email) {
        throw new Error(`This invitation was sent to ${invitation.email}, but you're signed in as ${session.user.email}. Please sign in with the correct email address.`);
      }

      setProgress(40);

      // Accept the invitation using the backend function
      const { data: result, error: acceptError } = await supabase
        .rpc('accept_invitation', { invitation_token: token! });

      if (acceptError || !result?.[0]?.success) {
        throw new Error(result?.[0]?.message || acceptError?.message || 'Failed to accept invitation');
      }

      setProgress(70);

      // Update or create user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Team Member',
          role: invitation.role,
          clinic_id: invitation.clinic_id,
          is_active: true,
          last_login: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't fail the process for profile errors, just log them
      }

      setProgress(100);
      setStep('success');

      toast.success(`Welcome to ${invitation.clinic_name}! 🎉`, {
        description: 'You have been successfully added to the team.'
      });

      // Redirect after a short delay
      setTimeout(() => {
        const redirectPath = invitation.role === 'owner' ? '/owner' : '/assistant';
        navigate(redirectPath, { replace: true });
      }, 2500);

    } catch (error: any) {
      console.error('Error processing invitation:', error);
      setStep('error');
      setError(error.message || 'Failed to join the team');
      toast.error(error.message || 'Failed to join the team');
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error);
      }
      // The useEffect will handle the rest once user is signed in
    } catch (error) {
      toast.error('Failed to sign in with Google');
    }
  };

  const handleRequestNewInvite = () => {
    window.location.href = 'mailto:admin@clinic.com?subject=Request%20New%20Invitation&body=Hi,%20I%20need%20a%20new%20invitation%20link%20to%20join%20the%20team.';
  };

  if (loading && step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <div className="space-y-2">
                <p className="font-medium">Validating your invitation...</p>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'invalid' || step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <CardTitle className="text-red-700">
              {step === 'invalid' ? 'Invalid Invitation' : 'Error'}
            </CardTitle>
            <CardDescription>
              {error || 'This invitation link is invalid, expired, or has already been used.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center text-sm text-muted-foreground">
              <p>Need help? Contact your clinic administrator or request a new invitation.</p>
            </div>
            <Button 
              onClick={handleRequestNewInvite}
              variant="outline" 
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Request New Invitation
            </Button>
            <Button onClick={() => navigate('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 text-green-600 mx-auto animate-spin" />
            <CardTitle className="text-green-700">Joining Your Team</CardTitle>
            <CardDescription>
              Setting up your account and adding you to {invitationData?.clinic_name}...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={progress} className="h-2" />
              <div className="text-center text-sm text-muted-foreground">
                <p>Please wait while we complete the setup process</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <CardTitle className="text-green-700">Welcome to the Team!</CardTitle>
            <CardDescription>
              You have successfully joined {invitationData?.clinic_name} as {invitationData?.role === 'assistant' ? 'an assistant' : 'an admin'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Redirecting to your dashboard...
              </p>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sign-in step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Building2 className="h-8 w-8 text-blue-600 mr-2" />
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Join {invitationData?.clinic_name}</CardTitle>
          <CardDescription>
            You've been invited to join as {invitationData?.role === 'assistant' ? 'an assistant' : 'an admin'}. 
            Sign in to complete the process.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Invitation Details */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Invited email:</span>
                  <span className="text-blue-700">{invitationData?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Role:</span>
                  <span className="text-blue-700 capitalize">{invitationData?.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign In Options */}
          <div className="space-y-3">
            <Button 
              onClick={handleSignInWithGoogle}
              className="w-full"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Secure invitation process
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>• Your account will be automatically linked to the team</p>
            <p>• You can use your existing credentials or create a new account</p>
            <p>• This invitation expires in {
              invitationData ? 
                Math.ceil((new Date(invitationData.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) 
                : 7
            } days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}