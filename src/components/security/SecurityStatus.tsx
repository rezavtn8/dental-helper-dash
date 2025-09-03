import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Shield } from 'lucide-react';

interface SecurityItem {
  name: string;
  status: 'fixed' | 'pending' | 'warning';
  description: string;
  priority: 'critical' | 'high' | 'medium';
}

const securityItems: SecurityItem[] = [
  {
    name: 'Password Hash Vulnerability',
    status: 'fixed',
    description: 'Removed dangerous password_hash column that exposed user credentials',
    priority: 'critical'
  },
  {
    name: 'Data Access Controls',
    status: 'fixed',
    description: 'Strengthened RLS policies to prevent unauthorized data access',
    priority: 'critical'
  },
  {
    name: 'Session Management',
    status: 'fixed',
    description: 'Enhanced session security and automatic cleanup',
    priority: 'high'
  },
  {
    name: 'Rate Limiting Protection',
    status: 'fixed',
    description: 'Secured rate limiting tables from public exposure',
    priority: 'high'
  },
  {
    name: 'OTP Security Settings',
    status: 'pending',
    description: 'OTP expiry time needs to be reduced in Supabase dashboard',
    priority: 'high'
  },
  {
    name: 'Leaked Password Protection',
    status: 'pending',
    description: 'Enable leaked password protection in Supabase Auth settings',
    priority: 'high'
  }
];

export const SecurityStatus: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string, priority: string) => {
    if (status === 'fixed') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
    if (priority === 'critical') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    }
    if (priority === 'high') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const fixedItems = securityItems.filter(item => item.status === 'fixed');
  const pendingItems = securityItems.filter(item => item.status === 'pending');
  const criticalPending = pendingItems.filter(item => item.priority === 'critical');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Fixes Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{fixedItems.length}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Fixed</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{pendingItems.length}</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalPending.length}</div>
              <div className="text-sm text-red-700 dark:text-red-300">Critical</div>
            </div>
          </div>

          {/* Security Items List */}
          <div className="space-y-3">
            {securityItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(item.status, item.priority)}>
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {pendingItems.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Configuration Required
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {pendingItems.length} security {pendingItems.length === 1 ? 'setting' : 'settings'} 
                    {' '}need to be configured in your Supabase dashboard. 
                    Use the Security Configuration Guide for step-by-step instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};