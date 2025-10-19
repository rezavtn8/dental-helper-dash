import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ClinicPreview } from '@/components/clinic/ClinicPreview';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Clock, CheckCircle, XCircle, ArrowLeft, Shield } from 'lucide-react';
import { useJoinClinicForm, useFormErrors } from '@/hooks/useFormValidation';
import { sanitizeClinicCode } from '@/utils/sanitize';

interface JoinRequest {
  id: string;
  clinic_id: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'denied';
  reviewed_at?: string | null;
  denial_reason?: string | null;
  clinics: {
    name: string;
    clinic_code: string;
  };
}

export default function JoinClinic() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const { getFieldError, hasFieldError } = useFormErrors();
  const form = useJoinClinicForm();

  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true });
      return;
    }
    fetchJoinRequests();

    // Set up real-time subscription for join request updates
    const channel = supabase
      .channel('join-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'join_requests',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Join request updated:', payload);
          fetchJoinRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, navigate]);

  const fetchJoinRequests = async () => {
    if (!session?.user) return;
    
    try {
      setLoadingRequests(true);
      console.log('Fetching join requests for user:', session.user.id);
      
      const { data, error } = await supabase
        .from('join_requests')
        .select(`
          id,
          status,
          requested_at,
          reviewed_at,
          denial_reason,
          clinic_id,
          clinics (
            name,
            clinic_code
          )
        `)
        .eq('user_id', session.user.id)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      
      console.log('Fetched join requests:', data);
      setJoinRequests(data as JoinRequest[]);
    } catch (error: any) {
      console.error('Error fetching join requests:', error);
      
      if (error?.message?.includes('JWT')) {
        toast.error('Session expired. Please sign in again.');
      } else {
        toast.error('Failed to load join requests. Please refresh the page.');
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmitRequest = async (data: any) => {
    setLoading(true);
    
    try {
      // Sanitize the clinic code
      const sanitizedClinicCode = sanitizeClinicCode(data.clinicCode);
      
      const { data: result, error } = await supabase.rpc('submit_join_request_with_rate_limit', {
        p_clinic_code: sanitizedClinicCode
      });

      if (error) throw error;

      const responseData = result[0];
      if (responseData.success) {
        toast.success(responseData.message);
        form.reset();
        // Refresh the join requests immediately with optimistic update
        await fetchJoinRequests();
      } else {
        toast.error(responseData.message);
      }
    } catch (error: any) {
      console.error('Error submitting join request:', error);
      
      if (error?.message?.includes('Rate limit exceeded')) {
        toast.error('Too many requests. Please wait before trying again.');
      } else if (error?.message?.includes('not found')) {
        toast.error('Clinic not found. Please check the code and try again.');
      } else if (error?.message?.includes('already exists')) {
        toast.error('You already have a pending request for this clinic.');
      } else {
        toast.error('Failed to submit request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="text-xl font-semibold">Join Clinic</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8">
          {/* Join Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span>Join a Clinic</span>
              </CardTitle>
              <CardDescription>
                Enter your clinic's code to request access. Your request will need approval from the clinic owner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmitRequest)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicCode">Clinic Code</Label>
                  <Input
                    id="clinicCode"
                    {...form.register('clinicCode')}
                    placeholder="Enter clinic code (e.g., ABC123)"
                    className="font-mono"
                    maxLength={20}
                    disabled={loading}
                    onChange={(e) => form.setValue('clinicCode', e.target.value.toUpperCase())}
                  />
                  {hasFieldError(form.formState.errors.clinicCode) && (
                    <p className="text-sm text-destructive">{getFieldError(form.formState.errors.clinicCode)}</p>
                  )}
                  {form.watch('clinicCode')?.length >= 3 && (
                    <div className="mt-2">
                      <ClinicPreview clinicCode={form.watch('clinicCode')} />
                    </div>
                  )}
                </div>
                
                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    Your request will be reviewed by the clinic owner. You'll be notified once it's processed.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !form.watch('clinicCode')?.trim()}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Submit Join Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Request History */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Join Requests</CardTitle>
                  <CardDescription>
                    Track the status of your clinic join requests
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchJoinRequests()}
                  disabled={loadingRequests}
                >
                  {loadingRequests ? (
                    <div className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="ml-2 text-muted-foreground">Loading requests...</span>
                </div>
              ) : joinRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No join requests yet</p>
                  <p className="text-sm">Submit a request above to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {joinRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                       <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {request.clinics?.name || 'Loading clinic...'}
                            </span>
                            <Badge variant="outline" className="font-mono text-xs">
                              {request.clinics?.clinic_code || 'N/A'}
                            </Badge>
                          </div>
                        <p className="text-sm text-muted-foreground">
                          Requested {new Date(request.requested_at).toLocaleDateString()}
                          {request.reviewed_at && (
                            <span> • Reviewed {new Date(request.reviewed_at).toLocaleDateString()}</span>
                          )}
                        </p>
                        {request.denial_reason && (
                          <p className="text-sm text-red-600 mt-2">
                            <strong>Reason:</strong> {request.denial_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}