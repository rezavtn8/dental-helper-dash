import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Users, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function AssistantLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithEmail, user, userProfile } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && userProfile) {
      if (userProfile.role === 'assistant') {
        navigate('/assistant');
      } else if (userProfile.role === 'owner') {
        navigate('/owner');
      }
    }
  }, [user, userProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signInWithEmail(email, password);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success('Signed in successfully!');
        // Navigation will be handled by the useEffect above
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-secondary" />
          <CardTitle className="text-2xl">Assistant Sign In</CardTitle>
          <CardDescription>
            Access your task dashboard and clinic tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-center mb-2">
                <Mail className="w-5 h-5 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">New Assistant?</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ask your clinic owner to send you an invitation email to create your account.
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}