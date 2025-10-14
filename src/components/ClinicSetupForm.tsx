import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Building2, Key, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useClinicSetupForm, useFormErrors } from '@/hooks/useFormValidation';
import { sanitizeText, sanitizeClinicCode } from '@/utils/sanitize';

interface ClinicSetupFormProps {
  userProfile: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  onSuccess?: () => void;
}

export default function ClinicSetupForm({ userProfile, onSuccess }: ClinicSetupFormProps) {
  const [loading, setLoading] = useState(false);
  const { refreshUserProfile } = useAuth();
  const { getFieldError, hasFieldError } = useFormErrors();
  const navigate = useNavigate();
  const form = useClinicSetupForm();

  const generateClinicCode = () => {
    const clinicName = form.getValues('clinicName');
    if (clinicName.trim()) {
      const cleanName = clinicName.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const code = (cleanName.slice(0, 6) + randomSuffix).toUpperCase();
      form.setValue('clinicCode', code);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);

    try {
      // Sanitize inputs
      const sanitizedClinicName = sanitizeText(data.clinicName);
      const sanitizedClinicCode = sanitizeClinicCode(data.clinicCode);

      // Use the existing database function to create clinic and update user
      const { data: result, error } = await supabase.rpc('create_clinic_with_owner', {
        p_clinic_name: sanitizedClinicName,
        p_clinic_code: sanitizedClinicCode,
        p_owner_name: userProfile.name,
        p_owner_email: userProfile.email,
        p_owner_id: userProfile.id
      });

      if (error) throw error;

      if (result && result.length > 0 && result[0].success) {
        toast.success('Clinic created successfully!');
        
        // Refresh user profile to get the updated clinic_id
        await refreshUserProfile();
        
        // Send clinic setup email (non-blocking)
        const clinicId = result[0].clinic_id;
        if (clinicId) {
          setTimeout(() => {
            supabase.functions.invoke('send-clinic-setup-email', {
              body: {
                userId: userProfile.id,
                clinicId: clinicId,
              }
            }).then((response) => {
              console.log('Clinic setup email response:', response);
              // Temporary console log for testing - remove after email verification
              if (response.data?.success) {
                console.info('✅ Clinic setup email sent successfully');
              }
            }).catch(error => {
              console.error('Failed to send clinic setup email:', error);
              // Temporary console log for testing - remove after email verification
              console.warn('⚠️ Failed to send clinic setup email');
            });
          }, 0);
        }
        
        // Call success callback if provided, otherwise navigate
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/owner');
        }
      } else {
        const errorMessage = result && result.length > 0 ? result[0].message : 'Failed to create clinic';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating clinic:', error);
      
      if (error.message?.includes('clinic code already exists')) {
        toast.error('Clinic code already exists. Please choose a different one.');
      } else if (error.message?.includes('User already belongs to a clinic')) {
        toast.error('You already belong to a clinic.');
      } else {
        toast.error('Failed to create clinic. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Welcome, {userProfile.name}! Let's set up your clinic.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clinic-name">Clinic Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="clinic-name"
              type="text"
              {...form.register('clinicName')}
              onBlur={generateClinicCode}
              placeholder="Enter your clinic name"
              className="pl-10"
            />
          </div>
          {hasFieldError(form.formState.errors.clinicName) && (
            <p className="text-sm text-destructive">{getFieldError(form.formState.errors.clinicName)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinic-code">Clinic Code</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="clinic-code"
                type="text"
                {...form.register('clinicCode')}
                placeholder="Clinic code"
                className="pl-10 font-mono"
                onChange={(e) => form.setValue('clinicCode', e.target.value.toUpperCase())}
              />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={generateClinicCode}
              disabled={!form.watch('clinicName')?.trim()}
            >
              Generate
            </Button>
          </div>
          {hasFieldError(form.formState.errors.clinicCode) && (
            <p className="text-sm text-destructive">{getFieldError(form.formState.errors.clinicCode)}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Your assistants will use this code to join your clinic
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Creating Clinic...
          </>
        ) : (
          <>
            <Building2 className="w-4 h-4 mr-2" />
            Create My Clinic
          </>
        )}
      </Button>
    </form>
  );
}