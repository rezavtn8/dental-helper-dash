import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function ClinicSetup() {
  const [clinicName, setClinicName] = useState('');
  const [clinicCode, setClinicCode] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'creating' | 'success'>('form');
  const [progress, setProgress] = useState('');
  const navigate = useNavigate();
  const { signUp, refreshUserProfile } = useAuth();

  const generateClinicCode = () => {
    if (clinicName.trim()) {
      const cleanName = clinicName.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const code = cleanName.slice(0, 6) + Math.floor(Math.random() * 1000);
      setClinicCode(code.toUpperCase());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (clinicName.trim().length < 2) {
      toast.error('Clinic name must be at least 2 characters');
      return;
    }

    if (clinicCode.trim().length < 3) {
      toast.error('Clinic code must be at least 3 characters');
      return;
    }

    if (ownerName.trim().length < 2) {
      toast.error('Owner name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setStep('creating');

    try {
      // Step 1: Create user account
      setProgress('Creating your account...');
      const { error: authError } = await signUp(email.trim(), password, ownerName.trim(), 'owner');

      if (authError) {
        toast.error('Failed to create account: ' + authError);
        setLoading(false);
        setStep('form');
        return;
      }

      // Step 2: Get user session
      setProgress('Verifying your account...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Account verification failed. Please try again.');
        setLoading(false);
        setStep('form');
        return;
      }

      // Step 3: Create clinic atomically
      setProgress('Setting up your clinic...');
      const { data, error } = await supabase.rpc('create_clinic_with_owner', {
        p_clinic_name: clinicName.trim(),
        p_clinic_code: clinicCode.trim(),
        p_owner_name: ownerName.trim(),
        p_owner_email: email.trim(),
        p_owner_id: user.id
      });

      if (error) {
        console.error('Clinic creation error:', error);
        toast.error('Database error: ' + error.message);
        setLoading(false);
        setStep('form');
        return;
      }

      const result = data?.[0];
      if (!result?.success) {
        toast.error(result?.message || 'Failed to create clinic');
        setLoading(false);
        setStep('form');
        return;
      }

      // Step 4: Refresh user profile to get updated clinic_id
      setProgress('Finalizing setup...');
      await refreshUserProfile();

      // Step 5: Success
      setProgress('Complete! Redirecting...');
      setStep('success');
      
      toast.success('Clinic created successfully! Welcome to ClinicFlow!');
      
      // Navigate after a brief delay to show success state
      setTimeout(() => {
        navigate('/owner');
      }, 1500);

    } catch (error) {
      console.error('Setup error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setLoading(false);
      setStep('form');
    }
  };

  if (step === 'creating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin">
                <div className="w-4 h-4 bg-primary rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              </div>
            </div>
            <CardTitle>Setting Up Your Clinic</CardTitle>
            <CardDescription>Please wait while we create your clinic...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{progress}</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">This may take a few moments...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <CardTitle className="text-green-600">Clinic Created Successfully!</CardTitle>
            <CardDescription>Welcome to ClinicFlow. Redirecting to your dashboard...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Account created</p>
              <p>✓ Clinic "{clinicName}" established</p>
              <p>✓ You're now the owner</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle>Create Your Clinic</CardTitle>
          <CardDescription>Set up your clinic and owner account atomically</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name *</Label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Enter clinic name"
                required
                disabled={loading}
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicCode">Clinic Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="clinicCode"
                  value={clinicCode}
                  onChange={(e) => setClinicCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="Enter unique clinic code"
                  required
                  disabled={loading}
                  minLength={3}
                  maxLength={10}
                />
                <Button 
                  type="button" 
                  onClick={generateClinicCode} 
                  variant="outline"
                  disabled={loading || !clinicName.trim()}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                3-10 alphanumeric characters. Your clinic: /clinic/{clinicCode.toLowerCase() || 'your-code'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                disabled={loading}
                minLength={8}
              />
              {password && password.length > 0 && password.length < 8 && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  Password must be at least 8 characters
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || password.length < 8}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating Clinic...
                </>
              ) : (
                'Create Clinic & Account'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => navigate('/')} disabled={loading}>
              Back to Home
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our terms of service and will be set as the clinic owner.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}