import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Lock,
  Info,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePinTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Password strength calculation
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

  const passwordStrength = getPasswordStrength(newPassword);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    } else if (passwordStrength.strength < 50) {
      newErrors.newPassword = 'Password is too weak. Please choose a stronger password.';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Simulate API call - in real app, this would call the update_user_pin function
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('PIN Updated Successfully! 🎉', {
        description: 'Your new PIN is now active. Please remember it for future logins.'
      });
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      
    } catch (error) {
      toast.error('Failed to Update PIN', {
        description: 'Please check your current PIN and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInput = (value: string, setter: (value: string) => void) => {
    setter(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-teal-900 mb-3">Change Password</h1>
        <p className="text-teal-600 text-lg">Update your password for enhanced security</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Security Info */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-3 text-lg">Password Security Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Use at least 8 characters with mixed case, numbers, and symbols
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Avoid common passwords or personal information
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Never share your password with anyone
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Change your password regularly for better security
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIN Change Form */}
        <Card className="shadow-xl border-2 border-teal-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
            <CardTitle className="flex items-center text-teal-900">
              <Lock className="w-6 h-6 mr-3 text-teal-600" />
              Update Your Password
            </CardTitle>
            <CardDescription className="text-teal-700">
              Enter your current password and choose a new secure password
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Current Password */}
              <div className="space-y-3">
                <Label htmlFor="current-password" className="text-base font-semibold text-teal-900">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => handlePasswordInput(e.target.value, setCurrentPassword)}
                    placeholder="Enter current password"
                    className={`text-base h-12 border-2 rounded-xl ${
                      errors.currentPassword 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-teal-200 focus:border-teal-500 bg-teal-50/50'
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-600 hover:bg-teal-100"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.currentPassword}</span>
                  </div>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-3">
                <Label htmlFor="new-password" className="text-base font-semibold text-teal-900">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => handlePasswordInput(e.target.value, setNewPassword)}
                    placeholder="Enter new password"
                    className={`text-base h-12 border-2 rounded-xl ${
                      errors.newPassword 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-teal-200 focus:border-teal-500 bg-teal-50/50'
                    }`}
                  />
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-teal-700">Password Strength:</span>
                      <Badge 
                        variant="outline" 
                        className={`font-semibold ${
                          passwordStrength.strength <= 25 ? 'border-red-300 text-red-700 bg-red-50' :
                          passwordStrength.strength <= 50 ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                          passwordStrength.strength <= 75 ? 'border-blue-300 text-blue-700 bg-blue-50' :
                          'border-green-300 text-green-700 bg-green-50'
                        }`}
                      >
                        {passwordStrength.strength >= 75 && <Zap className="w-3 h-3 mr-1" />}
                        {passwordStrength.label}
                      </Badge>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={passwordStrength.strength} 
                        className="h-3 bg-gray-200"
                      />
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {errors.newPassword && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.newPassword}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <Label htmlFor="confirm-password" className="text-base font-semibold text-teal-900">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => handlePasswordInput(e.target.value, setConfirmPassword)}
                    placeholder="Confirm new password"
                    className={`text-base h-12 border-2 rounded-xl ${
                      errors.confirmPassword 
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : confirmPassword && confirmPassword === newPassword 
                          ? 'border-green-300 focus:border-green-500 bg-green-50'
                          : 'border-teal-200 focus:border-teal-500 bg-teal-50/50'
                    }`}
                  />
                  {confirmPassword && confirmPassword === newPassword && (
                    <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
                {confirmPassword && confirmPassword === newPassword && !errors.confirmPassword && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Passwords match perfectly!</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl shadow-lg shadow-teal-500/25 touch-target"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5 mr-3" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card className="mt-8 shadow-lg border-2 border-gray-200 bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center text-teal-900">
              <Shield className="w-6 h-6 mr-3 text-teal-600" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-teal-800 font-medium">Password is encrypted and secure</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-teal-800 font-medium">Failed attempts are monitored</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-teal-800 font-medium">Password locks after multiple failures</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-teal-800 font-medium">Regular password updates recommended</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}