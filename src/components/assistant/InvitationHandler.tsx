import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Building2, AlertCircle } from 'lucide-react';

interface PendingInvitation {
  id: string;
  token: string;
  clinic_id: string;
  email: string;
  created_at: string;
  expires_at: string;
  clinic_name?: string;
}

interface InvitationHandlerProps {
  userEmail: string;
  onInvitationAccepted: () => void;
}

export const InvitationHandler: React.FC<InvitationHandlerProps> = ({ 
  userEmail, 
  onInvitationAccepted 
}) => {
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const { acceptInvitation } = useAuth();

  useEffect(() => {
    fetchPendingInvitations();
  }, [userEmail]);

  const fetchPendingInvitations = async () => {
    try {
      setLoading(true);
      
      // Fetch pending invitations for the user's email
      const { data: invitations, error } = await supabase
        .from('invitations')
        .select(`
          id,
          token, 
          clinic_id,
          email,
          created_at,
          expires_at,
          clinics!inner(name)
        `)
        .eq('email', userEmail)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include clinic name
      const transformedInvitations = invitations?.map(inv => ({
        ...inv,
        clinic_name: inv.clinics?.name || 'Unknown Clinic'
      })) || [];

      setPendingInvitations(transformedInvitations);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      toast.error('Failed to load pending invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (token: string, clinicName: string) => {
    try {
      setProcessing(token);
      
      const result = await acceptInvitation(token);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Successfully joined ${clinicName}!`);
      
      // Refresh the page to trigger auth state update and proper routing
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setProcessing(null);
    }
  };

  const handleManualTokenSubmit = async () => {
    if (!manualToken.trim()) {
      toast.error('Please enter an invitation token');
      return;
    }

    await handleAcceptInvitation(manualToken.trim(), 'the clinic');
    setManualToken('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
        <h1 className="text-2xl font-bold">No Clinic Assigned</h1>
        <p className="text-muted-foreground">
          Your account is not currently associated with any clinic. 
          {pendingInvitations.length > 0 
            ? ' You have pending invitations below.'
            : ' Please accept an invitation or contact your clinic administrator.'
          }
        </p>
      </div>

      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </h2>
          
          {pendingInvitations.map((invitation) => (
            <Card key={invitation.id} className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {invitation.clinic_name}
                </CardTitle>
                <CardDescription>
                  Invited on {new Date(invitation.created_at).toLocaleDateString()}
                  {' • '}
                  Expires {new Date(invitation.expires_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleAcceptInvitation(invitation.token, invitation.clinic_name)}
                  disabled={processing === invitation.token}
                  className="w-full"
                >
                  {processing === invitation.token ? (
                    <>
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                      Accepting...
                    </>
                  ) : (
                    `Accept Invitation to ${invitation.clinic_name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowManualInput(!showManualInput)}
          >
            {showManualInput ? 'Hide' : 'Have an invitation token?'}
          </Button>
        </div>

        {showManualInput && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Invitation Token</CardTitle>
              <CardDescription>
                If you received an invitation token directly, you can enter it here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Invitation Token</Label>
                <Input
                  id="token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Enter your invitation token here..."
                />
              </div>
              <Button 
                onClick={handleManualTokenSubmit}
                disabled={processing === 'manual' || !manualToken.trim()}
                className="w-full"
              >
                {processing === 'manual' ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Accepting...
                  </>
                ) : (
                  'Accept Invitation'
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {pendingInvitations.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No pending invitations found for {userEmail}. 
            Please contact your clinic administrator to send you an invitation, 
            or use the manual token entry above if you have a token.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};