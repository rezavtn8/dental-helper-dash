import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getUserInitials } from '@/lib/taskUtils';
import EditProfileDialog from './EditProfileDialog';
import PrivacySettingsDialog from './PrivacySettingsDialog';
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
  Globe,
  Mail,
  Calendar,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function SettingsTab() {
  const { user, userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  // Settings state
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    emailUpdates: true,
    pushNotifications: false,
    weeklyReports: true,
    soundAlerts: true
  });
  
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC-5',
    compactView: false
  });

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
    { id: 'profile', label: 'Profile', icon: User, color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-50' },
    { id: 'password', label: 'Security', icon: Lock, color: 'from-green-400 to-green-500', bgColor: 'bg-green-50' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-yellow-400 to-yellow-500', bgColor: 'bg-yellow-50' },
    { id: 'preferences', label: 'Preferences', icon: Palette, color: 'from-purple-400 to-purple-500', bgColor: 'bg-purple-50' },
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="shadow-xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="flex items-center text-blue-900">
            <User className="w-6 h-6 mr-3 text-blue-600" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-blue-700">
            View and manage your profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-blue-200 shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold">
                    {getUserInitials(userProfile?.name || 'Assistant')}
                  </AvatarFallback>
                </Avatar>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-blue-900">{userProfile?.name || 'Assistant'}</h3>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <p className="text-blue-700">{userProfile?.email || user?.email}</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-1">
                  {userProfile?.role === 'admin' ? 'Admin Assistant' : 'Assistant'}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-blue-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </Label>
                <p className="text-gray-700 font-medium">{userProfile?.email || user?.email}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-blue-900 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Role
                </Label>
                <p className="text-gray-700 font-medium">{userProfile?.role === 'admin' ? 'Admin Assistant' : 'Assistant'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-blue-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member Since
                </Label>
                <p className="text-gray-700 font-medium">Recently joined</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-blue-900 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Status
                </Label>
                <Badge variant={userProfile?.is_active ? "default" : "destructive"} className="text-sm">
                  {userProfile?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card className="shadow-lg border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <EditProfileDialog>
              <Button variant="outline" className="h-12">
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </EditProfileDialog>
            <PrivacySettingsDialog>
              <Button variant="outline" className="h-12">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Settings
              </Button>
            </PrivacySettingsDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPasswordSection = () => (
    <div className="space-y-6">
      {/* Password Update Card */}
      <Card className="shadow-xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-blue-100">
          <CardTitle className="flex items-center text-blue-900">
            <Lock className="w-6 h-6 mr-3 text-blue-600" />
            Password & Security
          </CardTitle>
          <CardDescription className="text-blue-700">
            Update your password for enhanced security
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-base font-semibold text-blue-900">
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
                      : 'border-blue-200 focus:border-blue-500 bg-blue-50/50'
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
                    <span className="text-sm font-medium text-blue-700">Password Strength:</span>
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
              <Label htmlFor="confirm-password" className="text-base font-semibold text-blue-900">
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
                      : 'border-blue-200 focus:border-blue-500 bg-blue-50/50'
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
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg"
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

      {/* Security Overview */}
      <Card className="shadow-lg border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Shield className="w-5 h-5 mr-2" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Account Security</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Strong</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                2FA Setup
              </Button>
              <Button variant="outline" size="sm">
                <Info className="w-4 h-4 mr-2" />
                Security Log
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card className="shadow-xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-yellow-50 border-b border-blue-100">
          <CardTitle className="flex items-center text-blue-900">
            <Bell className="w-6 h-6 mr-3 text-blue-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-blue-700">
            Customize how you receive updates and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <Label className="font-medium text-blue-900">Task Reminders</Label>
                <p className="text-sm text-blue-700">Get notified about upcoming tasks</p>
              </div>
            </div>
            <Switch
              checked={notifications.taskReminders}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, taskReminders: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <Label className="font-medium text-green-900">Email Updates</Label>
                <p className="text-sm text-green-700">Receive important updates via email</p>
              </div>
            </div>
            <Switch
              checked={notifications.emailUpdates}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailUpdates: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <div>
                <Label className="font-medium text-purple-900">Push Notifications</Label>
                <p className="text-sm text-purple-700">Get push notifications on your device</p>
              </div>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <div>
                <Label className="font-medium text-yellow-900">Weekly Reports</Label>
                <p className="text-sm text-yellow-700">Receive weekly performance summaries</p>
              </div>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-3">
              {notifications.soundAlerts ? <Volume2 className="w-5 h-5 text-orange-600" /> : <VolumeX className="w-5 h-5 text-orange-600" />}
              <div>
                <Label className="font-medium text-orange-900">Sound Alerts</Label>
                <p className="text-sm text-orange-700">Play sounds for important notifications</p>
              </div>
            </div>
            <Switch
              checked={notifications.soundAlerts}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, soundAlerts: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Schedule */}
      <Card className="shadow-lg border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Calendar className="w-5 h-5 mr-2" />
            Notification Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="font-medium">Quiet Hours</Label>
              <p className="text-sm text-gray-600 mt-1">10:00 PM - 8:00 AM</p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Customize Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card className="shadow-xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
          <CardTitle className="flex items-center text-blue-900">
            <Palette className="w-6 h-6 mr-3 text-blue-600" />
            Appearance & Preferences
          </CardTitle>
          <CardDescription className="text-blue-700">
            Customize your app experience and interface
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {/* Theme Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-blue-900">Theme</Label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', label: 'Light', icon: Sun, color: 'from-yellow-400 to-orange-400' },
                { id: 'dark', label: 'Dark', icon: Moon, color: 'from-gray-600 to-gray-800' },
                { id: 'system', label: 'System', icon: Monitor, color: 'from-blue-400 to-purple-400' }
              ].map((theme) => {
                const Icon = theme.icon;
                const isSelected = preferences.theme === theme.id;
                return (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                    onClick={() => setPreferences(prev => ({ ...prev, theme: theme.id }))}
                  >
                    <div className="text-center space-y-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.color} mx-auto flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                        {theme.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Language & Region */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-blue-900">Language & Region</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Language</Label>
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900">English (US)</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Timezone</Label>
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900">UTC-5 (EST)</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Interface Preferences */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-blue-900">Interface</Label>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-purple-600" />
                <div>
                  <Label className="font-medium text-purple-900">Compact View</Label>
                  <p className="text-sm text-purple-700">Use a more condensed interface layout</p>
                </div>
              </div>
              <Switch
                checked={preferences.compactView}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, compactView: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Preferences */}
      <Card className="shadow-lg border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Settings className="w-5 h-5 mr-2" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Privacy
              </Button>
              <Button variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                Accessibility
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
        <h1 className="text-4xl font-bold text-blue-900 mb-3">Settings</h1>
        <p className="text-blue-600 text-lg">Manage your profile, security, and preferences</p>
      </div>

      {/* Interactive Settings Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {settingsMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isHovered = hoveredCard === index;
          
          return (
            <Card
              key={item.id}
              className={`relative overflow-hidden cursor-pointer transform transition-all duration-500 ${
                isActive ? 'scale-105 shadow-xl' : 'hover:scale-105 hover:shadow-lg'
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setActiveSection(item.id)}
            >
              <CardContent className="p-0">
                {/* Animated Background */}
                <div className={`absolute inset-0 ${item.bgColor} transition-opacity duration-300 ${
                  isActive || isHovered ? 'opacity-100' : 'opacity-50'
                }`} />
                
                {/* Rotating Border Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-lg opacity-20 transition-all duration-700 ${
                  isActive || isHovered ? 'animate-pulse opacity-40' : ''
                }`} />
                
                {/* Content */}
                <div className="relative p-6 z-10">
                  <div className="flex flex-col items-center space-y-3">
                    {/* Rotating Icon Wheel */}
                    <div className={`relative w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg transform transition-all duration-500 ${
                      isActive || isHovered ? 'rotate-180 scale-110' : ''
                    }`}>
                      <div className={`absolute inset-1 rounded-full bg-white/20 transition-all duration-700 ${
                        isActive || isHovered ? 'rotate-[-180deg]' : ''
                      }`} />
                      <Icon className={`w-6 h-6 text-white z-10 transition-all duration-500 ${
                        isActive || isHovered ? 'scale-125' : ''
                      }`} />
                    </div>
                    
                    <p className={`text-sm font-semibold text-center transition-all duration-300 ${
                      isActive ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {item.label}
                    </p>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${item.color}`} />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Settings Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>

      {/* Security Info */}
      <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Shield className="w-8 h-8 text-blue-600 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Security & Privacy</h4>
              <p className="text-blue-700 mb-4">
                Your data is protected with industry-standard encryption and security measures. 
                We never share your personal information with third parties.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Shield className="w-3 h-3 mr-1" />
                  SSL Encrypted
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Lock className="w-3 h-3 mr-1" />
                  Secure Storage
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  HIPAA Compliant
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}