import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Clock, Users } from 'lucide-react';

interface SecurityMetric {
  metric: string;
  value: number;
  period: string;
}

interface SecurityStatus {
  check_name: string;
  status: string;
  details: string;
}

export const SecurityMonitor: React.FC = () => {
  const { userProfile } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [status, setStatus] = useState<SecurityStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.role === 'owner') {
      loadSecurityData();
    }
  }, [userProfile]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load security metrics
      const { data: metricsData, error: metricsError } = await supabase.rpc('get_security_metrics');
      if (metricsError) {
        console.error('Error loading security metrics:', metricsError);
      } else {
        setMetrics(metricsData || []);
      }

      // Load security status
      const { data: statusData, error: statusError } = await supabase.rpc('get_security_status');
      if (statusError) {
        console.error('Error loading security status:', statusError);
      } else {
        setStatus(statusData || []);
      }
    } catch (error) {
      console.error('Error in loadSecurityData:', error);
    } finally {
      setLoading(false);
    }
  };

  if (userProfile?.role !== 'owner') {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading security data...</div>
        </CardContent>
      </Card>
    );
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'failed_logins': return <AlertTriangle className="h-4 w-4" />;
      case 'invitation_attempts': return <Users className="h-4 w-4" />;
      case 'active_sessions': return <Clock className="h-4 w-4" />;
      case 'pending_invitations': return <Users className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'failed_logins': return 'Failed Logins';
      case 'invitation_attempts': return 'Invitation Attempts';
      case 'active_sessions': return 'Active Sessions';
      case 'pending_invitations': return 'Pending Invitations';
      default: return metric;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'secured': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
          <CardDescription>
            Real-time security metrics and system status for your clinic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric) => (
              <div key={metric.metric} className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                {getMetricIcon(metric.metric)}
                <div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {getMetricLabel(metric.metric)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.period === 'last_hour' ? 'Last Hour' : 'Current'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Security Status</h3>
            {status.map((item) => (
              <div key={item.check_name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{item.check_name.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-muted-foreground">{item.details}</div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};