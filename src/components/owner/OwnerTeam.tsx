import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  UserPlus,
  BarChart3,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface Task {
  id: string;
  assigned_to: string | null;
  status: string;
  completed_at?: string;
}

interface OwnerTeamProps {
  assistants: TeamMember[];
  tasks: Task[];
  onTeamUpdate: () => void;
}

const OwnerTeam: React.FC<OwnerTeamProps> = ({ assistants, tasks, onTeamUpdate }) => {
  const [teamStats, setTeamStats] = useState<Record<string, { completed: number; pending: number; total: number }>>({});

  useEffect(() => {
    calculateTeamStats();
  }, [tasks, assistants]);

  const calculateTeamStats = () => {
    const stats: Record<string, { completed: number; pending: number; total: number }> = {};
    
    assistants.forEach(assistant => {
      const assignedTasks = tasks.filter(task => task.assigned_to === assistant.id);
      const completedTasks = assignedTasks.filter(task => task.status === 'Done');
      const pendingTasks = assignedTasks.filter(task => task.status !== 'Done');
      
      stats[assistant.id] = {
        completed: completedTasks.length,
        pending: pendingTasks.length,
        total: assignedTasks.length
      };
    });

    setTeamStats(stats);
  };

  const getCompletionRate = (assistantId: string): number => {
    const stats = teamStats[assistantId];
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastLogin = (lastLogin?: string): string => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.length}</div>
            <p className="text-xs text-muted-foreground">
              {assistants.filter(a => a.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallCompletionRate}%</div>
            <Progress value={overallCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks - completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Member Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No team members yet. Add your first team member to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          assistants.map((member) => {
            const stats = teamStats[member.id] || { completed: 0, pending: 0, total: 0 };
            const completionRate = getCompletionRate(member.id);
            
            return (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant={member.is_active ? 'secondary' : 'outline'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                      <div className="text-xs text-muted-foreground">Done</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{stats.pending}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Last login: {formatLastLogin(member.last_login)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OwnerTeam;