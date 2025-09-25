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
    <div className="space-y-8">
      <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-100/60 backdrop-blur-sm rounded-xl p-1.5 border border-slate-200/40">
          <TabsTrigger 
            value="signin" 
            className="rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup" 
            className="rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin" className="space-y-6 mt-8">
          <form onSubmit={signInForm.handleSubmit(handleEmailAuth)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-slate-600" />
                <Input
                  id="email"
                  type="email"
                  {...signInForm.register('email')}
                  placeholder="Enter your email"
                  className="pl-12 h-12 text-base bg-white/70 border-slate-200/60 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200/50 transition-all duration-200"
                />
              </div>
              {hasFieldError(signInForm.formState.errors.email) && (
                <p className="text-sm text-red-500 ml-1">{getFieldError(signInForm.formState.errors.email)}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-slate-600" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...signInForm.register('password')}
                  placeholder="Enter your password"
                  className="pl-12 pr-12 h-12 text-base bg-white/70 border-slate-200/60 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200/50 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                </Button>
              </div>
              {hasFieldError(signInForm.formState.errors.password) && (
                <p className="text-sm text-red-500 ml-1">{getFieldError(signInForm.formState.errors.password)}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 rounded-xl shadow-lg shadow-slate-200/60 transition-all duration-200 hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-0.5" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          {isOwner && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 text-base font-semibold bg-white border-slate-200 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                onClick={handleGoogleSignIn}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="signup" className="space-y-6 mt-8">
          <form onSubmit={signUpForm.handleSubmit(handleEmailAuth)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="signup-name" className="text-sm font-semibold text-slate-700">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-slate-600" />
                <Input
                  id="signup-name"
                  type="text"
                  {...signUpForm.register('name')}
                  placeholder="Enter your full name"
                  className="pl-12 h-12 text-base bg-white/70 border-slate-200/60 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200/50 transition-all duration-200"
                />
              </div>
              {hasFieldError(signUpForm.formState.errors.name) && (
                <p className="text-sm text-red-500 ml-1">{getFieldError(signUpForm.formState.errors.name)}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-slate-600" />
                <Input
                  id="signup-email"
                  type="email"
                  {...signUpForm.register('email')}
                  placeholder="Enter your email"
                  className="pl-12 h-12 text-base bg-white/70 border-slate-200/60 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200/50 transition-all duration-200"
                />
              </div>
              {hasFieldError(signUpForm.formState.errors.email) && (
                <p className="text-sm text-red-500 ml-1">{getFieldError(signUpForm.formState.errors.email)}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-slate-600" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  {...signUpForm.register('password')}
                  placeholder="Create a strong password (min. 8 characters)"
                  className="pl-12 pr-12 h-12 text-base bg-white/70 border-slate-200/60 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200/50 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                </Button>
              </div>
              {hasFieldError(signUpForm.formState.errors.password) && (
                <p className="text-sm text-red-500 ml-1">{getFieldError(signUpForm.formState.errors.password)}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 rounded-xl shadow-lg shadow-slate-200/60 transition-all duration-200 hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-0.5" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Create {role === 'owner' ? 'Owner' : role === 'assistant' ? 'Assistant' : 'Front Desk'} Account
            </Button>
          </form>

          {isOwner && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 text-base font-semibold bg-white border-slate-200 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                onClick={handleGoogleSignIn}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {(role === 'assistant' || role === 'front_desk') && (
        <div className="p-6 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl border border-blue-100/40 shadow-inner">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-base font-semibold text-slate-800">After Creating Your Account</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              You'll need a clinic code from your clinic owner to join and access your workspace.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}