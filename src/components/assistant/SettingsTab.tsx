import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Settings,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Lock,
  Info,
  Zap,
  User,
  Bell,
  Palette,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getUserInitials } from '@/lib/taskUtils';

export default function SettingsTab() {
  const { user, userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('password');
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        if (error.message.includes('same as the old password')) {
          toast.error('New password must be different from your current password');
        } else if (error.message.includes('weak')) {
          toast.error('Password is too weak. Please choose a stronger password.');
        } else if (error.message.includes('Invalid')) {
          toast.error('Current session invalid. Please log in again.');
        } else {
          toast.error('Failed to update password: ' + error.message);
        }
        return;
      }
      
      toast.success('Password Updated Successfully! 🎉', {
        description: 'Your new password is now active. You remain signed in.'
      });
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      
    } catch (error) {
      toast.error('Failed to Update Password', {
        description: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const settingsMenuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password & Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  const renderProfileSection = () => (
    <Card className="shadow-xl border-2 border-teal-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
        <CardTitle className="flex items-center text-teal-900">
          <User className="w-6 h-6 mr-3 text-teal-600" />
          Profile Information
        </CardTitle>
        <CardDescription className="text-teal-700">
          View and manage your profile details
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20 border-4 border-teal-200 shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold">
                {getUserInitials(userProfile?.name || 'Assistant')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-teal-900">{userProfile?.name || 'Assistant'}</h3>
              <p className="text-teal-700">{userProfile?.email || user?.email}</p>
              <Badge variant="secondary" className="bg-teal-100 text-teal-700 border-teal-200">
                {userProfile?.role === 'admin' ? 'Admin Assistant' : 'Assistant'}
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-semibold text-teal-900">Email Address</Label>
              <p className="text-gray-700 mt-1">{userProfile?.email || user?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-teal-900">Role</Label>
              <p className="text-gray-700 mt-1">{userProfile?.role === 'admin' ? 'Admin Assistant' : 'Assistant'}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-teal-900">Member Since</Label>
              <p className="text-gray-700 mt-1">N/A</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-teal-900">Status</Label>
              <p className="text-gray-700 mt-1">
                <Badge variant={userProfile?.is_active ? "default" : "destructive"} className="text-xs">
                  {userProfile?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPasswordSection = () => (
    <Card className="shadow-xl border-2 border-teal-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
        <CardTitle className="flex items-center text-teal-900">
          <Lock className="w-6 h-6 mr-3 text-teal-600" />
          Password & Security
        </CardTitle>
        <CardDescription className="text-teal-700">
          Update your password for enhanced security
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
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
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={`text-base h-12 border-2 rounded-xl ${
                  errors.newPassword 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-teal-200 focus:border-teal-500 bg-teal-50/50'
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
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
                <Progress value={passwordStrength.strength} className="h-2" />
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
            <Input
              id="confirm-password"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`text-base h-12 border-2 rounded-xl ${
                errors.confirmPassword 
                  ? 'border-red-300 focus:border-red-500 bg-red-50'
                  : confirmPassword && confirmPassword === newPassword 
                    ? 'border-green-300 focus:border-green-500 bg-green-50'
                    : 'border-teal-200 focus:border-teal-500 bg-teal-50/50'
              }`}
            />
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

          <Button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword || passwordStrength.strength < 50}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Updating Password...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-3" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderNotificationsSection = () => (
    <Card className="shadow-xl border-2 border-teal-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
        <CardTitle className="flex items-center text-teal-900">
          <Bell className="w-6 h-6 mr-3 text-teal-600" />
          Notification Preferences
        </CardTitle>
        <CardDescription className="text-teal-700">
          Manage how you receive updates and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-teal-900 mb-2">Notification Settings</h3>
            <p className="text-teal-600">Notification preferences will be available in future updates.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPreferencesSection = () => (
    <Card className="shadow-xl border-2 border-teal-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
        <CardTitle className="flex items-center text-teal-900">
          <Palette className="w-6 h-6 mr-3 text-teal-600" />
          Preferences
        </CardTitle>
        <CardDescription className="text-teal-700">
          Customize your app experience
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-teal-900 mb-2">Appearance & Preferences</h3>
            <p className="text-teal-600">Customization options will be available in future updates.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'password':
        return renderPasswordSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'preferences':
        return renderPreferencesSection();
      default:
        return renderPasswordSection();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-teal-900 mb-3">Settings</h1>
        <p className="text-teal-600 text-lg">Manage your profile, security, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Menu */}
        <div className="lg:w-1/3">
          <Card className="shadow-lg border-2 border-teal-200 sticky top-4">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50">
              <CardTitle className="flex items-center text-teal-900">
                <Settings className="w-5 h-5 mr-2" />
                Settings Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {settingsMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full justify-start h-12 px-6 rounded-none ${
                        isActive 
                          ? 'bg-teal-100 text-teal-900 border-r-4 border-teal-500 font-semibold' 
                          : 'hover:bg-teal-50 text-teal-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:w-2/3">
          {renderContent()}
        </div>
      </div>

      {/* Security Info */}
      <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-3 text-lg">Security & Privacy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800">All data is encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800">Regular security monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800">HIPAA compliant platform</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800">Secure password requirements</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}