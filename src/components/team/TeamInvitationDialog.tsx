import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, UserPlus, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TeamInvitationDialogProps {
  open: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

export function TeamInvitationDialog({ open, onClose, onInviteSent }: TeamInvitationDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'assistant' | 'admin'>('assistant');
  const [loading, setLoading] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  
  const { userProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !name.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!userProfile?.clinic_id) {
      toast.error('Clinic information not found');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create invitation using unified function
      const { data, error } = await supabase.rpc('create_unified_invitation', {
        p_clinic_id: userProfile.clinic_id,
        p_email: email.trim(),
        p_name: name.trim(),
        p_role: role,
        p_invitation_type: 'email_signup'
      });

      if (error) {
        // Show user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes('already a member of your team')) {
          errorMessage = 'This person is already on your team! Check the Team section to see all current members.';
        } else if (error.message.includes('already registered with another clinic')) {
          errorMessage = 'This email is already registered with another clinic. Please use a different email address.';
        } else if (error.message.includes('pending invitation already exists')) {
          errorMessage = 'An invitation is already pending for this email. Check the Team section to manage existing invitations.';
        }
        toast.error(errorMessage);
        return;
      }

      const result = data[0];
      const { invitation_id, invitation_token, invitation_url } = result;

      // Get clinic name for the email
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', userProfile.clinic_id)
        .single();

      if (clinicError) {
        toast.error('Failed to fetch clinic details');
        return;
      }

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          invitationId: invitation_id,
          recipientEmail: email.trim(),
          recipientName: name.trim(),
          senderName: userProfile.name,
          clinicName: clinicData.name,
          role: role,
          joinUrl: `${window.location.origin}/join?token=${invitation_token}`
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast.warning('Invitation created successfully, but email failed to send. You can copy the link below and send it manually.');
      } else {
        toast.success('Invitation sent successfully!');
      }

      // Generate the join link
      const link = `${window.location.origin}/join?token=${invitation_token}`;
      setInvitationLink(link);
      setInvitationSent(true);
      onInviteSent();
      
    } catch (error) {
      console.error('Failed to create invitation:', error);
      toast.error('Failed to create invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      toast.success('Invitation link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const resetDialog = () => {
    setEmail('');
    setName('');
    setRole('assistant');
    setInvitationSent(false);
    setInvitationLink('');
    onClose();
  };

  if (invitationSent) {
    return (
      <Dialog open={open} onOpenChange={resetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Invitation Sent!
            </DialogTitle>
            <DialogDescription>
              {name} has been invited to join your team as {role === 'assistant' ? 'an assistant' : 'an admin'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-700 font-medium">
                        Email sent to {email}
                      </p>
                      <p className="text-xs text-green-600">
                        They'll receive instructions to join your team
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-green-800">
                      Backup Link (valid for 7 days)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={invitationLink}
                        readOnly
                        className="text-xs bg-white border-green-300 font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-green-600">
                      You can share this link manually if needed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={resetDialog} className="flex-1">
                Invite Another Member
              </Button>
              <Button type="button" onClick={resetDialog} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to add a new member to your dental practice team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">Full Name</Label>
            <Input
              id="member-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter their full name"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-email">Email Address</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="their.email@example.com"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'assistant' | 'admin')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assistant">
                  <div className="flex flex-col items-start">
                    <span>Assistant</span>
                    <span className="text-xs text-muted-foreground">
                      Can manage tasks and patient logs
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span>Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Can manage team and assist with administration
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium mb-2">What happens next?</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• They'll receive an email with a secure invitation link</li>
                    <li>• They can create an account or sign in with existing credentials</li>
                    <li>• They'll be automatically added to your team</li>
                    <li>• The invitation expires after 7 days for security</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}