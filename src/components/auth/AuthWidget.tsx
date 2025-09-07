import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Mail, Lock, User, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface AuthWidgetProps {
  role: 'owner' | 'assistant';
}

export default function AuthWidget({ role }: AuthWidgetProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithEmail, signUp, signInWithGoogle, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signin') {
        console.log('Attempting sign in...');
        const { error } = await signInWithEmail(email, password);
        
        if (error) {
          console.error('Sign in error:', error);
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
          console.log('Sign in successful!');
          toast.success('Signed in successfully!');
        }
      } else {
        // Sign up
        console.log('Attempting sign up...');
        if (!name.trim()) {
          toast.error('Please enter your name');
          return;
        }

        if (!email.trim()) {
          toast.error('Please enter your email');
          return;
        }

        if (password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return;
        }

        const { error } = await signUp(email, password, name, role);
        
        if (error) {
          console.error('Sign up error:', error);
          if (error.includes('User already registered')) {
            toast.error('An account with this email already exists. Please sign in instead.');
            setAuthMode('signin');
          } else if (error.includes('Password should be at least 6 characters')) {
            toast.error('Password must be at least 6 characters long.');
          } else if (error.includes('signup_disabled')) {
            toast.error('Account creation is currently disabled. Please contact support.');
          } else {
            toast.error(error);
          }
        } else {
          console.log('Sign up successful!');
          toast.success('Account created successfully! Please check your email to confirm your account.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again.');
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
        toast.success('Signed in with Google successfully!');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google.');
    }
  };

  const isOwner = role === 'owner';

  return (
    <div className="space-y-6">
      <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin" className="space-y-4 mt-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-10 w-10 px-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          {isOwner && (
            <div className="space-y-3">
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
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                Continue with Google
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="signup" className="space-y-4 mt-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min. 6 characters)"
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-10 w-10 px-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create {isOwner ? 'Owner' : 'Assistant'} Account
            </Button>
          </form>

          {isOwner && (
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
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                Continue with Google
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>

      {role === 'assistant' && (
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">After Creating Your Account</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll need a clinic code from your clinic owner to join and access your workspace.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}