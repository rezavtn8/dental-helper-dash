import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, User, Users, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginWidget() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleHint, setRoleHint] = useState<'owner' | 'assistant'>('owner');
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signInWithEmail(email, password);
      
      if (error) {
        if (error.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link before signing in.');
        } else if (error.includes('too_many_requests')) {
          toast.error('Too many login attempts. Please wait a moment before trying again.');
        } else {
          toast.error(error);
        }
      } else {
        toast.success('Signed in successfully!');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in. Please try again.');
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error);
      } else {
        toast.success('Signed in with Google successfully!');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google.');
    }
  };

  const roleConfig = {
    owner: {
      icon: User,
      title: 'Clinic Owner',
      subtitle: 'Manage your clinic and team',
      showGoogle: true,
    },
    assistant: {
      icon: Users,
      title: 'Assistant',
      subtitle: 'Access your tasks and tools',
      showGoogle: false,
    }
  };

  const config = roleConfig[roleHint];
  const Icon = config.icon;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-4">
        <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
        <CardTitle className="text-xl">{config.title} Sign In</CardTitle>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Role Toggle */}
        <div className="flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setRoleHint('owner')}
            className={`flex-1 text-sm px-3 py-2 rounded-md transition-colors ${
              roleHint === 'owner' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Owner
          </button>
          <button
            type="button"
            onClick={() => setRoleHint('assistant')}
            className={`flex-1 text-sm px-3 py-2 rounded-md transition-colors ${
              roleHint === 'assistant' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Assistant
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-9 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9 px-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full h-9" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>

        {/* Google Sign In for Owners */}
        {config.showGoogle && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-9"
              onClick={handleGoogleSignIn}
            >
              Continue with Google
            </Button>
          </>
        )}

        {/* Assistant Info */}
        {roleHint === 'assistant' && (
          <div className="p-3 bg-muted/50 rounded-lg border text-center">
            <div className="flex items-center justify-center mb-1">
              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">New Assistant?</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ask your clinic owner for an invitation email to create your account.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}