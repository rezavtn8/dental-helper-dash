import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, UserCheck, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Mail } from 'lucide-react';
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
  const [step, setStep] = useState<'checking' | 'signup' | 'complete'>('checking');
  
  const { acceptInvitation, signUp } = useAuth();

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
          setStep('signup');
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
      // First, accept the invitation
      const invitationResult = await acceptInvitation(token!);
      
      if (invitationResult.error) {
        toast.error(invitationResult.error);
        return;
      }

      // Then create the user account
      const { error } = await signUp(email, password, {
        clinicId: invitationResult.clinicId,
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

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <CardTitle className="text-green-700">Welcome!</CardTitle>
            <CardDescription>
              Your account has been created successfully.
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}