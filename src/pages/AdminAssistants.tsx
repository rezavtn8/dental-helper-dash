import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Mail, 
  Trash2, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Assistant {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  email_status: string;
}

const AdminAssistants = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'owner') {
      fetchData();
    }
  }, [userProfile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch assistants
      const { data: assistantsData, error: assistantsError } = await supabase
        .from('users')
        .select('*')
        .eq('clinic_id', userProfile?.clinic_id)
        .eq('role', 'assistant');

      if (assistantsError) throw assistantsError;

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('clinic_id', userProfile?.clinic_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      setAssistants(assistantsData || []);
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assistants and invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setInviting(true);

      // Create invitation record first
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          clinic_id: userProfile?.clinic_id,
          email: inviteEmail.trim(),
          role: 'assistant',
          invited_by: userProfile?.id
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Generate Supabase magic link instead of signup link (no password required)
      const siteUrl = window.location.origin;
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: inviteEmail.trim(),
        options: {
          redirectTo: `${siteUrl}/auth/invite-callback?clinic_id=${userProfile?.clinic_id}&invitation_id=${invitation.id}&role=assistant`
        }
      });

      if (linkError) throw linkError;

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitationId: invitation.id,
          email: inviteEmail.trim(),
          magicLinkUrl: linkData.properties.action_link,
          clinicName: 'Your Clinic' // You might want to fetch this from clinic data
        }
      });

      if (emailError) throw emailError;

      toast.success('Invitation sent successfully!');
      setInviteEmail('');
      setShowInviteDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      // Generate new magic link
      const siteUrl = window.location.origin;
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${siteUrl}/auth/invite-callback?clinic_id=${userProfile?.clinic_id}&invitation_id=${invitationId}&role=assistant`
        }
      });

      if (linkError) throw linkError;

      // Resend email
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitationId: invitationId,
          email: email,
          magicLinkUrl: linkData.properties.action_link,
          clinicName: 'Your Clinic',
          isResend: true
        }
      });

      if (emailError) throw emailError;

      toast.success('Invitation resent successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast.error(error.message || 'Failed to resend invitation');
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Invitation revoked successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error revoking invitation:', error);
      toast.error(error.message || 'Failed to revoke invitation');
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assistants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/owner')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Manage Assistants</h1>
              <p className="text-muted-foreground">Invite and manage your dental assistants</p>
            </div>
          </div>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Assistant
          </Button>
        </div>

        {/* Current Assistants */}
        <Card>
          <CardHeader>
            <CardTitle>Current Assistants</CardTitle>
            <CardDescription>
              Active members of your dental practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assistants.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No assistants yet. Send your first invitation to get started.
              </p>
            ) : (
              <div className="grid gap-4">
                {assistants.map((assistant) => (
                  <div key={assistant.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(assistant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{assistant.name}</h3>
                      <p className="text-sm text-muted-foreground">{assistant.email}</p>
                    </div>
                    <Badge variant={assistant.is_active ? 'secondary' : 'outline'}>
                      {assistant.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDate(assistant.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations waiting for acceptance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pending invitations
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>{formatDate(invitation.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isExpired(invitation.expires_at) ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span className="text-destructive">Expired</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(invitation.expires_at)}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={invitation.email_status === 'sent' ? 'secondary' : 'outline'}>
                          {invitation.email_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Resend
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeInvitation(invitation.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Assistant</DialogTitle>
            <DialogDescription>
              Send an invitation to join your dental practice as an assistant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="assistant@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAssistants;