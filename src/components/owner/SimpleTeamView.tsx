import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import InviteDialog from '../InviteDialog';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export default function SimpleTeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { userProfile, getInvitations } = useAuth();

  useEffect(() => {
    if (userProfile?.clinic_id) {
      fetchData();
    }
  }, [userProfile?.clinic_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch team members
      const { data: membersData, error: membersError } = await supabase
        .from('users')
        .select('*')
        .eq('clinic_id', userProfile?.clinic_id)
        .eq('is_active', true);

      if (membersError) {
        console.error('Error fetching members:', membersError);
      } else {
        setMembers(membersData || []);
      }

      // Fetch pending invitations
      const { invitations: invitationData, error: invitationError } = await getInvitations();
      if (invitationError) {
        console.error('Error fetching invitations:', invitationError);
      } else {
        setInvitations(invitationData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Team</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team ({members.length + invitations.length})</h3>
        <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Members */}
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar>
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">{member.name}</h4>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                {member.role}
              </Badge>
            </CardContent>
          </Card>
        ))}

        {/* Pending Invitations */}
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="border-dashed">
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="opacity-50">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium text-muted-foreground">Pending</h4>
                <p className="text-sm text-muted-foreground">{invitation.email}</p>
              </div>
              <Badge variant="outline">Invited</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && invitations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your team by inviting assistants to join your clinic.
            </p>
            <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Invite First Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <InviteDialog
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onInviteSent={() => {
          setShowInviteDialog(false);
          fetchData();
        }}
      />
    </div>
  );
}