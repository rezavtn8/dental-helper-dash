import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getUserInitials } from '@/lib/taskUtils';
import EditProfileDialog from './EditProfileDialog';
import PrivacySettingsDialog from './PrivacySettingsDialog';
import { 
  Eye, 
  EyeOff, 
  Lock,
  User,
  Bell,
  Palette,
  Mail,
  Moon,
  Sun,
  Monitor,
  Shield
} from 'lucide-react';

export default function SettingsTab() {
  const { user, userProfile } = useAuth();
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
      
      toast.success('Password Updated Successfully!', {
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

  return (
    <div className="max-w-4xl space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <User className="w-4 h-4 mr-2" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {getUserInitials(userProfile?.name || 'Assistant')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{userProfile?.name || 'Assistant'}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="w-3 h-3 mr-1" />
                {userProfile?.email || user?.email}
              </div>
              <Badge variant="secondary" className="text-xs">
                {userProfile?.role === 'admin' ? 'Admin Assistant' : 'Assistant'}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <EditProfileDialog>
              <Button variant="outline" size="sm" className="w-full">
                <User className="w-3 h-3 mr-2" />
                Edit Profile
              </Button>
            </EditProfileDialog>
            <PrivacySettingsDialog>
              <Button variant="outline" size="sm" className="w-full">
                <Shield className="w-3 h-3 mr-2" />
                Privacy Settings
              </Button>
            </PrivacySettingsDialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Password & Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`h-9 text-sm ${errors.newPassword ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  >
                    {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
                
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength <= 25 ? 'text-destructive' :
                        passwordStrength.strength <= 50 ? 'text-yellow-600' :
                        passwordStrength.strength <= 75 ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <Progress value={passwordStrength.strength} className="h-1" />
                  </div>
                )}
                
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={`h-9 text-sm ${errors.confirmPassword ? 'border-destructive' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword || passwordStrength.strength < 50}
                size="sm"
                className="w-full mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Task Reminders</Label>
                <p className="text-xs text-muted-foreground">Get notified about tasks</p>
              </div>
              <Switch
                checked={notifications.taskReminders}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, taskReminders: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Email Updates</Label>
                <p className="text-xs text-muted-foreground">Important emails</p>
              </div>
              <Switch
                checked={notifications.emailUpdates}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailUpdates: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Browser notifications</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Sound Alerts</Label>
                <p className="text-xs text-muted-foreground">Audio notifications</p>
              </div>
              <Switch
                checked={notifications.soundAlerts}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, soundAlerts: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Palette className="w-4 h-4 mr-2" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Theme</Label>
                <p className="text-xs text-muted-foreground">Light, dark, or system</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={preferences.theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
                  className="h-8 px-3"
                >
                  <Sun className="w-3 h-3" />
                </Button>
                <Button
                  variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
                  className="h-8 px-3"
                >
                  <Moon className="w-3 h-3" />
                </Button>
                <Button
                  variant={preferences.theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreferences(prev => ({ ...prev, theme: 'system' }))}
                  className="h-8 px-3"
                >
                  <Monitor className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Compact View</Label>
                <p className="text-xs text-muted-foreground">Reduce spacing</p>
              </div>
              <Switch
                checked={preferences.compactView}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, compactView: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}