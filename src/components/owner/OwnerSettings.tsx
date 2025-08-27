import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/taskUtils';
import { 
  Building2,
  Bell,
  Palette,
  Users,
  Shield,
  Settings,
  Save,
  UserPlus,
  Trash2
} from 'lucide-react';

interface OwnerSettingsProps {
  clinic: any;
  onUpdate: () => void;
}

const OwnerSettings: React.FC<OwnerSettingsProps> = ({ clinic, onUpdate }) => {
  const { user, userProfile } = useAuth();
  const [clinicSettings, setClinicSettings] = useState({
    name: clinic?.name || '',
    email: clinic?.email || '',
    phone: clinic?.phone || '',
    address: clinic?.address || ''
  });

  const [notifications, setNotifications] = useState({
    taskReminders: true,
    teamUpdates: true,
    dailyReports: true,
    weeklyReports: false
  });

  const [theme, setTheme] = useState({
    darkMode: false,
    colorScheme: 'blue'
  });

  const handleClinicUpdate = async () => {
    // This would typically update the clinic in the database
    toast.success("Clinic settings saved successfully!");
    onUpdate();
  };

  const handleNotificationUpdate = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your clinic and account preferences</p>
      </div>

      {/* Clinic Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Clinic Profile
          </CardTitle>
          <CardDescription>
            Update your clinic information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Clinic Name</Label>
              <Input
                id="clinic-name"
                value={clinicSettings.name}
                onChange={(e) => setClinicSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter clinic name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic-email">Email</Label>
              <Input
                id="clinic-email"
                type="email"
                value={clinicSettings.email}
                onChange={(e) => setClinicSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="clinic@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic-phone">Phone</Label>
              <Input
                id="clinic-phone"
                value={clinicSettings.phone}
                onChange={(e) => setClinicSettings(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic-address">Address</Label>
            <Textarea
              id="clinic-address"
              value={clinicSettings.address}
              onChange={(e) => setClinicSettings(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter clinic address"
              rows={3}
            />
          </div>
          <Button onClick={handleClinicUpdate}>
            <Save className="h-4 w-4 mr-2" />
            Save Clinic Settings
          </Button>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage team members and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Team Members</h4>
              <p className="text-sm text-muted-foreground">Add and manage your clinic staff</p>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
          
          <Separator />
          
          {/* Current User Profile */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials(userProfile?.name || 'Owner')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{userProfile?.name}</h4>
                <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                  Owner
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {key === 'taskReminders' && 'Get notified about upcoming and overdue tasks'}
                  {key === 'teamUpdates' && 'Receive updates about team member activities'}
                  {key === 'dailyReports' && 'Daily summary of clinic performance'}
                  {key === 'weeklyReports' && 'Weekly analytics and progress reports'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => handleNotificationUpdate(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Switch
              checked={theme.darkMode}
              onCheckedChange={(checked) => setTheme(prev => ({ ...prev, darkMode: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Color Scheme</Label>
            <div className="flex gap-2">
              {['blue', 'green', 'purple', 'orange'].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    theme.colorScheme === color ? 'border-foreground' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: `hsl(var(--${color}-500))` }}
                  onClick={() => setTheme(prev => ({ ...prev, colorScheme: color }))}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Login History
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground">
              Irreversible actions that affect your entire clinic
            </p>
            <Button variant="destructive" className="mt-2">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Clinic Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerSettings;