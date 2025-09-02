import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, CheckCircle } from "lucide-react";

interface ClinicPreviewProps {
  clinicCode: string;
}

interface ClinicInfo {
  id: string;
  name: string;
  clinic_code: string;
}

export const ClinicPreview: React.FC<ClinicPreviewProps> = ({ clinicCode }) => {
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClinicInfo = async () => {
      if (!clinicCode || clinicCode.length < 3) {
        setClinic(null);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('lookup_clinic_by_code', { p_code: clinicCode.trim().toUpperCase() });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setClinic(data[0]);
        } else {
          setClinic(null);
        }
      } catch (error) {
        console.error('Error fetching clinic:', error);
        setClinic(null);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchClinicInfo, 300);
    return () => clearTimeout(debounceTimer);
  }, [clinicCode]);

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">Looking up clinic...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clinic && clinicCode.length >= 3) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <Building className="h-4 w-4" />
            <span className="text-sm">Clinic not found</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (clinic) {
    return (
      <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <div className="flex-1">
              <div className="text-sm font-medium">{clinic.name}</div>
              <div className="text-xs opacity-75">Code: {clinic.clinic_code}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};