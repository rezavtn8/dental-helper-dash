import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, User, Mail, Calendar } from 'lucide-react';

interface JoinRequest {
  id: string;
  user_id: string;
  clinic_id: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'denied';
  user_email: string;
  user_name: string;
}

interface PendingRequestsTabProps {
  clinicId: string;
}

export default function PendingRequestsTab({ clinicId }: PendingRequestsTabProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [denyDialog, setDenyDialog] = useState<{ open: boolean; request: JoinRequest | null }>({
    open: false,
    request: null
  });
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    if (clinicId) {
      fetchRequests();
    }
  }, [clinicId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Get join requests first
      const { data: joinRequestsData, error: joinRequestsError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (joinRequestsError) throw joinRequestsError;

      if (!joinRequestsData || joinRequestsData.length === 0) {
        setRequests([]);
        return;
      }

      // Get user info for each request
      const userIds = joinRequestsData.map(req => req.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Combine data
      const formattedRequests = joinRequestsData.map(request => {
        const user = usersData?.find(u => u.id === request.user_id);
        return {
          ...request,
          user_email: user?.email || 'Unknown',
          user_name: user?.name || 'Unknown User'
        } as JoinRequest;
      });

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      toast.error('Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: JoinRequest) => {
    setProcessingRequest(request.id);
    
    try {
      const { data, error } = await supabase.rpc('process_join_request', {
        p_request_id: request.id,
        p_action: 'approve'
      });

      if (error) throw error;

      const result = data[0];
      if (result.success) {
        toast.success(`${request.user_name} has been approved and added to your clinic`);
        fetchRequests();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeny = async () => {
    if (!denyDialog.request) return;
    
    setProcessingRequest(denyDialog.request.id);
    
    try {
      const { data, error } = await supabase.rpc('process_join_request', {
        p_request_id: denyDialog.request.id,
        p_action: 'deny',
        p_denial_reason: denialReason.trim() || 'Request denied by clinic owner'
      });

      if (error) throw error;

      const result = data[0];
      if (result.success) {
        toast.success(`Request from ${denyDialog.request.user_name} has been denied`);
        fetchRequests();
        setDenyDialog({ open: false, request: null });
        setDenialReason('');
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny request');
    } finally {
      setProcessingRequest(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Pending Join Requests</span>
            {requests.length > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {requests.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and approve assistant requests to join your clinic
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
              <p className="text-muted-foreground">
                When assistants request to join your clinic, they'll appear here for approval.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assistant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{request.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{request.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(request.requested_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request)}
                            disabled={processingRequest === request.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {processingRequest === request.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDenyDialog({ open: true, request })}
                            disabled={processingRequest === request.id}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deny Request Dialog */}
      <Dialog open={denyDialog.open} onOpenChange={(open) => {
        if (!open) {
          setDenyDialog({ open: false, request: null });
          setDenialReason('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Join Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to deny the request from {denyDialog.request?.user_name}?
              You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="denial-reason">Reason (optional)</Label>
              <Textarea
                id="denial-reason"
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="e.g., Position not available at this time..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDenyDialog({ open: false, request: null });
                setDenialReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeny}
              disabled={processingRequest === denyDialog.request?.id}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processingRequest === denyDialog.request?.id ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}