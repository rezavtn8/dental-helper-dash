import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getPriorityStyles } from '@/lib/taskUtils';
import { 
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  User
} from 'lucide-react';

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
}

interface Assistant {
  id: string;
  name: string;
  email: string;
}

interface OwnerTasksProps {
  tasks: Task[];
  assistants: Assistant[];
  onTaskUpdate: () => void;
}

const OwnerTasks: React.FC<OwnerTasksProps> = ({ tasks, assistants, onTaskUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const reassignTask = async (taskId: string, assistantId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: assistantId === 'unassigned' ? null : assistantId })
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success("Task assignment updated!");
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error reassigning task:', error);
      toast.error("Failed to reassign task");
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Clock;
    }
  };

  const getAssignedAssistant = (assistantId: string | null) => {
    if (!assistantId) return 'Unassigned';
    const assistant = assistants.find(a => a.id === assistantId);
    return assistant?.name || 'Unknown';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters - Modern Design */}
      <div className="bg-gradient-to-r from-background to-background/50 p-6 rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
            <Input
              placeholder="Search tasks by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base bg-background/80 border-border/50 focus:bg-background transition-all duration-200 rounded-xl shadow-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-w-[140px] h-12 bg-background/80 border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-xl">
                <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                <SelectItem value="To Do" className="rounded-lg">📋 To Do</SelectItem>
                <SelectItem value="In Progress" className="rounded-lg">⚡ In Progress</SelectItem>
                <SelectItem value="Done" className="rounded-lg">✅ Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="min-w-[140px] h-12 bg-background/80 border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <SelectValue placeholder="Priority" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-xl">
                <SelectItem value="all" className="rounded-lg">All Priority</SelectItem>
                <SelectItem value="high" className="rounded-lg">🔴 High</SelectItem>
                <SelectItem value="medium" className="rounded-lg">🟡 Medium</SelectItem>
                <SelectItem value="low" className="rounded-lg">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Filter Summary */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            {filteredTasks.length} of {tasks.length} tasks shown
          </span>
          {(statusFilter !== 'all' || priorityFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="text-xs px-3 py-1 h-6 rounded-full hover:bg-primary/10 hover:text-primary"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Tasks Grid - Enhanced Design */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="border-dashed border-2 border-muted/50 bg-gradient-to-br from-muted/20 to-background">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {tasks.length === 0 ? 'No Tasks Yet' : 'No Matching Tasks'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {tasks.length === 0 
                  ? 'Get started by creating your first task to organize your clinic operations.'
                  : 'Try adjusting your search criteria or filters to find the tasks you\'re looking for.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const PriorityIcon = getPriorityIcon(task.priority);
            const statusColor = 
              task.status === 'Done' ? 'bg-green-50 border-green-200 text-green-800' :
              task.status === 'In Progress' ? 'bg-orange-50 border-orange-200 text-orange-800' :
              'bg-blue-50 border-blue-200 text-blue-800';
            
            const priorityColor = 
              task.priority === 'high' ? 'bg-red-50 border-red-200 text-red-800' :
              task.priority === 'low' ? 'bg-green-50 border-green-200 text-green-800' :
              'bg-yellow-50 border-yellow-200 text-yellow-800';

            return (
              <Card 
                key={task.id} 
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-background to-background/80 backdrop-blur-sm"
              >
                {/* Priority Indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  task.priority === 'high' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                  task.priority === 'low' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  'bg-gradient-to-r from-yellow-400 to-yellow-600'
                }`}></div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-200">
                          {task.title}
                        </h3>
                        <Badge className={`${priorityColor} font-semibold text-xs px-3 py-1 border-2 shadow-sm`}>
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {task.priority?.toUpperCase()}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {task.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-6">
                      <Badge className={`${statusColor} font-semibold text-sm px-4 py-2 border-2 shadow-sm rounded-full`}>
                        {task.status === 'Done' && <CheckCircle className="h-4 w-4 mr-2" />}
                        {task.status === 'In Progress' && <Clock className="h-4 w-4 mr-2" />}
                        {task.status === 'To Do' && <AlertTriangle className="h-4 w-4 mr-2" />}
                        {task.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Task Metadata */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">{task['due-type']}</span>
                    </div>
                    {task.category && (
                      <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span>{task.category}</span>
                      </div>
                    )}
                    {task.recurrence && task.recurrence !== 'none' && (
                      <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-primary font-medium">Repeats {task.recurrence}</span>
                      </div>
                    )}
                  </div>

                  {/* Assignment Section */}
                  <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/30">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Assigned to</p>
                        <p className="font-semibold text-foreground">{getAssignedAssistant(task.assigned_to)}</p>
                      </div>
                    </div>
                    
                    <Select 
                      value={task.assigned_to || 'unassigned'} 
                      onValueChange={(value) => reassignTask(task.id, value)}
                    >
                      <SelectTrigger className="min-w-[160px] h-10 bg-background border-border/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                        <SelectValue placeholder="Reassign task" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50 shadow-xl">
                        <SelectItem value="unassigned" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-3 w-3 text-muted-foreground" />
                            </div>
                            Unassigned
                          </div>
                        </SelectItem>
                        {assistants.map((assistant) => (
                          <SelectItem key={assistant.id} value={assistant.id} className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">
                                  {assistant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                              {assistant.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OwnerTasks;