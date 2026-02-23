import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Building,
  CheckSquare,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { getTasksForDate } from '@/lib/taskUtils';
import { useOptimizedTasks } from '@/hooks/useOptimizedTasks';
import { OptimizedTaskCard } from './OptimizedTaskCard';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export default function AssistantTasksTab() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { tasks, loading, updateTask, refreshTasks } = useOptimizedTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [assistants, setAssistants] = useState<any[]>([]);

  // Fetch assistants for proper name display
  useEffect(() => {
    const fetchAssistants = async () => {
      if (!userProfile?.clinic_id) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role, is_active')
          .eq('clinic_id', userProfile.clinic_id)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setAssistants(data || []);
      } catch (error) {
        console.error('Error fetching assistants:', error);
      }
    };

    fetchAssistants();
  }, [userProfile?.clinic_id]);

  // Show connect to clinic message if no clinic access
  if (!userProfile?.clinic_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect to a Clinic</h3>
            <p className="text-muted-foreground mb-4">
              You need to join a clinic to access tasks.
            </p>
            <Button onClick={() => navigate('/join-clinic')}>
              Join a Clinic
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Advanced task categorization with comprehensive deduplication
  const categorizedTasks = useMemo(() => {
    const dayTasks = getTasksForDate(tasks, selectedDate);
    
    // Use Maps for absolute deduplication based on base task ID
    const unassignedMap = new Map<string, Task>();
    const assignedClaimedMap = new Map<string, Task>();
    const completedMap = new Map<string, Task>();
    
    dayTasks.forEach(task => {
      const baseTaskId = task.id.includes('_') ? task.id.split('_')[0] : task.id;
      
      if (task.status === 'completed') {
        if (task.assigned_to === userProfile?.id || 
            task.claimed_by === userProfile?.id || 
            task.completed_by === userProfile?.id) {
          const existing = completedMap.get(baseTaskId);
          if (!existing || 
              new Date(task.completed_at || task.updated_at || task.created_at) > 
              new Date(existing.completed_at || existing.updated_at || existing.created_at)) {
            completedMap.set(baseTaskId, task);
          }
        }
      } else {
        if (!task.assigned_to && !task.claimed_by) {
          const existing = unassignedMap.get(baseTaskId);
          if (!existing || 
              new Date(task.updated_at || task.created_at) > 
              new Date(existing.updated_at || existing.created_at)) {
            unassignedMap.set(baseTaskId, task);
          }
        } else if (task.assigned_to === userProfile?.id || task.claimed_by === userProfile?.id) {
          const existing = assignedClaimedMap.get(baseTaskId);
          if (!existing || 
              new Date(task.updated_at || task.created_at) > 
              new Date(existing.updated_at || existing.created_at)) {
            assignedClaimedMap.set(baseTaskId, task);
          }
        }
      }
    });
    
    return {
      unassigned: Array.from(unassignedMap.values()),
      assignedClaimed: Array.from(assignedClaimedMap.values()),
      completed: Array.from(completedMap.values()),
      total: unassignedMap.size + assignedClaimedMap.size + completedMap.size
    };
  }, [tasks, selectedDate, userProfile?.id]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-slate-600">Manage your daily tasks and assignments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {categorizedTasks.total} tasks for {format(selectedDate, 'MMM d')}
          </Badge>
          <Button
            onClick={refreshTasks}
            disabled={loading}
            variant="outline"
            size="sm"
            className="min-w-[80px]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-64 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tasks Content */}
      <div className="grid gap-6">
        {/* Unassigned Tasks */}
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Target className="w-5 h-5 mr-2" />
              Available Tasks
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                {categorizedTasks.unassigned.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Tasks available for you to claim and complete
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorizedTasks.unassigned.map((task) => (
                <OptimizedTaskCard
                  key={`unassigned-${task.id}-${selectedDate.toISOString().split('T')[0]}`}
                  task={task}
                  assistants={assistants}
                  onUpdateTask={updateTask}
                />
              ))}
              {categorizedTasks.unassigned.length === 0 && (
                <div className="text-center py-8 text-orange-600">
                  <Target className="w-12 h-12 mx-auto mb-4 text-orange-300" />
                  <p>No unassigned tasks for this date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assigned/Claimed Tasks */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <CheckSquare className="w-5 h-5 mr-2" />
              My Tasks
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {categorizedTasks.assignedClaimed.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Tasks assigned to you or that you've claimed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorizedTasks.assignedClaimed.map((task) => (
                <OptimizedTaskCard
                  key={`assigned-${task.id}-${selectedDate.toISOString().split('T')[0]}`}
                  task={task}
                  assistants={assistants}
                  onUpdateTask={updateTask}
                />
              ))}
              {categorizedTasks.assignedClaimed.length === 0 && (
                <div className="text-center py-8 text-blue-600">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p>No assigned tasks for this date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Clock className="w-5 h-5 mr-2" />
              Completed Tasks
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                {categorizedTasks.completed.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Tasks you've completed today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorizedTasks.completed.map((task) => (
                <OptimizedTaskCard
                  key={`completed-${task.id}-${selectedDate.toISOString().split('T')[0]}`}
                  task={task}
                  assistants={assistants}
                  onUpdateTask={updateTask}
                />
              ))}
              {categorizedTasks.completed.length === 0 && (
                <div className="text-center py-8 text-green-600">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-green-300" />
                  <p>No completed tasks for this date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}