import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  last_login?: string;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export default function SimpleTeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.clinic_id) {
      fetchData();
    }
  }, [userProfile?.clinic_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use the new secure function that protects user privacy
      const { data: membersData, error: membersError } = await supabase.rpc('get_team_members_safe');

      if (membersError) {
        console.error('Error fetching members:', membersError);
      } else {
        setMembers(membersData || []);
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
        <h3 className="text-lg font-semibold">Team ({members.length})</h3>
        <div className="text-sm text-muted-foreground">
          Share clinic code with assistants to join
        </div>
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
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(member.created_at || '').toLocaleDateString()}
                </p>
              </div>
              <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                {member.role}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">
              Share your clinic code with assistants to have them join your team.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}