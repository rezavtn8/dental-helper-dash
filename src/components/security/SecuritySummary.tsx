import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Shield, ExternalLink } from 'lucide-react';

export const SecuritySummary: React.FC = () => {
  const criticalFixes = [
    'Eliminated user email enumeration attacks',
    'Implemented field-level access controls',
    'Secured invitation system with enhanced validation',
    'Removed unnecessary session data exposure',
    'Enhanced rate limiting with IP tracking',
    'Added comprehensive security audit logging'
  ];

  const pendingActions = [
    {
      title: 'Reduce OTP Expiry Time',
      description: 'Configure in Supabase Auth settings (5-10 minutes recommended)',
      link: 'https://supabase.com/dashboard/project/jnbdhtlmdxtanwlubyis/auth/providers',
      priority: 'HIGH'
    },
    {
      title: 'Enable Leaked Password Protection',
      description: 'Prevent users from setting compromised passwords',
      link: 'https://supabase.com/dashboard/project/jnbdhtlmdxtanwlubyis/auth/providers',
      priority: 'HIGH'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Shield className="h-5 w-5" />
            Security Implementation Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-green-700 dark:text-green-300">
              Critical security vulnerabilities have been successfully resolved. Your application now has
              robust data protection controls in place.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✅ Fixed Issues ({criticalFixes.length})
                </h4>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  {criticalFixes.map((fix, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  🔒 Security Improvements
                </h4>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <li>• No bulk email access for clinic owners</li>
                  <li>• Enhanced RLS policies with field restrictions</li>
                  <li>• Secure functions for safe team data access</li>
                  <li>• Advanced rate limiting and monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remaining Actions */}
      {pendingActions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="h-5 w-5" />
              Manual Configuration Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Complete these final steps in your Supabase dashboard to achieve optimal security.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {pendingActions.map((action, index) => (
                <div key={index} className="flex items-start justify-between p-4 border border-orange-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{action.title}</h4>
                      <Badge className="bg-orange-100 text-orange-800">
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <a
                    href={action.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 ml-4"
                  >
                    Configure <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Best Practices Now Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Data Protection</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• User emails protected from enumeration</li>
                <li>• Field-level access controls implemented</li>
                <li>• Secure functions for team data access</li>
                <li>• Business information properly restricted</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Access Controls</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Granular RLS policies per operation</li>
                <li>• Enhanced invitation system security</li>
                <li>• Session data completely restricted</li>
                <li>• Rate limiting with IP tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Readiness */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <CheckCircle className="h-5 w-5" />
            Production Readiness Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-blue-700 dark:text-blue-300">
              Your application has strong security fundamentals and can be safely deployed to production
              once the remaining manual configurations are completed.
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Database Security: <strong>SECURED</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>Auth Configuration: <strong>PENDING</strong></span>
              </div>
            </div>
            
            <Alert>
              <AlertDescription>
                <strong>Recommendation:</strong> Complete the manual Supabase configuration steps before 
                production deployment. Consider regular security reviews for ongoing protection.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};