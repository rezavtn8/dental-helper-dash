import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Calendar, List } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Task, Assistant } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';
import TodaysTasksTab from './TodaysTasksTab';
import TaskCalendar from '../owner/TaskCalendar';

interface TasksTabProps {
  tasks: Task[];
  assistants: Assistant[];
  onTaskUpdate?: () => void;
  onTaskClick?: (task: Task) => void;
  onTaskStatusUpdate?: (taskId: string, newStatus: TaskStatus) => void;
  onTaskReschedule?: (taskId: string, newDate: Date) => void;
}

export default function TasksTab({ 
  tasks, 
  assistants, 
  onTaskUpdate, 
  onTaskClick,
  onTaskStatusUpdate,
  onTaskReschedule 
}: TasksTabProps) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Filter tasks to show only assigned to current user or unassigned
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.assigned_to === userProfile?.id || 
      task.assigned_to === null || 
      task.assigned_to === undefined
    );
  }, [tasks, userProfile?.id]);

  // Show connect to clinic message if no clinic access
  if (!userProfile?.clinic_id) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect to a Clinic</h3>
            <p className="text-muted-foreground mb-4">
              To view and manage your tasks, you need to join a clinic first.
            </p>
            <Button onClick={() => navigate('/join')} className="mb-2">
              Join a Clinic
            </Button>
            <Button variant="outline" onClick={() => navigate('/hub')}>
              Go to Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleTaskClick = (task: Task) => {
    onTaskClick?.(task);
  };

  const handleTaskStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    onTaskStatusUpdate?.(taskId, newStatus);
  };

  const handleTaskReschedule = (taskId: string, newDate: Date) => {
    onTaskReschedule?.(taskId, newDate);
  };

  const handleDayClick = (date: Date) => {
    // Could be used to create new tasks on specific dates
    setSelectedDate(date);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Today's Tasks
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-6">
          <TodaysTasksTab tasks={filteredTasks} onTaskUpdate={onTaskUpdate} />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
          <div className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Tasks Calendar</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'daily' ? 'default' : 'outline'}
                  onClick={() => setViewMode('daily')}
                >
                  Day
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'weekly' ? 'default' : 'outline'}
                  onClick={() => setViewMode('weekly')}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setViewMode('monthly')}
                >
                  Month
                </Button>
              </div>
            </div>

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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}