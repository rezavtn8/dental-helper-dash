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
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-sm text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-semibold mb-1">Settings Not Available</h3>
        <p className="text-sm text-muted-foreground">Unable to load clinic settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your clinic information and preferences</p>
      </div>

      {/* Clinic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Building2 className="w-4 h-4 mr-2" />
            Clinic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="clinic-name" className="text-sm">Clinic Name</Label>
              <Input
                id="clinic-name"
                value={clinic.name}
                onChange={(e) => setClinic(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Enter clinic name"
                className="h-9"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="clinic-email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
                <Input
                  id="clinic-email"
                  type="email"
                  value={clinic.email || ''}
                  onChange={(e) => setClinic(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="clinic@example.com"
                  className="pl-7 h-9"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="clinic-phone" className="text-sm">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
                <Input
                  id="clinic-phone"
                  value={clinic.phone || ''}
                  onChange={(e) => setClinic(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="(555) 123-4567"
                  className="pl-7 h-9"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="subscription-status" className="text-sm">Subscription</Label>
              <Input
                id="subscription-status"
                value={clinic.subscription_status}
                disabled
                className="bg-muted h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="clinic-address" className="text-sm">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-2 top-2 text-muted-foreground w-3 h-3" />
              <Textarea
                id="clinic-address"
                value={clinic.address || ''}
                onChange={(e) => setClinic(prev => prev ? { ...prev, address: e.target.value } : null)}
                placeholder="Enter clinic address"
                rows={2}
                className="pl-7 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveClinicInfo} disabled={saving} size="sm">
              {saving ? (
                <div className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Save className="w-3 h-3 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Clinic Code Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Shield className="w-4 h-4 mr-2" />
              Access Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Share this code with assistants to join your clinic.
              </p>
              
              <div className="flex items-center gap-2">
                <Input
                  value={clinic.clinic_code}
                  disabled
                  className="bg-muted font-mono text-sm h-9"
                />
                <Button
                  variant="outline"
                  onClick={copyClinicCode}
                  size="sm"
                  className="px-3"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
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
                <Label className="text-sm">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Important updates</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Task Reminders</Label>
                <p className="text-xs text-muted-foreground">Overdue tasks</p>
              </div>
              <Switch
                checked={settings.taskReminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, taskReminders: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Weekly Reports</Label>
                <p className="text-xs text-muted-foreground">Performance analytics</p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyReports: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}