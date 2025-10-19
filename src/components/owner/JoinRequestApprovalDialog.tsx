import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserCheck, Users, Shield, User } from 'lucide-react';

interface JoinRequest {
  id: string;
  user_id: string;
  clinic_id: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'denied';
  user_email: string;
  user_name: string;
}

interface JoinRequestApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: JoinRequest | null;
  onUpdate: () => void;
}

const AVAILABLE_ROLES = [
  {
    id: 'assistant',
    label: 'Assistant',
    description: 'Can view and complete tasks assigned to assistants',
    icon: UserCheck,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    recommended: true
  },
  {
    id: 'front_desk',
    label: 'Front Desk',
    description: 'Can manage front desk tasks and patient check-ins',
    icon: Users,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Can manage team settings and advanced features',
    icon: Shield,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  }
];

export default function JoinRequestApprovalDialog({ open, onOpenChange, request, onUpdate }: JoinRequestApprovalDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['assistant']); // Default to assistant
  const [loading, setLoading] = useState(false);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleApprove = async () => {
    if (!request || selectedRoles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    setLoading(true);
    try {
      // Approve the join request
      const { error: approveError } = await supabase.rpc('process_join_request', {
        p_request_id: request.id,
        p_action: 'approve'
      });

      if (approveError) throw approveError;

      // Update user's primary role (first selected role)
      const primaryRole = selectedRoles[0];
      const { error: userError } = await supabase
        .from('users')
        .update({ role: primaryRole })
        .eq('id', request.user_id);

      if (userError) throw userError;

      // Add multiple roles if more than one selected
      if (selectedRoles.length > 1) {
        const rolesToInsert = selectedRoles.map(role => ({
          user_id: request.user_id,
          clinic_id: request.clinic_id,
          role: role,
          is_active: true
        }));

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert);

        if (rolesError) throw rolesError;
      }

      // Send approval email
      const { data: clinicData } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', request.clinic_id)
        .single();

      await supabase.functions.invoke('send-join-request-email', {
        body: {
          type: 'approved',
          userName: request.user_name,
          userEmail: request.user_email,
          clinicName: clinicData?.name || 'the clinic'
        }
      });

      toast.success(`${request.user_name} has been approved with ${selectedRoles.length > 1 ? 'multiple roles' : `${selectedRoles[0]} role`}`);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Approve Join Request
          </DialogTitle>
          <DialogDescription>
            Approve {request.user_name} ({request.user_email}) and assign roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Select Roles for New Team Member:</Label>
            <p className="text-xs text-muted-foreground mt-1">
              You can assign multiple roles. The first selected role will be their primary role.
            </p>
          </div>

          <div className="space-y-3">
            {AVAILABLE_ROLES.map(role => {
              const Icon = role.icon;
              const isSelected = selectedRoles.includes(role.id);
              
              return (
                <div key={role.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={role.id}
                    checked={isSelected}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={role.id} className="text-sm font-medium cursor-pointer">
                        {role.label}
                      </Label>
                      {role.recommended && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          Recommended
                        </Badge>
                      )}
                      {isSelected && (
                        <Badge variant="outline" className={role.color}>
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedRoles.length === 0 && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              Please select at least one role for the new team member.
            </div>
          )}

          {selectedRoles.length > 1 && (
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
              <strong>Multi-role assignment:</strong> This team member will be able to switch between {selectedRoles.join(', ')} roles.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={loading || selectedRoles.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Approving...' : 'Approve & Assign Roles'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}