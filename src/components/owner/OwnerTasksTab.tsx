import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateTaskDialog from './CreateTaskDialog';
import EditTaskDialog from './EditTaskDialog';
import { Task, Assistant } from '@/types/task';

interface OwnerTasksTabProps {
  clinicId: string;
}

export default function OwnerTasksTab({ clinicId }: OwnerTasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assistantFilter, setAssistantFilter] = useState('all');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (clinicId) {
      fetchData();
    }
  }, [clinicId]);

  // Real-time task synchronization
  useEffect(() => {
    if (!clinicId) return;

    const channel = supabase
      .channel('owner-tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `clinic_id=eq.${clinicId}`
        },
        (payload) => {
          console.log('Task change detected:', payload);
          fetchData(); // Refresh task list and assistants
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assistants
      const { data: assistantsData, error: assistantsError } = await supabase
        .from('users')
        .select('id, name, email, role, is_active, created_at')
        .eq('clinic_id', clinicId)
        .eq('role', 'assistant')
        .eq('is_active', true);

      if (assistantsError) throw assistantsError;
      setAssistants(assistantsData || []);

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Add assistant names to tasks
      const tasksWithAssistants = tasksData || [];

      setTasks(tasksWithAssistants);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', selectedTasks);

      if (error) throw error;

      toast.success(`Deleted ${selectedTasks.length} task(s)`);
      setSelectedTasks([]);
      setDeleteConfirmOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting tasks:', error);
      toast.error('Failed to delete tasks');
    }
  };

  const handleToggleSelect = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const currentFilteredTasks = tasks.filter(task => {
        const assistantName = getAssistantName(task.assigned_to);
        const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             assistantName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesAssistant = assistantFilter === 'all' || 
                                (assistantFilter === 'unassigned' && !task.assigned_to) ||
                                task.assigned_to === assistantFilter;

        return matchesSearch && matchesStatus && matchesAssistant;
      });
      setSelectedTasks(currentFilteredTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const getAssistantName = (assistantId: string | null | undefined) => {
    if (!assistantId) return 'Unassigned';
    const assistant = assistants.find(a => a.id === assistantId);
    return assistant?.name || 'Unknown';
  };

  const filteredTasks = tasks.filter(task => {
    const assistantName = getAssistantName(task.assigned_to);
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assistantName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssistant = assistantFilter === 'all' || 
                            (assistantFilter === 'unassigned' && !task.assigned_to) ||
                            task.assigned_to === assistantFilter;

    return matchesSearch && matchesStatus && matchesAssistant;
  });

  const handleReassignTask = async (taskId: string, newAssignee: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: newAssignee === 'unassigned' ? null : newAssignee })
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task reassigned successfully');
      fetchData();
    } catch (error) {
      console.error('Error reassigning task:', error);
      toast.error('Failed to reassign task');
    }
  };

  const allSelected = filteredTasks.length > 0 && selectedTasks.length === filteredTasks.length;
  const someSelected = selectedTasks.length > 0 && selectedTasks.length < filteredTasks.length;

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Task Manager</h3>
          <p className="text-muted-foreground">Create, assign, and track tasks for your team</p>
        </div>
        
        <div className="flex gap-2">
          {selectedTasks.length > 0 && (
            <Button
              onClick={() => setDeleteConfirmOpen(true)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedTasks.length})
            </Button>
          )}
          <CreateTaskDialog 
            assistants={assistants}
            onTaskCreated={fetchData}
            trigger={
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            }
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assistantFilter} onValueChange={setAssistantFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Assistant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assistants</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {assistants.map(assistant => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTasks.length > 0 && (
            <div className="p-4 border-b flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                className={someSelected ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary" : ""}
              />
              <span className="text-sm text-muted-foreground">
                {selectedTasks.length > 0 
                  ? `${selectedTasks.length} selected`
                  : 'Select all tasks'
                }
              </span>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-8 h-8 px-2 py-1">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium">Task</TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium">Assigned To</TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium">Priority</TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium">Status</TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium">Due Type</TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium">Recurrence</TableHead>
                  <TableHead className="px-2 py-1 text-xs font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className={`h-8 ${selectedTasks.includes(task.id) ? 'bg-muted/50' : ''}`}>
                    <TableCell className="px-2 py-1">
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => handleToggleSelect(task.id)}
                        className="h-3 w-3"
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {task.description}
                          </div>
                        )}
                        {task.category && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4 mt-0.5">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Select 
                        value={task.assigned_to || 'unassigned'} 
                        onValueChange={(value) => handleReassignTask(task.id, value)}
                      >
                        <SelectTrigger className="w-32 h-6 text-xs px-2 py-0">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {assistants.map(assistant => (
                            <SelectItem key={assistant.id} value={assistant.id}>
                              {assistant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <span className={`text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Badge variant={task.status === 'completed' ? 'outline' : task.status === 'in-progress' ? 'default' : 'secondary'} className="text-xs px-1 py-0 h-4 gap-1">
                        {task.status === 'completed' && <CheckCircle className="w-2 h-2" />}
                        {task.status === 'in-progress' && <AlertCircle className="w-2 h-2" />}
                        {task.status === 'pending' && <Clock className="w-2 h-2" />}
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4 capitalize">
                        {task['due-type']?.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-4 capitalize">
                        {task.recurrence === 'none' ? 'One-time' : task.recurrence}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-1 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditTask(task);
                            setShowEditDialog(true);
                          }}>
                            <Edit className="w-3 h-3 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || assistantFilter !== 'all' 
                  ? 'Try adjusting your filters or search term.'
                  : 'Create your first task to get started.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editTask}
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        onTaskUpdated={fetchData}
        assistants={assistants}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTasks.length} selected task(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}