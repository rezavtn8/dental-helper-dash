import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Eye, Bell, Lock, X, Save } from 'lucide-react';

interface PrivacySettingsDialogProps {
  children: React.ReactNode;
}

export default function PrivacySettingsDialog({ children }: PrivacySettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Privacy settings state - in a real app, these would come from user preferences
  const [settings, setSettings] = useState({
    profileVisibility: true,
    taskHistory: true,
    performanceMetrics: false,
    activityLog: true,
    dataSharing: false,
  });

  const handleSave = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Privacy settings updated successfully!');
      setLoading(false);
      setOpen(false);
    }, 1000);
  };

  const updateSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-900">
            <Shield className="w-5 h-5 mr-2" />
            Privacy Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center text-blue-900">
                <Eye className="w-4 h-4 mr-2" />
                Profile Visibility
              </CardTitle>
              <CardDescription className="text-xs">
                Control what information is visible to your clinic team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visibility" className="text-sm">
                  Show profile to team members
                </Label>
                <Switch
                  id="profile-visibility"
                  checked={settings.profileVisibility}
                  onCheckedChange={() => updateSetting('profileVisibility')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="task-history" className="text-sm">
                  Share task completion history
                </Label>
                <Switch
                  id="task-history"
                  checked={settings.taskHistory}
                  onCheckedChange={() => updateSetting('taskHistory')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="performance-metrics" className="text-sm">
                  Show performance metrics to owners
                </Label>
                <Switch
                  id="performance-metrics"
                  checked={settings.performanceMetrics}
                  onCheckedChange={() => updateSetting('performanceMetrics')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center text-blue-900">
                <Lock className="w-4 h-4 mr-2" />
                Data & Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Manage how your activity data is stored and used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="activity-log" className="text-sm">
                  Keep detailed activity log
                </Label>
                <Switch
                  id="activity-log"
                  checked={settings.activityLog}
                  onCheckedChange={() => updateSetting('activityLog')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sharing" className="text-sm">
                  Allow anonymous usage analytics
                </Label>
                <Switch
                  id="data-sharing"
                  checked={settings.dataSharing}
                  onCheckedChange={() => updateSetting('dataSharing')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center text-blue-900">
                <Bell className="w-4 h-4 mr-2" />
                Notification Privacy
              </CardTitle>
              <CardDescription className="text-xs">
                Control notification content and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-600 p-3 bg-blue-50 rounded border border-blue-200">
                <p>Notification settings can be managed in the main Notification Preferences section.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}