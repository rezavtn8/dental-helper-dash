import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, UserCheck, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Mail, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getInvitationToken } from '@/utils/tokenExtractor';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const token = getInvitationToken(searchParams, params);
  
  const [loading, setLoading] = useState(false);
  const [invitationValid, setInvitationValid] = useState<boolean | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [step, setStep] = useState<'checking' | 'signup' | 'existing-user' | 'complete'>('checking');
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  
  const { acceptInvitation, signUp, signInWithEmail, signInWithGoogle } = useAuth();

  useEffect(() => {
    const checkInvitation = async () => {
      if (!token) {
        toast.error('Invalid invitation link');
        navigate('/');
        return;
      }

      try {
        // Check if invitation exists and is valid
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('token', token)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          setInvitationValid(false);
          toast.error('Invalid or expired invitation');
        } else {
          setInvitationValid(true);
          setInvitationData(data);
          setEmail(data.email);
          
          // Check if user already exists by trying to sign in
          try {
            // We can't use admin.getUserByEmail directly, so we'll attempt a test sign-in
            // This is a workaround to detect existing users
            const testSignIn = await supabase.auth.signInWithPassword({
              email: data.email,
              password: 'test-invalid-password-to-check-user-exists'
            });
            
            // If we get a specific "Invalid credentials" error, user exists
            // If we get "Email not confirmed" or similar, user exists
            // If we get "User not found", user doesn't exist
            const userExists = testSignIn.error?.message !== 'User not found' && 
                             testSignIn.error?.message !== 'Invalid login credentials' &&
                             testSignIn.error?.message !== 'Email not confirmed';
            
            setHasExistingAccount(userExists);
            setStep(userExists ? 'existing-user' : 'signup');
          } catch (error) {
            // Fallback to signup if we can't determine user existence
            setHasExistingAccount(false);
            setStep('signup');
          }
        }
      } catch (error) {
        setInvitationValid(false);
        toast.error('Failed to validate invitation');
      }
    };

    checkInvitation();
  }, [token, navigate]);

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 25, label: 'Too Short', color: 'bg-red-500' };
    
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 15;
    
    if (strength <= 25) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 50) return { strength, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 75) return { strength, label: 'Good', color: 'bg-blue-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignInExisting = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        toast.error(error);
        return;
      }

      // Accept the invitation after successful sign-in
      const { data: result, error: invitationError } = await supabase
        .rpc('accept_invitation_with_rate_limit', { invitation_token: token! });
      
      if (invitationError || !result?.[0]?.success) {
        const errorMessage = result?.[0]?.message || invitationError?.message || 'Failed to accept invitation';
        toast.error(errorMessage);
        return;
      }

      setStep('complete');
      toast.success('Welcome back! You\'ve been added to the team!');
      setTimeout(() => {
        const targetRole = invitationData?.role || 'assistant';
        const redirectPath = targetRole === 'owner' ? '/owner' : '/assistant';
        navigate(redirectPath);
      }, 2000);
    } catch (error) {
      toast.error('Failed to sign in. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error);
      } else {
        // Google sign-in will trigger auth state change, which will handle invitation acceptance
        toast.success('Signing in with Google...');
      }
    } catch (error) {
      toast.error('Failed to sign in with Google');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordStrength.strength < 50) {
      toast.error('Please choose a stronger password');
      return;
    }

    setLoading(true);

    try {
      // First, accept the invitation using the rate-limited function
      const { data: result, error: invitationError } = await supabase
        .rpc('accept_invitation_with_rate_limit', { invitation_token: token! });
      
      if (invitationError || !result?.[0]?.success) {
        const errorMessage = result?.[0]?.message || invitationError?.message || 'Failed to accept invitation';
        toast.error(errorMessage);
        return;
      }

      // Then create the user account
      const { error } = await signUp(email, password, {
        clinicId: result[0].clinic_id,
        role: invitationData?.role || 'assistant',
        name: invitationData?.email?.split('@')[0] || 'User'
      });

      if (error) {
        toast.error(error);
      } else {
        setStep('complete');
        toast.success('Account created successfully!');
        setTimeout(() => {
          // Determine redirect based on invitation data or default to assistant
          const targetRole = invitationData?.role || 'assistant';
          const redirectPath = targetRole === 'owner' ? '/owner' : '/assistant';
          
          navigate(redirectPath);
          // Show welcome toast after redirect
          setTimeout(() => {
            toast.success('Account ready! Welcome to your dashboard! 🎉', {
              description: 'You can now start managing your tasks and collaborating with your team.'
            });
          }, 500);
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to complete signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'checking' || invitationValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
              <p className="mt-2 text-muted-foreground">Validating invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitationValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <CardTitle className="text-red-700">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center text-sm text-muted-foreground">
              <p>Need a new invitation? Contact your clinic administrator or use the button below.</p>
            </div>
            <Button 
              onClick={() => window.location.href = 'mailto:admin@clinic.com?subject=Request%20New%20Invitation&body=Hi,%20I%20need%20a%20new%20invitation%20link%20to%20join%20the%20team.'}
              variant="outline" 
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Request New Invite
            </Button>
            <Button onClick={() => navigate('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'existing-user') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <LogIn className="h-12 w-12 text-teal-600 mx-auto" />
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>
              We found an existing account for {email}. Sign in to join the team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="existing-password">Password</Label>
              <div className="relative">
                <Input
                  id="existing-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleSignInExisting}
              disabled={loading || !password}
              className="w-full"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <LogIn className="w-4 h-4 mr-2" />
              Sign In & Join Team
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button 
              onClick={handleGoogleSignIn}
              variant="outline" 
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs"
                onClick={() => setStep('signup')}
              >
                Don't have an account? Create a new one instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <CardTitle className="text-green-700">Welcome to the Team!</CardTitle>
            <CardDescription>
              {hasExistingAccount ? 'You\'ve been successfully added to the team.' : 'Your account has been created successfully.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You'll be redirected to your dashboard shortly...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-teal-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <UserCheck className="h-12 w-12 text-teal-600 mx-auto" />
          <CardTitle>Complete Your Registration</CardTitle>
            <CardDescription>
              You've been invited to join as a team member. Create your password to get started.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPasswords ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Password Strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.strength <= 25 ? 'text-red-600' :
                      passwordStrength.strength <= 50 ? 'text-yellow-600' :
                      passwordStrength.strength <= 75 ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress value={passwordStrength.strength} className="h-2" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
              {confirmPassword && (
                <div className={`flex items-center gap-1 text-sm ${
                  password === confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      Passwords do not match
                    </>
                  )}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <Lock className="w-4 h-4 mr-2" />
              Create Account
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button 
              onClick={handleGoogleSignIn}
              variant="outline" 
              type="button"
              disabled={loading}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs"
              onClick={() => setStep('existing-user')}
            >
              Already have an account? Sign in instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}