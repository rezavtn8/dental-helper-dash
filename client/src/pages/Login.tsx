import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, Stethoscope, User, KeyRound } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { clinicCode } = useParams<{ clinicCode: string }>();
  const { signInWithEmail, signUp, signInAssistant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Owner login state
  const [ownerForm, setOwnerForm] = useState({ email: '', password: '' });

  // Assistant login state
  const [assistantForm, setAssistantForm] = useState({ name: '', pin: '' });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'assistant' as 'owner' | 'assistant'
  });

  // Owner login handler
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signInWithEmail(ownerForm.email, ownerForm.password, clinicCode);
      if (error) {
        toast({ title: "Login Failed", description: error, variant: "destructive" });
      } else {
        toast({ title: "Welcome Owner!", description: "Successfully logged in." });
        navigate('/owner');
      }
    } catch {
      toast({ title: "Error", description: "Unexpected error.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Assistant login handler
  const handleAssistantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signInAssistant(assistantForm.name, assistantForm.pin, clinicCode);
      if (error) {
        toast({ title: "Login Failed", description: error, variant: "destructive" });
      } else {
        toast({ title: "Welcome Assistant!", description: "Successfully logged in." });
        navigate('/assistant');
      }
    } catch {
      toast({ title: "Error", description: "Unexpected error.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Signup handler (for owners only)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupForm.password !== signupForm.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(signupForm.email, signupForm.password, {
        name: signupForm.name,
        role: signupForm.role,
        clinicCode
      });
      if (error) {
        toast({ title: "Registration Failed", description: error, variant: "destructive" });
      } else {
        toast({ title: "Registration Successful", description: "Check your email to verify your account." });
        setSignupForm({ email: '', password: '', confirmPassword: '', name: '', role: 'assistant' });
      }
    } catch {
      toast({ title: "Error", description: "Unexpected error.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/50 to-primary/10 p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="relative w-full max-w-md">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-full blur-xl" />

        <Card className="backdrop-blur-sm border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto p-3 bg-primary/15 rounded-full w-fit">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {clinicCode ? `Clinic: ${clinicCode}` : "ClinicFlow Portal"}
            </CardTitle>
            <CardDescription>
              {clinicCode
                ? "Authenticate as Owner or Assistant"
                : "Access your clinic management system"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="owner" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="owner">Owner Login</TabsTrigger>
                <TabsTrigger value="assistant">Assistant Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Owner Login */}
              <TabsContent value="owner" className="mt-0">
                <form onSubmit={handleOwnerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner-email">Email</Label>
                    <Input
                      id="owner-email"
                      type="email"
                      className="h-12"
                      placeholder="Owner email"
                      value={ownerForm.email}
                      onChange={(e) => setOwnerForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner-password">Password</Label>
                    <Input
                      id="owner-password"
                      type="password"
                      className="h-12"
                      placeholder="Password"
                      value={ownerForm.password}
                      onChange={(e) => setOwnerForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In as Owner'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Assistant Login */}
              <TabsContent value="assistant" className="mt-0">
                <form onSubmit={handleAssistantLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assistant-name">Name</Label>
                    <Input
                      id="assistant-name"
                      type="text"
                      className="h-12"
                      placeholder="Assistant name"
                      value={assistantForm.name}
                      onChange={(e) => setAssistantForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assistant-pin">PIN</Label>
                    <Input
                      id="assistant-pin"
                      type="password"
                      className="h-12"
                      placeholder="4-digit PIN"
                      value={assistantForm.pin}
                      onChange={(e) => setAssistantForm(prev => ({ ...prev, pin: e.target.value }))}
                      required
                      maxLength={4}
                    />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In as Assistant'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Owner Signup */}
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      className="h-12"
                      placeholder="Your full name"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      className="h-12"
                      placeholder="Your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="w-full h-12 px-3 py-2 border border-input bg-background rounded-md"
                      value={signupForm.role}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, role: e.target.value as 'owner' | 'assistant' }))}
                    >
                      <option value="assistant">Assistant</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      className="h-12"
                      placeholder="Create a password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="h-12"
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}