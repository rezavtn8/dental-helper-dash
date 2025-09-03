import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  FileText,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface SystemLogEvent {
  id: string;
  timestamp: string;
  action: string;
  actor_id: string;
  actor_name: string;
  target: string;
  details: string;
}

interface OwnerLogTabProps {
  clinicId: string;
}

export default function OwnerLogTab({ clinicId }: OwnerLogTabProps) {
  const [logs, setLogs] = useState<SystemLogEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (clinicId) {
      fetchData();
    }
  }, [clinicId]);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, actionFilter, actorFilter, targetFilter, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users for filter dropdowns and name lookups
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Create user lookup map for faster access
      const userMap = new Map();
      usersData?.forEach(user => {
        userMap.set(user.id, user.name);
      });

      const logEvents: SystemLogEvent[] = [];

      // Fetch audit log events
      const { data: auditData, error: auditError } = await supabase
        .from('audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (!auditError && auditData) {
        auditData.forEach(audit => {
          const actorName = userMap.get(audit.user_id) || 'System';
          logEvents.push({
            id: audit.id,
            timestamp: audit.timestamp,
            action: audit.operation,
            actor_id: audit.user_id || 'system',
            actor_name: actorName,
            target: audit.table_name,
            details: `${audit.operation} on ${audit.table_name}`
          });
        });
      }

      // Fetch task events
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (!tasksError && tasksData) {
        tasksData.forEach(task => {
          const createdByName = userMap.get(task.created_by) || 'Unknown';

          // Task creation event
          logEvents.push({
            id: `create_${task.id}`,
            timestamp: task.created_at,
            action: 'task_created',
            actor_id: task.created_by || '',
            actor_name: createdByName,
            target: `Task: ${task.title}`,
            details: `Created task "${task.title}"`
          });

          // Task completion event
          if (task.status === 'completed' && task.completed_at) {
            const completedByName = userMap.get(task.completed_by) || userMap.get(task.assigned_to) || 'Unknown';
            logEvents.push({
              id: `complete_${task.id}`,
              timestamp: task.completed_at,
              action: 'task_completed',
              actor_id: task.completed_by || task.assigned_to || '',
              actor_name: completedByName,
              target: `Task: ${task.title}`,
              details: `Completed task "${task.title}"`
            });
          }

          // Task updated event
          if (task.updated_at && task.updated_at !== task.created_at) {
            logEvents.push({
              id: `update_${task.id}`,
              timestamp: task.updated_at,
              action: 'task_updated',
              actor_id: task.created_by || '',
              actor_name: createdByName,
              target: `Task: ${task.title}`,
              details: `Updated task "${task.title}"`
            });
          }
        });
      }

      // Fetch user events
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (!invitationsError && invitationsData) {
        invitationsData.forEach(invitation => {
          const invitedByName = userMap.get(invitation.invited_by) || 'Unknown';
          
          logEvents.push({
            id: `invite_${invitation.id}`,
            timestamp: invitation.created_at,
            action: 'user_invited',
            actor_id: invitation.invited_by,
            actor_name: invitedByName,
            target: `User: ${invitation.email}`,
            details: `Invited ${invitation.email} as ${invitation.role}`
          });

          if (invitation.status === 'accepted' && invitation.accepted_at) {
            const acceptedByName = userMap.get(invitation.accepted_by) || invitation.email;
            logEvents.push({
              id: `accept_${invitation.id}`,
              timestamp: invitation.accepted_at,
              action: 'user_joined',
              actor_id: invitation.accepted_by || '',
              actor_name: acceptedByName,
              target: `User: ${invitation.email}`,
              details: `${invitation.email} joined as ${invitation.role}`
            });
          }
        });
      }

      // Sort by timestamp (newest first)
      logEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setLogs(logEvents);
    } catch (error) {
      console.error('Error fetching log data:', error);
      toast.error('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action.toLowerCase() === actionFilter.toLowerCase());
    }

    // Actor filter
    if (actorFilter !== 'all') {
      filtered = filtered.filter(log => log.actor_id === actorFilter);
    }

    // Target filter
    if (targetFilter !== 'all') {
      filtered = filtered.filter(log => log.target.toLowerCase().includes(targetFilter.toLowerCase()));
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(log => {
        const logDate = parseISO(log.timestamp);
        const fromMatch = !dateRange.from || logDate >= dateRange.from;
        const toMatch = !dateRange.to || logDate <= dateRange.to;
        return fromMatch && toMatch;
      });
    }

    setFilteredLogs(filtered);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'task_created':
      case 'created':
        return <Plus className="w-4 h-4 text-blue-600" />;
      case 'task_updated':
      case 'updated':
        return <Edit className="w-4 h-4 text-orange-600" />;
      case 'task_completed':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'task_deleted':
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'user_invited':
        return <Plus className="w-4 h-4 text-purple-600" />;
      case 'user_joined':
        return <User className="w-4 h-4 text-green-600" />;
      case 'role_change':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setActorFilter('all');
    setTargetFilter('all');
    setDateRange({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading system logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            System Activity Log
          </h3>
          <p className="text-muted-foreground">Complete history of all system events and changes</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="col-span-full md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search actions, actors, targets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd')} -{' '}
                        {format(dateRange.to, 'LLL dd')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    'Date range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange(range || {})}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Action Filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="task_created">Task Created</SelectItem>
                <SelectItem value="task_updated">Task Updated</SelectItem>
                <SelectItem value="task_completed">Task Completed</SelectItem>
                <SelectItem value="user_invited">User Invited</SelectItem>
                <SelectItem value="user_joined">User Joined</SelectItem>
                <SelectItem value="role_change">Role Change</SelectItem>
              </SelectContent>
            </Select>

            {/* Actor Filter */}
            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Actor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actors</SelectItem>
                <SelectItem value="system">System</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Target Filter */}
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="clinic">Clinic</SelectItem>
                <SelectItem value="invitation">Invitation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Badge variant="secondary">
              {filteredLogs.length} of {logs.length} events
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(parseISO(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-medium">{log.action.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {log.actor_name}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.target}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Log Events Found</h3>
              <p className="text-muted-foreground">
                {logs.length === 0 
                  ? 'No system activities have been recorded yet.'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}