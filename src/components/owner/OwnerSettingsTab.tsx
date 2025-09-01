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
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-blue-900 mb-3">Clinic Settings</h1>
        <p className="text-blue-600 text-lg">Manage your clinic information and preferences</p>
      </div>

      {/* Clinic Information */}
      <Card className="shadow-xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 border-b border-blue-100">
          <CardTitle className="flex items-center text-blue-900">
            <Building2 className="w-6 h-6 mr-3 text-blue-600" />
            Clinic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Clinic Name</Label>
              <Input
                id="clinic-name"
                value={clinic.name}
                onChange={(e) => setClinic(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Enter clinic name"
                className="h-12 border-2 border-blue-200 focus:border-blue-500 rounded-xl"
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
                  className="pl-10 h-12 border-2 border-blue-200 focus:border-blue-500 rounded-xl"
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
                  className="pl-10 h-12 border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscription-status">Subscription Status</Label>
              <Input
                id="subscription-status"
                value={clinic.subscription_status}
                disabled
                className="bg-muted h-12 rounded-xl"
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
                className="pl-10 border-2 border-blue-200 focus:border-blue-500 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveClinicInfo} disabled={saving} className="h-12 px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl">
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
      <Card className="shadow-xl border-2 border-green-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100">
          <CardTitle className="flex items-center text-blue-900">
            <Shield className="w-6 h-6 mr-3 text-green-600" />
            Clinic Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
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
                  className="bg-muted font-mono text-lg h-12 rounded-xl"
                />
                <Button
                  variant="outline"
                  onClick={copyClinicCode}
                  className="flex items-center gap-2 h-12 px-6 rounded-xl"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-yellow-50 border-b border-blue-100">
          <CardTitle className="flex items-center text-blue-900">
            <Bell className="w-6 h-6 mr-3 text-blue-600" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
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
    </div>
  );
}