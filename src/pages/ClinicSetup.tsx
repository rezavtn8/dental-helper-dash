import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ClinicSetup() {
  const [clinicName, setClinicName] = useState('');
  const [clinicCode, setClinicCode] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateClinicCode = () => {
    if (clinicName) {
      const code = clinicName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
      setClinicCode(code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the clinic
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .insert({
          name: clinicName,
          clinic_code: clinicCode,
          is_active: true,
          subscription_status: 'active'
        })
        .select()
        .single();

      if (clinicError) {
        if (clinicError.code === '23505') {
          toast.error('Clinic code already exists. Please choose a different one.');
        } else {
          toast.error('Failed to create clinic: ' + clinicError.message);
        }
        setLoading(false);
        return;
      }

      // Create the owner account
      const redirectUrl = `${window.location.origin}/clinic/${clinicCode}`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { name: ownerName, role: 'owner' }
        }
      });

      if (authError) {
        toast.error('Failed to create account: ' + authError.message);
        setLoading(false);
        return;
      }

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            name: ownerName,
            role: 'owner',
            clinic_id: clinic.id,
            is_active: true,
            display_order: 0
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Account created but profile setup failed. Please contact support.');
        } else {
          toast.success('Clinic created successfully! Please check your email to verify your account.');
          navigate(`/clinic/${clinicCode}`);
        }
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Failed to create clinic. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle>Create Your Clinic</CardTitle>
          <CardDescription>Set up your clinic and owner account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Enter clinic name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicCode">Clinic Code</Label>
              <div className="flex gap-2">
                <Input
                  id="clinicCode"
                  value={clinicCode}
                  onChange={(e) => setClinicCode(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="Enter unique clinic code"
                  required
                />
                <Button type="button" onClick={generateClinicCode} variant="outline">
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your clinic URL will be: yourapp.com/clinic/{clinicCode}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Clinic
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}