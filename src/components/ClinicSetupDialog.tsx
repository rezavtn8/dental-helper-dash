import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ClinicSetupForm from './ClinicSetupForm';

interface ClinicSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  onSuccess?: () => void;
}

export default function ClinicSetupDialog({ 
  open, 
  onOpenChange, 
  userProfile, 
  onSuccess 
}: ClinicSetupDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Your Clinic</DialogTitle>
          <DialogDescription>
            Set up your clinic information to get started with managing your dental team.
          </DialogDescription>
        </DialogHeader>
        <ClinicSetupForm 
          userProfile={userProfile} 
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}