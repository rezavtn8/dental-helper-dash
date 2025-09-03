import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, ExternalLink, CheckCircle } from 'lucide-react';

interface ConfigStep {
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dashboardUrl: string;
  instructions: string[];
}

const configurationSteps: ConfigStep[] = [
  {
    title: 'Reduce OTP Expiry Time',
    description: 'Current OTP expiry exceeds security recommendations',
    status: 'pending',
    priority: 'high',
    dashboardUrl: 'https://supabase.com/dashboard/project/jnbdhtlmdxtanwlubyis/auth/providers',
    instructions: [
      'Go to Authentication → Providers in your Supabase dashboard',
      'Click on "Email" provider settings',
      'Reduce OTP expiry time to 10 minutes or less',
      'Save the configuration'
    ]
  },
  {
    title: 'Enable Leaked Password Protection',
    description: 'Protect against commonly compromised passwords',
    status: 'pending',
    priority: 'high',
    dashboardUrl: 'https://supabase.com/dashboard/project/jnbdhtlmdxtanwlubyis/auth/providers',
    instructions: [
      'Go to Authentication → Providers in your Supabase dashboard',
      'Click on "Email" provider settings',
      'Enable "Leaked password protection"',
      'Save the configuration'
    ]
  },
  {
    title: 'Database Security Hardening',
    description: 'Enhanced RLS policies and input validation',
    status: 'completed',
    priority: 'high',
    dashboardUrl: '',
    instructions: [
      'Removed dangerous password_hash column ✓',
      'Strengthened RLS policies ✓',
      'Enhanced input validation ✓',
      'Added rate limiting protections ✓'
    ]
  }
];

export const SecurityConfigGuide: React.FC = () => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const pendingSteps = configurationSteps.filter(step => step.status === 'pending');
  const completedSteps = configurationSteps.filter(step => step.status === 'completed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Configuration Guide
          </CardTitle>
          <CardDescription>
            Complete these steps to secure your application for production use
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingSteps.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Action Required ({pendingSteps.length} items)
              </h3>
              <div className="space-y-4">
                {pendingSteps.map((step, index) => (
                  <Card key={index} className="border-l-4 border-yellow-400">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(step.status)}
                            <h4 className="font-semibold">{step.title}</h4>
                            <Badge className={getPriorityColor(step.priority)}>
                              {step.priority.toUpperCase()} PRIORITY
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {step.dashboardUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <a 
                              href={step.dashboardUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              Configure
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                      <div className="ml-6">
                        <p className="text-sm font-medium mb-2">Steps:</p>
                        <ol className="text-sm space-y-1">
                          {step.instructions.map((instruction, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {completedSteps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Completed ({completedSteps.length} items)
              </h3>
              <div className="space-y-3">
                {completedSteps.map((step, index) => (
                  <Card key={index} className="border-l-4 border-green-400">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(step.status)}
                        <h4 className="font-semibold">{step.title}</h4>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          COMPLETED
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      <div className="ml-6">
                        <ul className="text-sm space-y-1">
                          {step.instructions.map((instruction, i) => (
                            <li key={i} className="flex items-center gap-2 text-green-700 dark:text-green-300">
                              <CheckCircle className="h-3 w-3" />
                              {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pendingSteps.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200">
                    Production Deployment Warning
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    <strong>Do not deploy to production</strong> until all high-priority security 
                    configurations are completed. These settings protect against common attack vectors 
                    and are essential for healthcare data security.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};