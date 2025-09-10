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
import { 
  getPriorityStyles, 
  getDueText, 
  getUserInitials,
  filterTasks,
  getTodaysTasks,
  findAssignedAssistant,
  TaskFilters
} from '@/lib/taskUtils';
import { Task, Assistant } from '@/types/task';
import CreateTaskDialog from './CreateTaskDialog';
import EditTaskDialog from './EditTaskDialog';
import ReassignTaskDialog from './ReassignTaskDialog';
import DeleteTaskDialog from './DeleteTaskDialog';
import TaskNotesView from './TaskNotesView';


interface TasksTabProps {
  tasks: Task[];
  assistants: Assistant[];
  onTaskUpdate: () => void;
}

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

export default function TasksTab({ tasks, assistants, onTaskUpdate }: TasksTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [reassignTask, setReassignTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredTasks = useMemo(() => {
    const filters: TaskFilters = {
      searchTerm,
      statusFilter,
      priorityFilter,
      assigneeFilter
    };
    return filterTasks(tasks, filters, assistants);
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, assistants]);

  const todaysTasks = useMemo(() => {
    return getTodaysTasks(filteredTasks);
  }, [filteredTasks]);

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
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Today's Tasks ({todaysTasks.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {todaysTasks.map((task) => {
              const assignedAssistant = findAssignedAssistant(task, assistants);
              
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                          {task.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`text-xs ${getPriorityStyles(task.priority)}`}>
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
                          <DropdownMenuItem onClick={() => {
                            setEditTask(task);
                            setShowEditDialog(true);
                          }}>
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setReassignTask(task);
                            setShowReassignDialog(true);
                          }}>
                            Reassign
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setDeleteTask(task);
                              setShowDeleteDialog(true);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
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
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {getUserInitials(assignedAssistant.name)}
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

      {/* Completed Tasks */}
      {filteredTasks.filter(task => task.status === 'completed').length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
            Completed Tasks ({filteredTasks.filter(task => task.status === 'completed').length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.filter(task => task.status === 'completed').map((task) => {
              const assignedAssistant = findAssignedAssistant(task, assistants);
              
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-green-800 mb-1 line-through">
                          {task.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Completed
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Completed'}
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
                          <DropdownMenuItem onClick={() => {
                            setEditTask(task);
                            setShowEditDialog(true);
                          }}>
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setReassignTask(task);
                            setShowReassignDialog(true);
                          }}>
                            Reassign
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setDeleteTask(task);
                              setShowDeleteDialog(true);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {task.description && (
                      <p className="text-sm text-green-700 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-700">
                          Completed {task.completed_at ? `on ${new Date(task.completed_at).toLocaleDateString()}` : ''}
                        </span>
                      </div>
                      
                      {assignedAssistant ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                              {getUserInitials(assignedAssistant.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-green-700">
                            {assignedAssistant.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-500">
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
          All Tasks ({filteredTasks.filter(task => task.status !== 'completed').length})
        </h3>
        
        {filteredTasks.filter(task => task.status !== 'completed').length === 0 ? (
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
            {filteredTasks.filter(task => task.status !== 'completed').map((task) => {
              const assignedAssistant = findAssignedAssistant(task, assistants);
              
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                          {task.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`text-xs ${getPriorityStyles(task.priority)}`}>
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
                          <DropdownMenuItem onClick={() => {
                            setEditTask(task);
                            setShowEditDialog(true);
                          }}>
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setReassignTask(task);
                            setShowReassignDialog(true);
                          }}>
                            Reassign
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setDeleteTask(task);
                              setShowDeleteDialog(true);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
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
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {getUserInitials(assignedAssistant.name)}
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
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="w-6 h-6" />
            </Button>
          }
        />
      </div>

      {/* Dialogs */}
      <EditTaskDialog
        task={editTask}
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        onTaskUpdated={onTaskUpdate}
        assistants={assistants}
      />

      <ReassignTaskDialog
        task={reassignTask}
        isOpen={showReassignDialog}
        onOpenChange={setShowReassignDialog}
        onTaskUpdated={onTaskUpdate}
        assistants={assistants}
      />

      <DeleteTaskDialog
        task={deleteTask}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onTaskDeleted={onTaskUpdate}
      />
    </div>
  );
}