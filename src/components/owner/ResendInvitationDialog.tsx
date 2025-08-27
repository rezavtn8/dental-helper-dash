import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Mail, AlertTriangle, Link, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface ResendInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  token?: string;
  resendCount: number;
  onResend: () => Promise<void>;
}

export default function ResendInvitationDialog({
  open,
  onOpenChange,
  email,
  token,
  resendCount,
  onResend
}: ResendInvitationDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const invitationLink = token ? `${window.location.origin}/accept-invitation?token=${token}` : '';

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast.success('Invitation link copied to clipboard!');
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast.success('Invitation code copied to clipboard!');
      }
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await onResend();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-teal-600" />
            Resend Invitation
          </DialogTitle>
          <DialogDescription>
            Resend invitation to <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rate limit warning */}
          {resendCount >= 3 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Multiple resends detected.</strong> This invitation has been resent {resendCount} times. 
                Consider contacting the recipient directly if they're not receiving emails.
              </AlertDescription>
            </Alert>
          )}

          {/* Show existing link if token is available */}
          {token && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Invitation Link
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={invitationLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(invitationLink, 'link')}
                    className="px-3"
                  >
                    {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Invitation Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={token}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(token, 'code')}
                    className="px-3"
                  >
                    {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleResend}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Resending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Email & Extend Expiry
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>

          {resendCount > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              This invitation has been resent {resendCount} time{resendCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}