import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

export default function InviteDialog({ open, onClose, onInviteSent }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { createInvitation } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { token, error } = await createInvitation(email, name);
      
      if (error) {
        toast.error(error);
        return;
      }

      if (token) {
        const link = `${window.location.origin}/join?token=${token}`;
        setInviteLink(link);
        
        // Send email via edge function
        await sendInvitationEmail(email, name, link, token);
        
        toast.success('Invitation sent successfully!');
        onInviteSent();
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error('Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const sendInvitationEmail = async (email: string, name: string, link: string, token: string) => {
    try {
      await supabase.functions.invoke('send-team-invitation', {
        body: {
          recipientEmail: email,
          recipientName: name,
          joinUrl: link,
          invitationToken: token,
          clinicName: 'Your Clinic' // Will be fetched from DB in edge function
        }
      });
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw - invitation was created successfully
    }
  };

  const copyToClipboard = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetDialog = () => {
    setEmail('');
    setName('');
    setInviteLink(null);
    setCopied(false);
    onClose();
  };

  if (inviteLink) {
    return (
      <Dialog open={open} onOpenChange={resetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Invitation Sent Successfully
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We've sent an email invitation to <strong>{email}</strong>. 
              You can also share this direct link:
            </p>
            
            <div className="flex gap-2">
              <Input 
                value={inviteLink} 
                readOnly 
                className="bg-muted"
              />
              <Button 
                onClick={copyToClipboard} 
                size="sm" 
                variant="outline"
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={resetDialog} className="flex-1">
                Invite Another
              </Button>
              <Button onClick={resetDialog} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter their name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter their email"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Send Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}