import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  UserCheck,
  FileText
} from 'lucide-react';

interface DashboardStats {
  activeAssistants: number;
  pendingRequests: number;
  completedTasksThisWeek: number;
  patientsThisMonth: number;
}

interface CertificationAlert {
  assistant_name: string;
  certification_name: string;
  expiry_date: string;
  days_until_expiry: number;
}

interface OwnerDashboardTabProps {
  clinicId: string;
}

export default function OwnerDashboardTab({ clinicId }: OwnerDashboardTabProps) {
  const [stats, setStats] = useState<DashboardStats>({
    activeAssistants: 0,
    pendingRequests: 0,
    completedTasksThisWeek: 0,
    patientsThisMonth: 0
  });
  const [certificationAlerts, setCertificationAlerts] = useState<CertificationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (clinicId) {
      fetchDashboardData();
    }
  }, [clinicId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch active assistants
      const { data: assistants, error: assistantsError } = await supabase
        .from('users')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('role', 'assistant')
        .eq('is_active', true);

      if (assistantsError) throw assistantsError;

      // Fetch pending requests
      const { data: requests, error: requestsError } = await supabase
        .from('join_requests')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Fetch completed tasks this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: completedTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('status', 'completed')
        .gte('completed_at', weekStart.toISOString());

      if (tasksError) throw tasksError;

      // Fetch patients this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: patientLogs, error: patientsError } = await supabase
        .from('patient_logs')
        .select('patient_count')
        .eq('clinic_id', clinicId)
        .gte('date', monthStart.toISOString().split('T')[0]);

      if (patientsError) throw patientsError;

      const totalPatients = patientLogs?.reduce((sum, log) => sum + (log.patient_count || 0), 0) || 0;

      // Fetch certification alerts (expiring within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Skip certification alerts for now due to query complexity
      const alerts: CertificationAlert[] = [];

      setStats({
        activeAssistants: assistants?.length || 0,
        pendingRequests: requests?.length || 0,
        completedTasksThisWeek: completedTasks?.length || 0,
        patientsThisMonth: totalPatients
      });

      setCertificationAlerts(alerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Assistants',
      value: stats.activeAssistants,
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Tasks Completed (This Week)',
      value: stats.completedTasksThisWeek,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Patients Assisted (This Month)',
      value: stats.patientsThisMonth,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Certification Alerts */}
      {certificationAlerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="font-medium mb-2">Certification Expiry Alerts</div>
            <div className="space-y-1">
              {certificationAlerts.map((alert, index) => (
                <div key={index} className="text-sm">
                  <strong>{alert.assistant_name}</strong>'s {alert.certification_name} expires in{' '}
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    {alert.days_until_expiry} days
                  </Badge>
                  {' '}({new Date(alert.expiry_date).toLocaleDateString()})
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingRequests > 0 && (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // This would switch to the team tab - for now just show a message
                  toast.info('Switch to Team tab to approve pending requests');
                }}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Approve {stats.pendingRequests} Pending Request{stats.pendingRequests !== 1 ? 's' : ''}
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                toast.info('Switch to Tasks tab to review tasks');
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Review Tasks
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                toast.info('Switch to Schedule tab to manage schedules');
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Manage Schedule
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from your clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Tasks completed this week</span>
                <Badge variant="secondary">{stats.completedTasksThisWeek}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Active team members</span>
                <Badge variant="secondary">{stats.activeAssistants}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Patients assisted this month</span>
                <Badge variant="secondary">{stats.patientsThisMonth}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}