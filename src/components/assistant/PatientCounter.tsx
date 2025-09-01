import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface PatientCounterProps {
  patientCount: number;
  onPatientCountUpdate: (count: number) => void;
}

export default function PatientCounter({ patientCount, onPatientCountUpdate }: PatientCounterProps) {
  const { user, userProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];

  const updatePatientCount = async (increment: boolean) => {
    if (isUpdating) return;
    
    const newCount = increment ? patientCount + 1 : Math.max(0, patientCount - 1);
    
    if (!userProfile?.clinic_id) {
      toast.error('No clinic assigned to your account');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('patient_logs')
        .upsert({
          assistant_id: user?.id,
          date: today,
          patient_count: newCount,
          clinic_id: userProfile.clinic_id
        }, {
          onConflict: 'assistant_id,date,clinic_id'
        });

      if (error) throw error;
      
      onPatientCountUpdate(newCount);
      toast.success(`Patient count updated: ${newCount}`);
    } catch (error) {
      console.error('Error updating patient count:', error);
      toast.error('Failed to update patient count');
    } finally {
      setIsUpdating(false);
    }
  };

  const quickIncrement = async (amount: number) => {
    if (isUpdating) return;
    
    const newCount = patientCount + amount;
    
    if (!userProfile?.clinic_id) {
      toast.error('No clinic assigned to your account');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('patient_logs')
        .upsert({
          assistant_id: user?.id,
          date: today,
          patient_count: newCount,
          clinic_id: userProfile.clinic_id
        }, {
          onConflict: 'assistant_id,date,clinic_id'
        });

      if (error) throw error;
      
      onPatientCountUpdate(newCount);
      toast.success(`Added ${amount} patients (Total: ${newCount})`);
    } catch (error) {
      console.error('Error updating patient count:', error);
      toast.error('Failed to update patient count');
    } finally {
      setIsUpdating(false);
    }
  };

  const getMoodBadge = () => {
    if (patientCount >= 15) {
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">🌟 Outstanding!</Badge>;
    }
    if (patientCount >= 10) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">💪 Great job!</Badge>;
    }
    if (patientCount >= 5) {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">👍 Good start!</Badge>;
    }
    if (patientCount > 0) {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">🚀 Keep going!</Badge>;
    }
    return null;
  };

  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4 shadow-sm">
      {/* Icon and Count */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
          <Users className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-teal-900">{patientCount}</span>
            <span className="text-sm text-teal-700 font-medium">patients today</span>
          </div>
          {getMoodBadge()}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Quick increment buttons */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => quickIncrement(5)}
          disabled={isUpdating}
          className="h-8 px-3 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
        >
          +5
        </Button>
        
        {/* Main controls */}
        <div className="flex items-center gap-1">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => updatePatientCount(false)}
            disabled={patientCount === 0 || isUpdating}
            className="h-8 w-8 p-0 border-teal-300 text-teal-600 hover:bg-teal-50 disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}
          </Button>
          
          <Button 
            size="sm"
            onClick={() => updatePatientCount(true)}
            disabled={isUpdating}
            className="h-8 w-8 p-0 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 border-0 shadow-sm"
          >
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
}