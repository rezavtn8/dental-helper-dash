import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Mail, Lock, User, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAuthSignInForm, useAuthSignUpForm, useFormErrors } from '@/hooks/useFormValidation';
import { sanitizeText, sanitizeEmail } from '@/utils/sanitize';
import { useAuthError } from '@/hooks/useAuthError';

interface AuthWidgetProps {
  role: 'owner' | 'assistant' | 'front_desk';
}

export default function AuthWidget({ role }: AuthWidgetProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithEmail, signUp, signInWithGoogle } = useAuth();
  const { handleAuthError } = useAuthError();
  const { getFieldError, hasFieldError } = useFormErrors();
  const navigate = useNavigate();

  // Forms with validation
  const signInForm = useAuthSignInForm();
  const signUpForm = useAuthSignUpForm();
  
  const currentForm = authMode === 'signin' ? signInForm : signUpForm;

  const handleEmailAuth = async (data: any) => {
    setLoading(true);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeEmail(data.email);
      const sanitizedPassword = data.password; // Password not sanitized to preserve special chars
      const sanitizedName = data.name ? sanitizeText(data.name) : '';

      if (authMode === 'signin') {
        console.log('Attempting sign in...');
        const { error } = await signInWithEmail(sanitizedEmail, sanitizedPassword);
        
        if (error) {
          console.error('Sign in error:', error);
          handleAuthError(error);
        } else {
          console.log('Sign in successful!');
          toast.success('Signed in successfully!');
        }
      } else {
        // Sign up
        console.log('Attempting sign up...');
        const { error } = await signUp(sanitizedEmail, sanitizedPassword, sanitizedName, role);
        
        if (error) {
          console.error('Sign up error:', error);
          handleAuthError(error);
        } else {
          console.log('Sign up successful!');
          toast.success('Account created successfully! Please check your email to confirm your account.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      handleAuthError(error);
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
          <form onSubmit={signInForm.handleSubmit(handleEmailAuth)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  {...signInForm.register('email')}
                  placeholder="Enter your email"
                  className="pl-10"
                />
              </div>
              {hasFieldError(signInForm.formState.errors.email) && (
                <p className="text-sm text-destructive">{getFieldError(signInForm.formState.errors.email)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...signInForm.register('password')}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
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
              {hasFieldError(signInForm.formState.errors.password) && (
                <p className="text-sm text-destructive">{getFieldError(signInForm.formState.errors.password)}</p>
              )}
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
          <form onSubmit={signUpForm.handleSubmit(handleEmailAuth)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="signup-name"
                  type="text"
                  {...signUpForm.register('name')}
                  placeholder="Enter your full name"
                  className="pl-10"
                />
              </div>
              {hasFieldError(signUpForm.formState.errors.name) && (
                <p className="text-sm text-destructive">{getFieldError(signUpForm.formState.errors.name)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="signup-email"
                  type="email"
                  {...signUpForm.register('email')}
                  placeholder="Enter your email"
                  className="pl-10"
                />
              </div>
              {hasFieldError(signUpForm.formState.errors.email) && (
                <p className="text-sm text-destructive">{getFieldError(signUpForm.formState.errors.email)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  {...signUpForm.register('password')}
                  placeholder="Create a password (min. 8 characters)"
                  className="pl-10 pr-10"
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
              {hasFieldError(signUpForm.formState.errors.password) && (
                <p className="text-sm text-destructive">{getFieldError(signUpForm.formState.errors.password)}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create {role === 'owner' ? 'Owner' : role === 'assistant' ? 'Assistant' : 'Front Desk'} Account
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

      {(role === 'assistant' || role === 'front_desk') && (
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