import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Settings, 
  Building2, 
  Copy,
  Shield,
  Bell,
  Users,
  Database,
  AlertTriangle,
  Save,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface ClinicSettings {
  id: string;
  name: string;
  clinic_code: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  subscription_status: string;
}

interface OwnerSettingsTabProps {
  clinicId: string;
}

export default function OwnerSettingsTab({ clinicId }: OwnerSettingsTabProps) {
  const { userProfile } = useAuth();
  const [clinic, setClinic] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    weeklyReports: true,
    autoAssignTasks: false
  });

  useEffect(() => {
    if (clinicId) {
      fetchClinicSettings();
    }
  }, [clinicId]);

  const fetchClinicSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single();

      if (error) throw error;
      setClinic(data);
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
      toast.error('Failed to load clinic settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClinicInfo = async () => {
    if (!clinic) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('clinics')
        .update({
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          email: clinic.email
        })
        .eq('id', clinicId);

      if (error) throw error;
      
      toast.success('Clinic information updated successfully');
    } catch (error) {
      console.error('Error updating clinic info:', error);
      toast.error('Failed to update clinic information');
    } finally {
      setSaving(false);
    }
  };

  const copyClinicCode = () => {
    if (clinic?.clinic_code) {
      navigator.clipboard.writeText(clinic.clinic_code);
      toast.success('Clinic code copied to clipboard!');
    }
  };

  const handleRegenerateCode = async () => {
    try {
      // This would typically call a stored procedure to regenerate the code
      toast.info('Code regeneration feature coming soon');
    } catch (error) {
      console.error('Error regenerating code:', error);
      toast.error('Failed to regenerate clinic code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Settings Not Available</h3>
        <p className="text-muted-foreground">Unable to load clinic settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Clinic Settings</h3>
        <p className="text-muted-foreground">Manage your clinic information and preferences</p>
      </div>

      {/* Clinic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Clinic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Clinic Name</Label>
              <Input
                id="clinic-name"
                value={clinic.name}
                onChange={(e) => setClinic(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Enter clinic name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="clinic-email"
                  type="email"
                  value={clinic.email || ''}
                  onChange={(e) => setClinic(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="clinic@example.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="clinic-phone"
                  value={clinic.phone || ''}
                  onChange={(e) => setClinic(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="(555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscription-status">Subscription Status</Label>
              <Input
                id="subscription-status"
                value={clinic.subscription_status}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinic-address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
              <Textarea
                id="clinic-address"
                value={clinic.address || ''}
                onChange={(e) => setClinic(prev => prev ? { ...prev, address: e.target.value } : null)}
                placeholder="Enter clinic address"
                rows={3}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveClinicInfo} disabled={saving}>
              {saving ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clinic Code Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Clinic Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Share this code with assistants to allow them to join your clinic. Keep it secure and only share with trusted team members.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="clinic-code">Clinic Code</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="clinic-code"
                  value={clinic.clinic_code}
                  disabled
                  className="bg-muted font-mono text-lg"
                />
                <Button
                  variant="outline"
                  onClick={copyClinicCode}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={handleRegenerateCode}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Regenerate Code
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Regenerating the code will invalidate the current one. All pending invitations will need to be resent.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task-reminders">Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders for overdue tasks and deadlines
              </p>
            </div>
            <Switch
              id="task-reminders"
              checked={settings.taskReminders}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, taskReminders: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-reports">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly performance and analytics reports
              </p>
            </div>
            <Switch
              id="weekly-reports"
              checked={settings.weeklyReports}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyReports: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-assign">Auto-assign Tasks</Label>
              <p className="text-sm text-muted-foreground">
                Automatically assign new tasks to available assistants
              </p>
            </div>
            <Switch
              id="auto-assign"
              checked={settings.autoAssignTasks}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAssignTasks: checked }))}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Clinic Status</Label>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${clinic.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {clinic.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your clinic is currently {clinic.is_active ? 'active and operational' : 'inactive'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Owner Name</Label>
              <p className="text-sm font-medium mt-1">{userProfile?.name}</p>
            </div>
            <div>
              <Label>Owner Email</Label>
              <p className="text-sm font-medium mt-1">{userProfile?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Account Created</Label>
              <p className="text-sm font-medium mt-1">N/A</p>
            </div>
            <div>
              <Label>Last Login</Label>
              <p className="text-sm font-medium mt-1">N/A</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}