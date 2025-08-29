import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';

const InviteExpired = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/', { replace: true });
  };

  const handleRequestNewInvite = () => {
    window.location.href = 'mailto:admin@clinic.com?subject=Request%20New%20Invitation&body=Hi,%20I%20need%20a%20new%20invitation%20link%20to%20join%20the%20team.';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle>Invalid or Expired Invitation</CardTitle>
          <CardDescription>
            This invitation link is invalid, expired, or has already been used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center text-sm text-muted-foreground mb-4">
            <p>To join the team, you'll need a new invitation from your clinic administrator.</p>
          </div>
          
          <Button onClick={handleRequestNewInvite} variant="outline" className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Request New Invite
          </Button>
          
          <Button onClick={handleBackToLogin} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          
          <div className="text-center text-xs text-muted-foreground pt-2">
            <p>If you continue having issues, please contact your clinic administrator directly.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteExpired;