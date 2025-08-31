import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Trash2, 
  RefreshCw, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Copy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  type: 'user' | 'invitation';
  created_at: string;
  expires_at?: string;
  last_login?: string;
  resend_count?: number;
  email_status?: string;
}

export function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    admins: 0,
    assistants: 0
  });
  
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.clinic_id) {
      fetchTeamData();
    }
  }, [userProfile?.clinic_id]);

  const fetchTeamData = async () => {
    if (!userProfile?.clinic_id) return;

    try {
      setLoading(true);

      // Fetch active team members
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role, created_at, last_login, is_active')
        .eq('clinic_id', userProfile.clinic_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch pending invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from('invitations')
        .select('id, email, role, status, created_at, expires_at, resend_count, email_status')
        .eq('clinic_id', userProfile.clinic_id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      // Combine and format data
      const combinedData: TeamMember[] = [
        ...(users || []).map(user => ({
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email || '',
          role: user.role || 'assistant',
          status: 'active',
          type: 'user' as const,
          created_at: user.created_at,
          last_login: user.last_login
        })),
        ...(invitations || []).map(invite => ({
          id: invite.id,
          name: invite.email.split('@')[0],
          email: invite.email,
          role: invite.role,
          status: 'pending',
          type: 'invitation' as const,
          created_at: invite.created_at,
          expires_at: invite.expires_at,
          resend_count: invite.resend_count || 0,
          email_status: invite.email_status
        }))
      ];

      setTeamMembers(combinedData);

      // Calculate stats
      const activeUsers = users?.length || 0;
      const pendingInvites = invitations?.length || 0;
      const admins = combinedData.filter(m => m.role === 'admin').length;
      const assistants = combinedData.filter(m => m.role === 'assistant').length;

      setStats({
        total: activeUsers + pendingInvites,
        active: activeUsers,
        pending: pendingInvites,
        admins,
        assistants
      });

    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          invitationId,
          recipientEmail: email,
          recipientName: email.split('@')[0],
          senderName: userProfile?.name || 'Team Admin',
          clinicName: 'Your Clinic', // You might want to fetch this
          role: 'assistant',
          joinUrl: `${window.location.origin}/join?token=PLACEHOLDER`
        }
      });

      if (error) throw error;

      toast.success('Invitation resent successfully!');
      fetchTeamData(); // Refresh data
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Invitation cancelled');
      fetchTeamData(); // Refresh data
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const copyInvitationLink = async (member: TeamMember) => {
    // Get the invitation token
    const { data: invitation } = await supabase
      .from('invitations')
      .select('token')
      .eq('id', member.id)
      .single();

    if (invitation?.token) {
      const link = `${window.location.origin}/join?token=${invitation.token}`;
      try {
        await navigator.clipboard.writeText(link);
        toast.success('Invitation link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const getStatusBadge = (member: TeamMember) => {
    if (member.type === 'user') {
      return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>;
    }

    if (member.email_status === 'failed') {
      return <Badge variant="destructive">Email Failed</Badge>;
    }

    return <Badge variant="secondary">Pending Invitation</Badge>;
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 24 && hoursUntilExpiry > 0;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading team data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-semibold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs text-muted-foreground">Assistants</p>
                <p className="text-lg font-semibold">{stats.assistants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs text-muted-foreground">Admins</p>
                <p className="text-lg font-semibold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members & Invitations
          </CardTitle>
          <Button disabled>
            <UserPlus className="h-4 w-4 mr-2" />
            Share Clinic Code
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No team members yet</p>
                        <Button 
                          variant="outline" 
                          disabled
                        >
                          Share clinic code to add members
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{member.name}</span>
                          {member.type === 'invitation' && isExpiringSoon(member.expires_at) && (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(member)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(member.created_at)}
                        {member.last_login && member.type === 'user' && (
                          <div className="text-xs">
                            Last: {formatDate(member.last_login)}
                          </div>
                        )}
                        {member.expires_at && member.type === 'invitation' && (
                          <div className="text-xs">
                            Expires: {formatDate(member.expires_at)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.type === 'invitation' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => copyInvitationLink(member)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResendInvitation(member.id, member.email)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Email
                                {member.resend_count && member.resend_count > 0 && (
                                  <span className="ml-1 text-xs">({member.resend_count})</span>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleCancelInvitation(member.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}