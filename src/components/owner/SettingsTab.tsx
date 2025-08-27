import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Building2,
  Mail,
  Phone,
  MapPin,
  Key,
  Trash2,
  Save,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SettingsTabProps {
  clinic: any;
  onUpdate: () => void;
}

export default function SettingsTab({ clinic, onUpdate }: SettingsTabProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [clinicData, setClinicData] = useState({
    name: clinic?.name || '',
    address: clinic?.address || '',
    phone: clinic?.phone || '',
    email: clinic?.email || ''
  });

  const handleSave = async () => {
    if (!clinic?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clinics')
        .update(clinicData)
        .eq('id', clinic.id);

      if (error) throw error;

      toast.success("Clinic information saved successfully!");

      onUpdate();
    } catch (error) {
      toast.error("Failed to update clinic settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyClinicCode = () => {
    if (clinic?.clinic_code) {
      navigator.clipboard.writeText(clinic.clinic_code);
      setCopied(true);
      toast.success("Clinic code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteClinic = async () => {
    if (!clinic?.id) return;
    
    try {
      // In a real app, you'd want to soft delete and handle this more carefully
      const { error } = await supabase
        .from('clinics')
        .update({ is_active: false })
        .eq('id', clinic.id);

      if (error) throw error;

      toast.success("Clinic archived successfully. Contact support if you need to restore it.");

      // Redirect to home or login page
      window.location.href = '/';
    } catch (error) {
      toast.error("Failed to archive clinic. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Manage your practice settings and preferences</p>
      </div>

      {/* Clinic Information */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-teal-600" />
            Clinic Information
          </CardTitle>
          <CardDescription>
            Update your practice details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Practice Name</Label>
              <Input
                id="clinic-name"
                value={clinicData.name}
                onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                placeholder="Enter practice name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="clinic-email"
                  type="email"
                  value={clinicData.email}
                  onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
                  placeholder="clinic@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="clinic-phone"
                  type="tel"
                  value={clinicData.phone}
                  onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="clinic-address"
                  value={clinicData.address}
                  onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clinic Code */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2 text-teal-600" />
            Clinic Access Code
          </CardTitle>
          <CardDescription>
            Share this code with your team members to give them access to your clinic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Clinic Code</p>
                <p className="font-mono text-lg font-bold text-teal-600 tracking-wider">
                  {clinic?.clinic_code || 'N/A'}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={copyClinicCode}
              className="flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">How to share access:</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Share this code with new team members</li>
                  <li>• They can use it at the clinic login page</li>
                  <li>• You can add them directly from the Team tab</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-teal-600" />
            Account Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-600">Last changed 3 months ago</p>
            </div>
            <Button variant="outline">
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                Recommended
              </Badge>
            </div>
            <Button variant="outline">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>
            Manage your practice subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-medium text-gray-900">Professional Plan</p>
                <p className="text-sm text-gray-600">
                  Unlimited tasks, team members, and analytics
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                Active
              </Badge>
            </div>
            <Button variant="outline">
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="shadow-sm border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-900">Archive Clinic</p>
                  <p className="text-sm text-red-700">
                    This will deactivate your clinic and make it inaccessible. 
                    This action can be reversed by contacting support.
                  </p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="shrink-0">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Archive Clinic
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Archive Clinic</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to archive your clinic? This will:
                        <br /><br />
                        • Make your clinic inaccessible to all team members
                        <br />
                        • Disable all tasks and workflows
                        <br />
                        • Require contacting support to restore access
                        <br /><br />
                        This action is reversible but requires support assistance.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteClinic}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Archive Clinic
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}