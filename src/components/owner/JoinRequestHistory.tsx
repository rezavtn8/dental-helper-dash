import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, User, Mail, Calendar, AlertCircle } from 'lucide-react';

interface JoinRequest {
  id: string;
  user_id: string;
  clinic_id: string;
  requested_at: string;
  reviewed_at?: string | null;
  status: 'pending' | 'approved' | 'denied';
  denial_reason?: string | null;
  user_email: string;
  user_name: string;
}

interface JoinRequestHistoryProps {
  clinicId: string;
}

export default function JoinRequestHistory({ clinicId }: JoinRequestHistoryProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');

  useEffect(() => {
    if (clinicId) {
      fetchRequests();
    }
  }, [clinicId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const { data: joinRequestsData, error: joinRequestsError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('clinic_id', clinicId)
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
      
      const formattedRequests = joinRequestsData.map(request => {
        const user = usersData?.find(u => u.id === request.user_id);
        let userName = user?.name || 'Unknown User';
        if (userName === 'User' || !userName || userName.trim() === '') {
          userName = user?.email ? user.email.split('@')[0] : 'Unknown User';
        }
        
        return {
          ...request,
          user_email: user?.email || 'Unknown',
          user_name: userName
        } as JoinRequest;
      });

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      toast.error('Failed to load join request history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => 
    filter === 'all' || req.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Badge 
          variant={filter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('all')}
        >
          All ({requests.length})
        </Badge>
        <Badge 
          variant={filter === 'pending' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('pending')}
        >
          <Clock className="w-3 h-3 mr-1" />
          Pending ({requests.filter(r => r.status === 'pending').length})
        </Badge>
        <Badge 
          variant={filter === 'approved' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('approved')}
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved ({requests.filter(r => r.status === 'approved').length})
        </Badge>
        <Badge 
          variant={filter === 'denied' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('denied')}
        >
          <XCircle className="w-3 h-3 mr-1" />
          Denied ({requests.filter(r => r.status === 'denied').length})
        </Badge>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Requests Found</h3>
          <p className="text-muted-foreground text-sm">
            {filter === 'all' 
              ? "No join requests have been submitted yet."
              : `No ${filter} requests found.`}
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
                <TableHead>Status</TableHead>
                <TableHead>Reviewed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
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
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(request.status)}
                      {request.denial_reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.denial_reason}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.reviewed_at ? (
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.reviewed_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
