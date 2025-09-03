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

interface TaskLogEvent {
  id: string;
  timestamp: string;
  action: string;
  task_id: string;
  task_title: string;
  actor_id: string;
  actor_name: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  status: string;
  priority: string;
  details: string;
}

interface OwnerLogTabProps {
  clinicId: string;
}

export default function OwnerLogTab({ clinicId }: OwnerLogTabProps) {
  const [logs, setLogs] = useState<TaskLogEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<TaskLogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (clinicId) {
      fetchData();
    }
  }, [clinicId]);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, actionFilter, actorFilter, assignedToFilter, statusFilter, priorityFilter, dateRange]);

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

      // Fetch tasks to generate logs (since we don't have a dedicated log table yet)
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Convert task data into log events
      const logEvents: TaskLogEvent[] = [];
      
      tasksData?.forEach(task => {
        const createdByName = userMap.get(task.created_by) || 'Unknown';
        const assignedToName = task.assigned_to ? userMap.get(task.assigned_to) : undefined;

        // Task creation event
        logEvents.push({
          id: `create_${task.id}`,
          timestamp: task.created_at,
          action: 'Created',
          task_id: task.id,
          task_title: task.title || 'Untitled Task',
          actor_id: task.created_by || '',
          actor_name: createdByName,
          assigned_to_id: task.assigned_to || undefined,
          assigned_to_name: assignedToName,
          status: task.status,
          priority: task.priority || 'medium',
          details: `Task "${task.title}" was created`
        });

        // Task completion event (if completed)
        if (task.status === 'completed' && task.completed_at) {
          const completedByName = userMap.get(task.completed_by || task.assigned_to) || assignedToName || 'Unknown';
          logEvents.push({
            id: `complete_${task.id}`,
            timestamp: task.completed_at,
            action: 'Completed',
            task_id: task.id,
            task_title: task.title || 'Untitled Task',
            actor_id: task.completed_by || task.assigned_to || '',
            actor_name: completedByName,
            assigned_to_id: task.assigned_to || undefined,
            assigned_to_name: assignedToName,
            status: task.status,
            priority: task.priority || 'medium',
            details: `Task "${task.title}" was marked as completed`
          });
        }

        // Task updated event (if updated_at is different from created_at)
        if (task.updated_at && task.updated_at !== task.created_at) {
          logEvents.push({
            id: `update_${task.id}`,
            timestamp: task.updated_at,
            action: 'Updated',
            task_id: task.id,
            task_title: task.title || 'Untitled Task',
            actor_id: task.created_by || '',
            actor_name: createdByName,
            assigned_to_id: task.assigned_to || undefined,
            assigned_to_name: assignedToName,
            status: task.status,
            priority: task.priority || 'medium',
            details: `Task "${task.title}" was updated`
          });
        }
      });

      // Sort by timestamp (newest first)
      logEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setLogs(logEvents);
    } catch (error) {
      console.error('Error fetching log data:', error);
      toast.error('Failed to load task logs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.task_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Assigned to filter
    if (assignedToFilter !== 'all') {
      filtered = filtered.filter(log => log.assigned_to_id === assignedToFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(log => log.priority === priorityFilter);
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
      case 'created':
        return <Plus className="w-4 h-4 text-blue-600" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, color: 'text-yellow-700 bg-yellow-100' },
      'in-progress': { variant: 'default' as const, color: 'text-blue-700 bg-blue-100' },
      completed: { variant: 'outline' as const, color: 'text-green-700 bg-green-100' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    
    return (
      <Badge className={config.color}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'text-green-700 bg-green-100',
      medium: 'text-yellow-700 bg-yellow-100',
      high: 'text-red-700 bg-red-100'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.medium}>
        {priority}
      </Badge>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setActorFilter('all');
    setAssignedToFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateRange({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading task logs...</span>
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
            Task Activity Log
          </h3>
          <p className="text-muted-foreground">Complete history of all task events and changes</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="col-span-full md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tasks, IDs, actors..."
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
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>

            {/* Actor Filter */}
            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Actor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actors</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assigned To Filter */}
            <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.filter(u => u.role === 'assistant').map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
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
                  <TableHead>Task Title</TableHead>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
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
                        <span className="font-medium">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.task_title}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.task_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {log.actor_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.assigned_to_name || (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(log.priority)}
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
                  ? 'No task activities have been recorded yet.'
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