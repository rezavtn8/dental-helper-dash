import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckSquare,
  FileText,
  X,
  ChevronDown,
  Layout,
  Table,
  Save,
  Tag,
  Clock4,
  Calendar as CalendarIcon,
  CheckCircle,
  Copy,
  Repeat,
  Users
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  'due-type': string;
  category: string;
  assigned_to: string | null;
  recurrence: string;
  created_at: string;
  checklist?: ChecklistItem[];
  owner_notes?: string;
  custom_due_date?: string;
}

interface Assistant {
  id: string;
  name: string;
  email: string;
}

interface TasksTabProps {
  tasks: Task[];
  assistants: Assistant[];
  onCreateTask: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

const TasksTab: React.FC<TasksTabProps> = ({ tasks, assistants, onCreateTask, loading }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    'due-type': 'EoD',
    category: '',
    assigned_to: 'unassigned',
    recurrence: 'none',
    owner_notes: ''
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateTask(e);
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      'due-type': 'EoD',
      category: '',
      assigned_to: 'unassigned',
      recurrence: 'none',
      owner_notes: ''
    });
    setChecklist([]);
    setIsCreateDialogOpen(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Cleaning">Cleaning</SelectItem>
              <SelectItem value="Setup">Setup</SelectItem>
              <SelectItem value="Labs">Labs</SelectItem>
              <SelectItem value="Patient Care">Patient Care</SelectItem>
              <SelectItem value="Administrative">Administrative</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={taskViewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTaskViewMode('table')}
              className="px-3"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={taskViewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTaskViewMode('kanban')}
              className="px-3"
            >
              <Layout className="h-4 w-4" />
            </Button>
          </div>
          
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Task Templates</DialogTitle>
                <DialogDescription>
                  Choose from pre-built templates or create your own
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {/* Sample Template Cards */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-clinical-sky/20 text-clinical-sky-foreground">
                        Endo
                      </Badge>
                      <Clock4 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">Endo Operatory Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete microscope and endo equipment preparation
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center text-muted-foreground">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        5 checklist items
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Repeat className="h-3 w-3 mr-1" />
                        Daily
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-clinical-mint/20 text-clinical-mint-foreground">
                        Cleaning
                      </Badge>
                      <Clock4 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">Morning Sterilization</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete morning sterilization and setup routine
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center text-muted-foreground">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        8 checklist items
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Repeat className="h-3 w-3 mr-1" />
                        Daily
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Build a comprehensive task for your clinic team
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateTask} className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Task Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter a clear, descriptive title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Provide detailed instructions..."
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Checklist Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Checklist Items</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItem: ChecklistItem = {
                          id: Math.random().toString(36).substr(2, 9),
                          text: '',
                          completed: false
                        };
                        setChecklist([...checklist, newItem]);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  
                  {checklist.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-muted/20">
                      {checklist.map((item, index) => (
                        <div key={item.id} className="group flex items-center space-x-2 p-2 rounded-md hover:bg-background/50 transition-colors">
                          <div className="flex items-center space-x-2 cursor-move" title="Drag to reorder">
                            <div className="flex flex-col space-y-0.5">
                              <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                              <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                              <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                            </div>
                            <CheckSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          <Input
                            value={item.text}
                            onChange={(e) => {
                              const updated = [...checklist];
                              updated[index].text = e.target.value;
                              setChecklist(updated);
                            }}
                            placeholder={`Step ${index + 1}...`}
                            className="flex-1 h-8 border-0 bg-transparent focus:bg-background focus:border-input"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setChecklist(checklist.filter((_, i) => i !== index));
                            }}
                            className="p-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove item"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Task Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                      <SelectTrigger>
                        <Tag className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Setup">⚙️ Setup</SelectItem>
                        <SelectItem value="Cleaning">🧼 Cleaning</SelectItem>
                        <SelectItem value="Sterilization">🔬 Sterilization</SelectItem>
                        <SelectItem value="Labs">🧪 Labs</SelectItem>
                        <SelectItem value="Admin">📋 Admin</SelectItem>
                        <SelectItem value="Patient Care">🏥 Patient Care</SelectItem>
                        <SelectItem value="Equipment">🔧 Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Assign To</Label>
                    <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}>
                      <SelectTrigger>
                        <Users className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">🔓 Leave Unassigned</SelectItem>
                        {assistants.map((assistant) => (
                          <SelectItem key={assistant.id} value={assistant.id}>
                            👤 {assistant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Suggested Due Time</Label>
                    <Select value={newTask['due-type']} onValueChange={(value) => setNewTask({ ...newTask, 'due-type': value })}>
                      <SelectTrigger>
                        <Clock4 className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Before Opening">🌅 Before Opening</SelectItem>
                        <SelectItem value="Before 1PM">🕐 Before 1PM</SelectItem>
                        <SelectItem value="EoD">🌆 End of Day</SelectItem>
                        <SelectItem value="EoW">📅 End of Week</SelectItem>
                        <SelectItem value="EoM">🗓️ End of Month</SelectItem>
                        <SelectItem value="Custom">⏰ Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Recurrence</Label>
                    <Select value={newTask.recurrence} onValueChange={(value) => setNewTask({ ...newTask, recurrence: value })}>
                      <SelectTrigger>
                        <Repeat className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">🚫 None</SelectItem>
                        <SelectItem value="daily">📅 Daily</SelectItem>
                        <SelectItem value="weekly">📆 Weekly</SelectItem>
                        <SelectItem value="biweekly">🗓️ Biweekly</SelectItem>
                        <SelectItem value="monthly">📝 Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2">
                  <Label htmlFor="owner-notes" className="text-sm font-medium">🗒️ Notes or Tips</Label>
                  <Textarea
                    id="owner-notes"
                    value={newTask.owner_notes}
                    onChange={(e) => setNewTask({ ...newTask, owner_notes: e.target.value })}
                    placeholder="Add helpful tips or special instructions for your team..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional guidance that will help your team complete this task successfully
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Task
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Task Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Tasks ({filteredTasks.length})</span>
            <Badge variant="outline" className="text-xs">
              {taskViewMode === 'table' ? 'Table View' : 'Kanban View'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {tasks.length === 0 
                  ? "Create your first task to get started"
                  : "Try adjusting your search or filters"
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            </div>
          ) : taskViewMode === 'table' ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{task.title}</h4>
                          <Badge 
                            variant={task.status === 'Done' ? 'default' : task.status === 'To Do' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {task.status === 'Done' ? '✅' : task.status === 'To Do' ? '⏳' : '🔄'} {task.status}
                          </Badge>
                          
                          {task.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.category === 'Cleaning' && '🧼'}
                              {task.category === 'Setup' && '⚙️'}
                              {task.category === 'Labs' && '🧪'}
                              {task.category === 'Patient Care' && '🏥'}
                              {task.category === 'Administrative' && '📋'}
                              {task.category === 'Equipment' && '🔧'}
                              {task.category}
                            </Badge>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            Due: {task['due-type']}
                          </span>
                          
                          {task.recurrence && task.recurrence !== 'none' && (
                            <span className="flex items-center">
                              <Repeat className="h-3 w-3 mr-1" />
                              {task.recurrence}
                            </span>
                          )}
                          
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {task.assigned_to 
                              ? assistants.find(a => a.id === task.assigned_to)?.name || 'Unknown'
                              : 'Unassigned'
                            }
                          </span>
                        </div>
                        
                        {task.owner_notes && (
                          <div className="mt-2 p-2 bg-clinical-sky/10 rounded text-xs">
                            <strong>Owner Notes:</strong> {task.owner_notes}
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Kanban View */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['To Do', 'In Progress', 'Done'].map(status => (
                <div key={status} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">
                      {status} ({tasks.filter(t => t.status === status).length})
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'To Do' ? 'bg-clinical-orange' :
                      status === 'In Progress' ? 'bg-clinical-sky' :
                      'bg-clinical-green'
                    }`} />
                  </div>
                  
                  <div className="space-y-3 min-h-[400px] p-2 bg-muted/30 rounded-lg">
                    {filteredTasks.filter(task => task.status === status).map(task => (
                      <Card key={task.id} className="cursor-move hover:shadow-sm transition-shadow">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            
                            {task.category && (
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              Due: {task['due-type']}
                            </div>
                            
                            {task.assigned_to && (
                              <div className="flex items-center space-x-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs">
                                    {assistants.find(a => a.id === task.assigned_to)?.name?.slice(0, 2) || 'UN'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {assistants.find(a => a.id === task.assigned_to)?.name || 'Unknown'}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksTab;