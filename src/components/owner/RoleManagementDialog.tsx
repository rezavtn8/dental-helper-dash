import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Shield, Users, UserCheck } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  is_active?: boolean;
  clinic_id?: string;
}

interface RoleManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onUpdate: () => void;
}

const AVAILABLE_ROLES = [
  {
    id: 'assistant',
    label: 'Assistant',
    description: 'Can view and complete tasks assigned to assistants',
    icon: UserCheck,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
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

export default function RoleManagementDialog({ open, onOpenChange, member, onUpdate }: RoleManagementDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member && open) {
      // Initialize with current roles
      const currentRoles = member.roles || (member.role ? [member.role] : []);
      setSelectedRoles(currentRoles);
    }
  }, [member, open]);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!member || selectedRoles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    setLoading(true);
    try {
      // Update primary role in users table (use first selected role)
      const primaryRole = selectedRoles[0];
      const { error: userError } = await supabase
        .from('users')
        .update({ role: primaryRole })
        .eq('id', member.id);

      if (userError) throw userError;

      // Clear existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', member.id);

      if (deleteError) throw deleteError;

      // Insert new roles
      if (selectedRoles.length > 0) {
        const rolesToInsert = selectedRoles.map(role => ({
          user_id: member.id,
          clinic_id: member.clinic_id || null,
          role: role,
          is_active: true
        }));

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert);

        if (insertError) throw insertError;
      }

      toast.success(`Roles updated successfully for ${member.name}`);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating roles:', error);
      toast.error('Failed to update roles');
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Manage Roles for {member.name}
          </DialogTitle>
          <DialogDescription>
            Select the roles this team member should have. Members can have multiple roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current roles display */}
          <div>
            <Label className="text-sm font-medium">Current Roles:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(member.roles || [member.role]).filter(Boolean).map(role => (
                <Badge key={role} variant="outline" className="capitalize">
                  {role.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Role selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select New Roles:</Label>
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
              Please select at least one role for this team member.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || selectedRoles.length === 0}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}