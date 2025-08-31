import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  MoreVertical,
  UserPlus,
  Shield,
  User,
  Mail,
  Calendar,
  UserMinus,
  Trash2,
  RefreshCw,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  type: 'member';
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  email_status: string;
  created_at: string;
  expires_at: string;
  email_sent_at?: string;
  resend_count: number;
  failure_reason?: string;
  token?: string;
  type: 'invitation';
}

type TeamItem = TeamMember | PendingInvitation;

interface UnifiedTeamViewProps {
  assistants: TeamMember[];
  tasks: any[];
  onTeamUpdate: () => void;
}

const getInitials = (identifier: string): string => {
  return identifier
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusBadge = (item: TeamItem) => {
  if (item.type === 'member') {
    return (
      <Badge variant={item.is_active ? 'default' : 'destructive'}>
        {item.is_active ? 'Active' : 'Inactive'}
      </Badge>
    );
  } else {
    const invitation = item as PendingInvitation;
    const isExpired = new Date(invitation.expires_at) < new Date();
    
    if (invitation.status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (isExpired) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Expired</Badge>;
    }
    if (invitation.email_status === 'failed') {
      return <Badge variant="destructive">Email Failed</Badge>;
    }
    if (invitation.email_status === 'sent') {
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Pending</Badge>;
    }
    return <Badge variant="outline" className="text-gray-600 border-gray-600">Sending...</Badge>;
  }
};

const getStatusIcon = (item: TeamItem) => {
  if (item.type === 'member') {
    return item.is_active ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />;
  } else {
    const invitation = item as PendingInvitation;
    const isExpired = new Date(invitation.expires_at) < new Date();
    
    if (invitation.status === 'cancelled') return <XCircle className="w-4 h-4 text-red-600" />;
    if (isExpired) return <Clock className="w-4 h-4 text-orange-600" />;
    if (invitation.email_status === 'failed') return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (invitation.email_status === 'sent') return <Clock className="w-4 h-4 text-blue-600" />;
    return <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" />;
  }
};

export default function UnifiedTeamView({ assistants, tasks, onTeamUpdate }: UnifiedTeamViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: TeamItem | null }>({
    open: false,
    item: null
  });

  const { userProfile } = useAuth();

  const fetchInvitations = async () => {
    // Since we're moving to clinic codes, we don't need to fetch invitations anymore
    setInvitations([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Combine team members and invitations
  const allItems: TeamItem[] = [
    ...assistants.map(assistant => ({ ...assistant, type: 'member' as const })),
    ...invitations
  ];

  const filteredItems = allItems.filter(item => {
    const searchString = searchTerm.toLowerCase();
    if (item.type === 'member') {
      return item.name.toLowerCase().includes(searchString) || 
             item.email.toLowerCase().includes(searchString);
    } else {
      return item.email.toLowerCase().includes(searchString);
    }
  });

  const getTasksAssignedTo = (assistantId: string) => {
    return tasks.filter(task => task.assigned_to === assistantId);
  };

  const handleToggleActive = async (assistant: TeamMember) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: !assistant.is_active })
        .eq('id', assistant.id)
        .select();

      if (error) throw error;

      toast.success(`${assistant.name} has been ${assistant.is_active ? 'deactivated' : 'activated'}`);

      onTeamUpdate();
    } catch (error) {
      toast.error("Failed to update assistant status. Please try again.");
    }
  };

  const handleDeleteMember = async (assistant: TeamMember) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', assistant.id);

      if (error) throw error;

      toast.success(`${assistant.name} has been removed from your team`);

      onTeamUpdate();
      setDeleteDialog({ open: false, item: null });
    } catch (error) {
      toast.error("Failed to delete assistant. Please try again.");
    }
  };

  const handleResendInvitation = async (invitation: PendingInvitation) => {
    try {
      // Simple resend - just update the expiry date
      const { error } = await supabase
        .from('invitations')
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          resend_count: invitation.resend_count + 1,
          email_status: 'pending'
        })
        .eq('id', invitation.id);

      if (error) throw error;

      toast.success(`Invitation resent to ${invitation.email}`);
      fetchInvitations();
    } catch (error) {
      toast.error("Failed to resend invitation. Please try again.");
    }
  };

  const handleCancelInvitation = async (invitation: PendingInvitation) => {
    try {
      console.log('Cancelling invitation:', invitation.id);
      
      const { error } = await supabase
        .from('invitations')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (error) {
        console.error('Database error cancelling invitation:', error);
        throw error;
      }

      console.log('Invitation cancelled successfully');
      toast.success(`Invitation to ${invitation.email} has been cancelled`);
      
      // Refresh the data
      await fetchInvitations();
      setDeleteDialog({ open: false, item: null });
    } catch (error: any) {
      console.error('Failed to cancel invitation:', error);
      toast.error(`Failed to cancel invitation: ${error.message || 'Please try again.'}`);
    }
  };

  const activeMembers = assistants.filter(a => a.is_active).length;
  const pendingInvitations = invitations.filter(i => i.status === 'pending' && new Date(i.expires_at) > new Date()).length;
  const adminMembers = assistants.filter(a => a.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage your practice team members</p>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Share clinic code to add assistants
        </div>
      </div>

      {/* Search */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search team members and invitations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{assistants.length}</p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeMembers}</p>
                <p className="text-sm text-gray-600">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingInvitations}</p>
                <p className="text-sm text-gray-600">Pending Invitations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{adminMembers}</p>
                <p className="text-sm text-gray-600">Admin Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Items */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Team Overview ({filteredItems.length})
        </h3>
        
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No results found' : 'No team members yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "Try adjusting your search terms."
                  : "Share your clinic code with assistants to have them join your team."
                }
              </p>
              {!searchTerm && (
                <div className="text-sm text-muted-foreground">
                  Assistants can join using your clinic code
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const isInvitation = item.type === 'invitation';
              const invitation = item as PendingInvitation;
              const member = item as TeamMember;
              
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className={`font-medium ${
                            isInvitation 
                              ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' 
                              : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                          }`}>
                            {getInitials(isInvitation ? invitation.email : member.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {isInvitation ? invitation.email.split('@')[0] : member.name}
                            {getStatusIcon(item)}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant={item.role === 'admin' ? 'default' : 'secondary'}
                              className={item.role === 'admin' 
                                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white' 
                                : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {item.role === 'admin' ? 'Admin' : 'Assistant'}
                            </Badge>
                            {getStatusBadge(item)}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isInvitation ? (
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog({ open: true, item: invitation })}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel Invitation
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => handleToggleActive(member)}>
                                {member.is_active ? (
                                  <>
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, item: member })}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-3">
                    {/* Contact Info */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{item.email}</span>
                    </div>
                    
                    {/* Date Info */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{isInvitation ? `Invited ${formatDate(invitation.created_at)}` : `Joined ${formatDate(member.created_at)}`}</span>
                    </div>
                    
                    {isInvitation ? (
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Expires:</span>
                          <span className="text-xs text-gray-500">{formatDate(invitation.expires_at)}</span>
                        </div>
                        {invitation.email_status === 'failed' && invitation.failure_reason && (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {invitation.failure_reason}
                          </div>
                        )}
                         {invitation.resend_count > 0 && (
                           <div className="text-xs text-gray-500 flex items-center gap-1">
                             Resent {invitation.resend_count} time{invitation.resend_count > 1 ? 's' : ''}
                             {invitation.resend_count >= 3 && (
                               <AlertTriangle className="h-3 w-3 text-yellow-500" />
                             )}
                           </div>
                         )}
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Active Tasks:</span>
                          <Badge variant="outline" className="text-xs">
                            {getTasksAssignedTo(member.id).filter(task => 
                              !['completed', 'done'].includes(task.status?.toLowerCase())
                            ).length} / {getTasksAssignedTo(member.id).length}
                          </Badge>
                        </div>
                        
                        {member.last_login && (
                          <div className="text-xs text-gray-500 mt-2">
                            Last login: {formatDate(member.last_login)}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.item?.type === 'invitation' ? 'Cancel Invitation' : 'Delete Team Member'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.item?.type === 'invitation' 
                ? `Are you sure you want to cancel the invitation to ${(deleteDialog.item as PendingInvitation).email}? They will no longer be able to accept this invitation.`
                : `Are you sure you want to delete ${(deleteDialog.item as TeamMember)?.name}? This action cannot be undone. All tasks assigned to this member will become unassigned.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.item?.type === 'invitation') {
                  handleCancelInvitation(deleteDialog.item as PendingInvitation);
                } else if (deleteDialog.item?.type === 'member') {
                  handleDeleteMember(deleteDialog.item as TeamMember);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDialog.item?.type === 'invitation' ? 'Cancel Invitation' : 'Delete Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}