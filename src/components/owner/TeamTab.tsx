import { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Assistant {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface TeamTabProps {
  assistants: Assistant[];
  tasks: any[];
  onTeamUpdate: () => void;
}

const getInitials = (name: string): string => {
  return name
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

export default function TeamTab({ assistants, tasks, onTeamUpdate }: TeamTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; assistant: Assistant | null }>({
    open: false,
    assistant: null
  });

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTasksAssignedTo = (assistantId: string) => {
    return tasks.filter(task => task.assigned_to === assistantId);
  };


  const handleToggleActive = async (assistant: Assistant) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: !assistant.is_active })
        .eq('id', assistant.id)
        .select();

      if (error) {
        console.error('Toggle status error:', error);
        throw error;
      }

      toast.success(`${assistant.name} has been ${assistant.is_active ? 'deactivated' : 'activated'}`);

      onTeamUpdate();
    } catch (error) {
      console.error('Failed to update assistant status:', error);
      toast.error("Failed to update assistant status. Please try again.");
    }
  };

  const handleDeleteAssistant = async (assistant: Assistant) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', assistant.id);

      if (error) throw error;

      toast.success(`${assistant.name} has been removed from your team`);

      onTeamUpdate();
      setDeleteDialog({ open: false, assistant: null });
    } catch (error) {
      toast.error("Failed to delete assistant. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team</h2>
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
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{assistants.length}</p>
                <p className="text-sm text-gray-600">Total Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {assistants.filter(a => a.is_active).length}
                </p>
                <p className="text-sm text-gray-600">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {assistants.filter(a => a.role === 'admin').length}
                </p>
                <p className="text-sm text-gray-600">Admin Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Team Members ({filteredAssistants.length})
        </h3>
        
        {filteredAssistants.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No members found' : 'No team members yet'}
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
            {filteredAssistants.map((assistant) => {
              const assignedTasks = getTasksAssignedTo(assistant.id);
              const activeTasks = assignedTasks.filter(task => 
                !['completed', 'done'].includes(task.status?.toLowerCase())
              ).length;

              return (
                <Card key={assistant.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white font-medium">
                            {getInitials(assistant.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{assistant.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant={assistant.role === 'admin' ? 'default' : 'secondary'}
                              className={assistant.role === 'admin' 
                                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white' 
                                : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {assistant.role === 'admin' ? 'Admin' : 'Assistant'}
                            </Badge>
                            {!assistant.is_active && (
                              <Badge variant="destructive" className="text-xs">
                                Inactive
                              </Badge>
                            )}
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
                          <DropdownMenuItem onClick={() => handleToggleActive(assistant)}>
                            {assistant.is_active ? (
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
                            onClick={() => setDeleteDialog({ open: true, assistant })}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-3">
                    {/* Contact Info */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{assistant.email}</span>
                    </div>
                    
                    {/* Join Date */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Joined {formatDate(assistant.created_at)}</span>
                    </div>
                    
                    {/* Task Stats */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Active Tasks:</span>
                        <Badge variant="outline" className="text-xs">
                          {activeTasks} / {assignedTasks.length}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Last Login */}
                    {assistant.last_login && (
                      <div className="text-xs text-gray-500">
                        Last login: {formatDate(assistant.last_login)}
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
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.assistant?.name}? This action cannot be undone.
              All tasks assigned to this member will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.assistant && handleDeleteAssistant(deleteDialog.assistant)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}