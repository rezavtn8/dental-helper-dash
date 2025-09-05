import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2 } from 'lucide-react';
import ClinicSetupForm from '@/components/ClinicSetupForm';

interface ClinicSetupDialogProps {
  userProfile: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export default function ClinicSetupDialog({ userProfile }: ClinicSetupDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <Building2 className="w-5 h-5 mr-2" />
          Create My Clinic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Set Up Your Clinic</DialogTitle>
          <DialogDescription>
            Welcome, {userProfile.name}! Let's create your clinic profile to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ClinicSetupForm 
            userProfile={userProfile} 
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}