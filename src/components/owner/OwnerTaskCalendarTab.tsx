import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
import { RecurringTaskInstance, isRecurringInstance } from '@/lib/taskUtils';
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

  const handleTaskClick = async (task: Task | RecurringTaskInstance) => {
    if (isRecurringInstance(task)) {
      // For recurring instances, get the parent task
      try {
        const { data: parentTask, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', task.parentTaskId)
          .single();
          
        if (error) throw error;
        setSelectedTask(parentTask);
      } catch (error) {
        console.error('Error fetching parent task:', error);
        toast.error('Failed to load task details');
        return;
      }
    } else {
      setSelectedTask(task);
    }
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
    <div className="space-y-8">
      {/* Header - Enhanced Design */}
      <div className="bg-gradient-to-r from-background via-background/95 to-background/80 p-8 rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border border-primary/30">
                <CalendarIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Task Calendar</h3>
                <p className="text-muted-foreground text-base">Visual overview of task schedules and team assignments</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Task
            </Button>
          </div>
        </div>
      </div>

      {/* Controls - Modern Design */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
            {/* View Mode Toggle */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">View Mode</label>
              <div className="flex gap-2 p-2 bg-muted/50 rounded-xl border border-border/50">
                {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className={`capitalize px-4 py-2 rounded-lg transition-all duration-200 ${
                      viewMode === mode 
                        ? 'bg-primary text-primary-foreground shadow-md font-semibold' 
                        : 'hover:bg-background/50'
                    }`}
                  >
                    {mode === 'daily' && '📅'}
                    {mode === 'weekly' && '📆'}
                    {mode === 'monthly' && '🗓️'}
                    <span className="ml-2">{mode}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filter by Status</label>
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="min-w-[160px] h-11 bg-background/80 border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                  <SelectItem value="all" className="rounded-lg">🔍 All Tasks</SelectItem>
                  <SelectItem value="pending" className="rounded-lg">📋 To Do</SelectItem>
                  <SelectItem value="in-progress" className="rounded-lg">⚡ In Progress</SelectItem>
                  <SelectItem value="completed" className="rounded-lg">✅ Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Display */}
            <div className="flex items-center gap-6 ml-auto">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{filteredTasks.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Visible Tasks</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredTasks.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Completed</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredTasks.filter(t => t.status === 'in-progress').length}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">In Progress</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar - Enhanced Container */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-background/95 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8">
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