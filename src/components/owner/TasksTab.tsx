import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { TaskStatus, isCompleted, getStatusDisplay, getStatusColor } from '@/lib/taskStatus';
import { Task, Assistant } from '@/types/task';
import CreateTaskDialog from './CreateTaskDialog';


interface TasksTabProps {
  tasks: Task[];
  assistants: Assistant[];
  onTaskUpdate: () => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'done':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'in-progress':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'overdue':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Calendar className="w-4 h-4 text-gray-400" />;
  }
};

const getDueText = (task: Task) => {
  if (task['due-type'] === 'custom' && task.custom_due_date) {
    const date = new Date(task.custom_due_date);
    return `Due ${date.toLocaleDateString()}`;
  }
  
  switch (task['due-type']) {
    case 'morning':
      return 'Due Morning';
    case 'afternoon':
      return 'Due Afternoon';
    case 'evening':
      return 'Due Evening';
    case 'end-of-day':
      return 'Due End of Day';
    default:
      return 'No due date';
  }
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function TasksTab({ tasks, assistants, onTaskUpdate }: TasksTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'pending' && task.status === 'pending') ||
                           (statusFilter === 'in-progress' && task.status === 'in-progress') ||
                           (statusFilter === 'completed' && task.status === 'completed');
      
      const matchesPriority = priorityFilter === 'all' || task.priority?.toLowerCase() === priorityFilter;
      
      const matchesAssignee = assigneeFilter === 'all' || 
                             (assigneeFilter === 'unassigned' && !task.assigned_to) ||
                             task.assigned_to === assigneeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  const todaysTasks = filteredTasks.filter(task => {
    if (task['due-type'] === 'custom' && task.custom_due_date) {
      const dueDate = new Date(task.custom_due_date);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }
    return task['due-type'] && task['due-type'] !== 'none';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-600">Manage and track practice tasks</p>
        </div>
        
        <CreateTaskDialog 
          assistants={assistants} 
          onTaskCreated={onTaskUpdate}
        />
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In-Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Assignee Filter */}
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      {todaysTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-teal-600" />
            Today's Tasks ({todaysTasks.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {todaysTasks.map((task) => {
              const assignedAssistant = assistants.find(a => a.id === task.assigned_to);
              
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                          {task.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority || 'Medium'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getDueText(task)}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Task</DropdownMenuItem>
                          <DropdownMenuItem>Reassign</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm text-gray-600 capitalize">
                          {getStatusDisplay(task.status)}
                        </span>
                      </div>
                      
                      {assignedAssistant ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                              {getInitials(assignedAssistant.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            {assignedAssistant.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <User className="w-4 h-4 mr-1" />
                          <span className="text-sm">Unassigned</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Tasks */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Tasks ({filteredTasks.length})
        </h3>
        
        {filteredTasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
                  ? "Try adjusting your filters to see more tasks."
                  : "Create your first task to get started with practice management."
                }
              </p>
              {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && assigneeFilter === 'all' && (
                <CreateTaskDialog 
                  assistants={assistants} 
                  onTaskCreated={onTaskUpdate}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task) => {
              const assignedAssistant = assistants.find(a => a.id === task.assigned_to);
              
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                          {task.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority || 'Medium'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getDueText(task)}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Task</DropdownMenuItem>
                          <DropdownMenuItem>Reassign</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm text-gray-600 capitalize">
                          {getStatusDisplay(task.status)}
                        </span>
                      </div>
                      
                      {assignedAssistant ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                              {getInitials(assignedAssistant.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            {assignedAssistant.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <User className="w-4 h-4 mr-1" />
                          <span className="text-sm">Unassigned</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-8 right-8">
        <CreateTaskDialog 
          assistants={assistants} 
          onTaskCreated={onTaskUpdate}
          trigger={
            <Button 
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              <Plus className="w-6 h-6" />
            </Button>
          }
        />
      </div>
    </div>
  );
}