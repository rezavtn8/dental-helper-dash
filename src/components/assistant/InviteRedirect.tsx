import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';

const InviteRedirect = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/', { replace: true });
  };

  const handleRequestNewInvite = () => {
    window.location.href = 'mailto:admin@clinic.com?subject=Request%20New%20Invitation&body=Hi,%20I%20need%20a%20new%20invitation%20link%20to%20join%20the%20team.';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
        <h1 className="text-2xl font-bold">No Clinic Assigned</h1>
        <p className="text-muted-foreground">
          Your account is not currently associated with any clinic. 
          Please contact your clinic administrator to send you a new invitation link.
        </p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle>Need Access?</CardTitle>
          <CardDescription>
            To join a clinic team, you'll need an invitation from the clinic administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleRequestNewInvite} variant="outline" className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Request Invitation
          </Button>
          
          <Button onClick={handleBackToLogin} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          
          <div className="text-center text-sm text-muted-foreground pt-2">
            <p>If you have an invitation link, click it in your email to join automatically.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteRedirect;