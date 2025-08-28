import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  UserCheck,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface InvitationPendingCardProps {
  onInvitationAccepted: () => void;
}

export default function InvitationPendingCard({ onInvitationAccepted }: InvitationPendingCardProps) {
  const { user, acceptInvitation } = useAuth();
  const [invitationToken, setInvitationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [checkingInvitations, setCheckingInvitations] = useState(true);

  // Check for pending invitations for this user's email
  useEffect(() => {
    const checkPendingInvitations = async () => {
      if (!user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('email', user.email)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString());

        if (error) throw error;
        
        setPendingInvitations(data || []);
      } catch (error) {
        console.error('Error checking pending invitations:', error);
      } finally {
        setCheckingInvitations(false);
      }
    };

    checkPendingInvitations();
  }, [user?.email]);

  const handleAcceptInvitation = async (token: string) => {
    if (!token.trim()) {
      toast.error('Please enter an invitation token');
      return;
    }

    setLoading(true);

    try {
      const result = await acceptInvitation(token);
      
      if (result.error) {
        toast.error('Failed to Accept Invitation', {
          description: result.error
        });
        return;
      }

      toast.success('Invitation Accepted Successfully! 🎉', {
        description: 'Welcome to the team! Redirecting you to the dashboard...'
      });

      // Wait a moment for the toast, then trigger refresh
      setTimeout(() => {
        onInvitationAccepted();
      }, 1500);

    } catch (error) {
      toast.error('Failed to Accept Invitation', {
        description: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAcceptInvitation(invitationToken);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-teal-900 mb-3">Welcome to the Assistant Portal</h1>
          <p className="text-teal-700 text-lg">You need to accept a clinic invitation to access your dashboard</p>
        </div>

        {checkingInvitations ? (
          <Card className="shadow-xl border-2 border-teal-200">
            <CardContent className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-teal-700">Checking for pending invitations...</p>
            </CardContent>
          </Card>
        ) : pendingInvitations.length > 0 ? (
          /* Show pending invitations */
          <Card className="shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="flex items-center text-green-900">
                <Mail className="w-6 h-6 mr-3 text-green-600" />
                Pending Invitations Found
              </CardTitle>
              <CardDescription className="text-green-700">
                We found {pendingInvitations.length} pending invitation(s) for your email
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-green-900 mb-1">Clinic Invitation</h3>
                        <p className="text-sm text-green-700">Role: {invitation.role}</p>
                        <p className="text-xs text-green-600">
                          Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleAcceptInvitation(invitation.token)}
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-5 h-5 mr-2" />
                          Accept This Invitation
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Manual token entry */
          <Card className="shadow-xl border-2 border-teal-200">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
              <CardTitle className="flex items-center text-teal-900">
                <Search className="w-6 h-6 mr-3 text-teal-600" />
                Enter Invitation Token
              </CardTitle>
              <CardDescription className="text-teal-700">
                Please enter the invitation token you received via email
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleManualTokenSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="invitation-token" className="text-base font-semibold text-teal-900">
                    Invitation Token
                  </Label>
                  <Input
                    id="invitation-token"
                    type="text"
                    value={invitationToken}
                    onChange={(e) => setInvitationToken(e.target.value)}
                    placeholder="Enter your invitation token"
                    className="h-12 border-2 border-teal-200 focus:border-teal-500 bg-teal-50/50 rounded-xl"
                    disabled={loading}
                  />
                  <p className="text-sm text-teal-600">
                    Check your email for an invitation token from your clinic administrator.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !invitationToken.trim()}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Accepting Invitation...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5 mr-3" />
                      Accept Invitation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Help Card */}
        <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-3 text-lg">Need Help?</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Check your email inbox and spam folder for invitation emails
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Contact your clinic administrator if you haven't received an invitation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Make sure you're using the same email address used for the invitation
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}