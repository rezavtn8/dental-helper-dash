import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Mail, Lock, User, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthSignUpForm, useFormErrors } from '@/hooks/useFormValidation';
import { sanitizeText, sanitizeEmail } from '@/utils/sanitize';
import { useAuthError } from '@/hooks/useAuthError';

export default function StaffSignUpForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'assistant' | 'front_desk'>('assistant');
  const { signUp } = useAuth();
  const { handleAuthError } = useAuthError();
  const { getFieldError, hasFieldError } = useFormErrors();
  
  const signUpForm = useAuthSignUpForm();

  const handleEmailSignUp = async (data: any) => {
    setLoading(true);

    try {
      const sanitizedEmail = sanitizeEmail(data.email);
      const sanitizedName = sanitizeText(data.name);
      
      const { error } = await signUp(sanitizedEmail, data.password, sanitizedName, selectedRole);
      
      if (error) {
        handleAuthError(error);
      } else {
        toast.success('Account created successfully! Please check your email to confirm your account.');
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={signUpForm.handleSubmit(handleEmailSignUp)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-slate-600" />
            <Input
              id="name"
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
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-slate-600" />
            <Input
              id="email"
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
          <Label htmlFor="role" className="text-sm font-semibold text-slate-700">Your Role</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'assistant' | 'front_desk')}>
            <SelectTrigger className="h-12 text-base bg-white/70 border-slate-200/60 rounded-xl">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assistant">Dental Assistant</SelectItem>
              <SelectItem value="front_desk">Front Desk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-slate-600" />
            <Input
              id="password"
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
          Create Staff Account
        </Button>
      </form>

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
    </div>
  );
}
