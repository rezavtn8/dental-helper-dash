import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  ArrowLeft,
  Ban
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'failed' | 'revoked';
  created_at: string;
  expires_at?: string;
  resend_count?: number;
  type: 'assistant' | 'invitation';
  is_active?: boolean;
}

const AdminAssistants = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    admins: 0
  });

  useEffect(() => {
    if (userProfile?.role === 'owner') {
      fetchData();
    }
  }, [userProfile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch assistants and admins
      const { data: assistantsData, error: assistantsError } = await supabase
        .from('users')
        .select('*')
        .eq('clinic_id', userProfile?.clinic_id)
        .in('role', ['assistant', 'admin']);

      if (assistantsError) throw assistantsError;

      // Fetch all invitations (not just pending)
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('clinic_id', userProfile?.clinic_id)
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      // Combine data into team members array
      const members: TeamMember[] = [
        ...(assistantsData || []).map(assistant => ({
          id: assistant.id,
          name: assistant.name,
          email: assistant.email,
          role: assistant.role,
          status: assistant.is_active ? 'active' as const : 'pending' as const,
          created_at: assistant.created_at,
          type: 'assistant' as const,
          is_active: assistant.is_active
        })),
        ...(invitationsData || []).map(invitation => ({
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status === 'accepted' ? 'active' as const : 
                 invitation.status === 'revoked' ? 'revoked' as const :
                 invitation.email_status === 'failed' ? 'failed' as const : 'pending' as const,
          created_at: invitation.created_at,
          expires_at: invitation.expires_at,
          resend_count: invitation.resend_count || 0,
          type: 'invitation' as const
        }))
      ];

      // Calculate stats
      const totalMembers = members.filter(m => m.type === 'assistant').length;
      const activeMembers = members.filter(m => m.type === 'assistant' && m.status === 'active').length;
      const pendingInvites = members.filter(m => m.type === 'invitation' && m.status === 'pending').length;
      const adminMembers = members.filter(m => m.type === 'assistant' && m.role === 'admin').length;

      setStats({
        total: totalMembers,
        active: activeMembers,
        pending: pendingInvites,
        admins: adminMembers
      });

      setTeamMembers(members.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load team data');
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

      // Generate Supabase signup link with metadata  
      const siteUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' // Replace with actual production URL
        : window.location.origin;
        
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: inviteEmail.trim(),
        options: {
          redirectTo: `${siteUrl}/auth/invite-callback`,
          data: {
            role: 'assistant',
            clinic_id: userProfile?.clinic_id,
            invitation_id: invitation.id
          }
        }
      });

      if (linkError) throw linkError;

      // Update invitation with action_link (expires in 7 days by default)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          action_link: linkData.properties.action_link,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitationId: invitation.id,
          email: inviteEmail.trim(),
          actionLinkUrl: linkData.properties.action_link,
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

  const handleResendInvitation = async (invitationId: string, email: string, currentResendCount: number) => {
    if (currentResendCount >= 3) {
      toast.error('Maximum resend limit (3) reached for this invitation');
      return;
    }

    try {
      // Generate new signup link with metadata
      const siteUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' // Replace with actual production URL
        : window.location.origin;
        
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${siteUrl}/auth/invite-callback`,
          data: {
            role: 'assistant',
            clinic_id: userProfile?.clinic_id,
            invitation_id: invitationId
          }
        }
      });

      if (linkError) throw linkError;

      // Update resend count and new action_link (expires in 7 days by default)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ 
          resend_count: currentResendCount + 1,
          action_link: linkData.properties.action_link,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Resend email
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitationId: invitationId,
          email: email,
          actionLinkUrl: linkData.properties.action_link,
          clinicName: 'Your Clinic',
          isResend: true
        }
      });

      if (emailError) throw emailError;

      toast.success(`Invitation resent successfully! (${currentResendCount + 1}/3)`);
      fetchData();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast.error(error.message || 'Failed to resend invitation');
    }
  };

  const handleDeleteInvitation = async (invitationId: string, email: string) => {
    try {
      // First, try to delete any unaccepted auth user for this email
      const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
      if (!listError && authUsers?.users) {
        const unacceptedUser = authUsers.users.find((user: any) => 
          user.email === email && 
          !user.email_confirmed_at && 
          !user.last_sign_in_at
        );
        
        if (unacceptedUser) {
          await supabase.auth.admin.deleteUser(unacceptedUser.id);
        }
      }

      // Delete the invitation
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Invitation deleted successfully. Email can now be reused.');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast.error(error.message || 'Failed to delete invitation');
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt?: string): boolean => {
    return expiresAt ? new Date(expiresAt) < new Date() : false;
  };

  const getStatusBadge = (member: TeamMember) => {
    if (member.type === 'invitation' && member.expires_at && isExpired(member.expires_at)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    switch (member.status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Active</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'revoked':
        return <Badge variant="outline" className="text-muted-foreground">Revoked</Badge>;
      default:
        return <Badge variant="outline">{member.status}</Badge>;
    }
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
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/owner')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
              <p className="text-muted-foreground">Manage your dental practice team</p>
            </div>
          </div>
          <Button onClick={() => setShowInviteDialog(true)} className="bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Team Overview</CardTitle>
            <CardDescription>
              All team members and pending invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No team members yet</p>
                <p className="text-muted-foreground">Send your first invitation to get started</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="font-semibold text-foreground">Name</TableHead>
                      <TableHead className="font-semibold text-foreground">Email</TableHead>
                      <TableHead className="font-semibold text-foreground">Role</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Invited On</TableHead>
                      <TableHead className="font-semibold text-foreground">Expires On</TableHead>
                      <TableHead className="font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">
                          {member.name || '-'}
                        </TableCell>
                        <TableCell className="text-foreground">{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(member)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(member.created_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.expires_at ? (
                            <div className="flex items-center gap-2">
                              {isExpired(member.expires_at) ? (
                                <>
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                  <span className="text-destructive">Expired</span>
                                </>
                              ) : (
                                formatDate(member.expires_at)
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {member.type === 'invitation' && member.status !== 'revoked' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResendInvitation(member.id, member.email, member.resend_count || 0)}
                                disabled={(member.resend_count || 0) >= 3}
                                className="border-border hover:bg-muted"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Resend {member.resend_count ? `(${member.resend_count}/3)` : ''}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRevokeInvitation(member.id)}
                                className="border-border hover:bg-muted"
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                Revoke
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteInvitation(member.id, member.email)}
                                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          )}
                          {member.type === 'assistant' && (
                            <span className="text-muted-foreground text-sm">No actions</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Invite New Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your dental practice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="border-border bg-background text-foreground"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="border-border">
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviting} className="bg-primary hover:bg-primary/90">
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