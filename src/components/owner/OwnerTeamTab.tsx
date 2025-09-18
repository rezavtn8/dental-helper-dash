import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Mail,
  Calendar,
  User,
  Clock,
  UserX,
  UserCheck,
  Settings
} from 'lucide-react';
import RoleManagementDialog from './RoleManagementDialog';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  is_active: boolean;
  created_at: string;
  last_login?: string;
  clinic_id?: string;
}

interface JoinRequest {
  id: string;
  user_id: string;
  clinic_id: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'denied';
  user_email: string;
  user_name: string;
}

interface OwnerTeamTabProps {
  clinicId: string;
}

export default function OwnerTeamTab({ clinicId }: OwnerTeamTabProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; member: TeamMember | null }>({
    open: false,
    member: null
  });
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; member: TeamMember | null }>({
    open: false,
    member: null
  });

  useEffect(() => {
    if (clinicId) {
      fetchData();
    }
  }, [clinicId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch team members directly with email included
      const { data: membersData, error: membersError } = await supabase
        .from('users')
        .select('id, name, email, role, is_active, created_at, last_login')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (membersError) throw membersError;
      
      // Fetch user roles for each member
      const memberIds = membersData?.map(m => m.id) || [];
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', memberIds)
        .eq('is_active', true);

      // Combine members with their additional roles
      const membersWithRoles = (membersData || []).map(member => {
        const additionalRoles = userRoles?.filter(ur => ur.user_id === member.id).map(ur => ur.role) || [];
        const allRoles = member.role ? [member.role, ...additionalRoles.filter(r => r !== member.role)] : additionalRoles;
        
        return {
          ...member,
          roles: allRoles,
          clinic_id: clinicId
        };
      });
      
      setTeamMembers(membersWithRoles);

      // Fetch pending join requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (requestsData && requestsData.length > 0) {
        // Get user info for each request
        const userIds = requestsData.map(req => req.user_id);
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', userIds);

        if (usersError) throw usersError;

        // Combine data
        const formattedRequests = requestsData.map(request => {
          const user = usersData?.find(u => u.id === request.user_id);
          return {
            ...request,
            user_email: user?.email || 'Unknown',
            user_name: user?.name || 'Unknown User'
          } as JoinRequest;
        });

        setJoinRequests(formattedRequests);
      } else {
        setJoinRequests([]);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request: JoinRequest) => {
    setProcessingRequest(request.id);
    
    try {
      const { data, error } = await supabase.rpc('process_join_request', {
        p_request_id: request.id,
        p_action: 'approve'
      });

      if (error) throw error;

      const result = data[0];
      if (result.success) {
        toast.success(`${request.user_name} has been approved and added to your team`);
        fetchData();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDenyRequest = async (request: JoinRequest) => {
    setProcessingRequest(request.id);
    
    try {
      const { data, error } = await supabase.rpc('process_join_request', {
        p_request_id: request.id,
        p_action: 'deny',
        p_denial_reason: 'Request denied by clinic owner'
      });

      if (error) throw error;

      const result = data[0];
      if (result.success) {
        toast.success(`Request from ${request.user_name} has been denied`);
        fetchData();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeactivateMember = async (member: TeamMember) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', member.id);

      if (error) throw error;

      toast.success(`${member.name} has been deactivated`);
      fetchData();
    } catch (error) {
      console.error('Error deactivating member:', error);
      toast.error('Failed to deactivate member');
    }
  };

  const handleReactivateMember = async (member: TeamMember) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', member.id);

      if (error) throw error;

      toast.success(`${member.name} has been reactivated`);
      fetchData();
    } catch (error) {
      console.error('Error reactivating member:', error);
      toast.error('Failed to reactivate member');
    }
  };

  const handleRemoveMember = async () => {
    if (!removeDialog.member) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          clinic_id: null
        })
        .eq('id', removeDialog.member.id);

      if (error) throw error;

      toast.success(`${removeDialog.member.name} has been removed from your team`);
      setRemoveDialog({ open: false, member: null });
      fetchData();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.is_active) ||
                         (statusFilter === 'inactive' && !member.is_active);

    return matchesSearch && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: { variant: 'default' as const, color: 'bg-blue-600' },
      admin: { variant: 'secondary' as const, color: 'bg-purple-600' },
      assistant: { variant: 'outline' as const, color: 'bg-blue-600' },
      front_desk: { variant: 'secondary' as const, color: 'bg-green-600' }
    };
    
    return variants[role as keyof typeof variants] || variants.assistant;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading team...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests Alert */}
      {joinRequests.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">
                  {joinRequests.length} pending join request{joinRequests.length !== 1 ? 's' : ''}
                </span>
                <span className="ml-2">
                  Review and approve assistants wanting to join your clinic.
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Requests Section */}
      {joinRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Pending Join Requests
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {joinRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ellipsis overflow-hidden" title={request.user_name}>{request.user_name || 'Unknown User'}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {request.user_email}
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        {new Date(request.requested_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(request)}
                      disabled={processingRequest === request.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {processingRequest === request.id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDenyRequest(request)}
                      disabled={processingRequest === request.id}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Team Members
                <Badge variant="secondary">{filteredMembers.length}</Badge>
              </CardTitle>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined On</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Team Members Found</h3>
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your filters or search term.'
                            : 'Share your clinic code with assistants to have them join your team.'
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium block text-ellipsis overflow-hidden" title={member.name}>{member.name || 'Unknown Member'}</span>
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(member.roles || [member.role]).filter(Boolean).map(role => (
                          <Badge 
                            key={role}
                            variant={getRoleBadge(role).variant}
                            className="capitalize text-xs"
                          >
                            {role === 'front_desk' ? 'Front Desk' : role}
                          </Badge>
                        ))}
                        {(member.roles || []).length > 1 && (
                          <Badge variant="secondary" className="text-xs bg-yellow-50 text-yellow-700">
                            Multi-role
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.is_active ? 'default' : 'secondary'}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(member.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.last_login ? (
                        new Date(member.last_login).toLocaleDateString()
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.role !== 'owner' && (
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRoleDialog({ open: true, member })}
                            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          {member.is_active ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeactivateMember(member)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                title="Deactivate member (they can be reactivated later)"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRemoveDialog({ open: true, member })}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Remove member from clinic permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReactivateMember(member)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Reactivate member"
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      <Dialog open={removeDialog.open} onOpenChange={(open) => {
        if (!open) setRemoveDialog({ open: false, member: null });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {removeDialog.member?.name} from your clinic? 
              This will deactivate their account and remove their clinic access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setRemoveDialog({ open: false, member: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <RoleManagementDialog
        open={roleDialog.open}
        onOpenChange={(open) => {
          if (!open) setRoleDialog({ open: false, member: null });
        }}
        member={roleDialog.member}
        onUpdate={fetchData}
      />
    </div>
  );
}