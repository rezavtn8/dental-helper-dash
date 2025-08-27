import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
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
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                {tasks.length === 0 ? 'No tasks created yet.' : 'No tasks match your filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const PriorityIcon = getPriorityIcon(task.priority);
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge variant={getPriorityColor(task.priority)} className="flex items-center gap-1">
                        <PriorityIcon className="h-3 w-3" />
                        {task.priority}
                      </Badge>
                      <Badge variant={task.status === 'Done' ? 'secondary' : 'outline'}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task['due-type']}
                      </span>
                      {task.category && (
                        <span>Category: {task.category}</span>
                      )}
                      {task.recurrence && task.recurrence !== 'none' && (
                        <span>Repeats: {task.recurrence}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        {getAssignedAssistant(task.assigned_to)}
                      </span>
                      
                      <Select 
                        value={task.assigned_to || 'unassigned'} 
                        onValueChange={(value) => reassignTask(task.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Reassign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {assistants.map((assistant) => (
                            <SelectItem key={assistant.id} value={assistant.id}>
                              {assistant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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