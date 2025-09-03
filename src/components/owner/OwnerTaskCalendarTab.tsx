import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
import TaskCalendar from './TaskCalendar';
import CreateTaskDialog from './CreateTaskDialog';
import TaskDetailModal from './TaskDetailModal';
import { Plus, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OwnerTaskCalendarTabProps {
  clinicId: string;
}

type ViewMode = 'daily' | 'weekly' | 'monthly';
type StatusFilter = 'all' | TaskStatus;

export default function OwnerTaskCalendarTab({ clinicId }: OwnerTaskCalendarTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState<Date | null>(null);

  useEffect(() => {
    if (clinicId) {
      fetchData();
    }
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
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleDayClick = (date: Date) => {
    setCreateTaskDate(date);
    setShowCreateTask(true);
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Task status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleTaskReschedule = async (taskId: string, newDate: Date) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ custom_due_date: newDate.toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Task rescheduled');
      fetchData();
    } catch (error) {
      console.error('Error rescheduling task:', error);
      toast.error('Failed to reschedule task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading task calendar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Task Calendar</h3>
          <p className="text-muted-foreground">Visual overview of task schedules and assignments</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tasks Count */}
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <TaskCalendar
            tasks={filteredTasks}
            assistants={assistants}
            viewMode={viewMode}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onTaskClick={handleTaskClick}
            onDayClick={handleDayClick}
            onTaskStatusUpdate={handleTaskStatusUpdate}
            onTaskReschedule={handleTaskReschedule}
          />
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          assistants={assistants}
          isOpen={showTaskDetail}
          onOpenChange={setShowTaskDetail}
          onTaskUpdated={() => {
            fetchData();
            setShowTaskDetail(false);
          }}
        />
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        assistants={assistants}
        onTaskCreated={() => {
          fetchData();
          setShowCreateTask(false);
        }}
        trigger={null}
        initialDate={createTaskDate}
        isOpen={showCreateTask}
        onOpenChange={setShowCreateTask}
      />
    </div>
  );
}