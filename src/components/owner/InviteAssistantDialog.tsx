import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, UserPlus, CheckCircle, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface InviteAssistantDialogProps {
  open: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

export function InviteAssistantDialog({ open, onClose, onInviteSent }: InviteAssistantDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  
  const { createAssistantInvitation } = useAuth();

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
    
    setLoading(true);
    
    try {
      const { invitationId, invitationToken, error } = await createAssistantInvitation(email.trim(), name.trim());
      
      if (error) {
        toast.error(error);
      } else if (invitationToken) {
        const link = `${window.location.origin}/accept-invitation?token=${invitationToken}`;
        setInvitationLink(link);
        setInvitationSent(true);
        toast.success('Invitation created successfully!');
        onInviteSent();
      }
    } catch (error) {
      toast.error('Failed to create invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const resetDialog = () => {
    setEmail('');
    setName('');
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
              The assistant has been invited to join your clinic.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <p className="text-sm text-green-700 mb-3">
                  <strong>{name}</strong> has been invited to <strong>{email}</strong>
                </p>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-green-800">Invitation Link (valid for 7 days)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={invitationLink}
                      readOnly
                      className="text-xs bg-white border-green-300"
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
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={resetDialog} className="flex-1">
                Invite Another
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
            Invite Assistant
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to add a new assistant to your clinic.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assistant-name">Assistant Name</Label>
            <Input
              id="assistant-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter assistant's full name"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assistant-email">Email Address</Label>
            <Input
              id="assistant-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="assistant@example.com"
              className="text-base"
            />
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="text-sm font-medium mb-2">What happens next?</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• The assistant will receive an email invitation</li>
                <li>• They can set up their account using the invitation link</li>
                <li>• The invitation expires after 7 days</li>
                <li>• You can resend invitations if needed</li>
              </ul>
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