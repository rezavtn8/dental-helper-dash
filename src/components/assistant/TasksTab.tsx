import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Building, Calendar, ChevronLeft, ChevronRight, CalendarDays, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Assistant, Task } from '@/types/task';

import { getTasksForDate } from '@/lib/taskUtils';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
  addDays,
  subDays,
  isSameMonth
} from 'date-fns';
import { OptimizedTaskCard } from './OptimizedTaskCard';

interface TasksTabProps {
  assistants: Assistant[];
  tasks: Task[];
  loading?: boolean;
  onRefetch?: () => void;
  updateTask?: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
}

export default function TasksTab({ assistants, tasks, loading = false, onRefetch, updateTask }: TasksTabProps) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Organize tasks into three mutually exclusive categories
  const { unassignedTasks, assignedClaimedTasks, completedTasks } = useMemo(() => {
    console.log('🔍 Categorizing tasks:', {
      totalTasks: tasks.length,
      selectedDate: selectedDate.toDateString(),
      userProfileId: userProfile?.id
    });
    
    const todayTasks = getTasksForDate(tasks, selectedDate);
    console.log('📅 Tasks for selected date:', {
      todayTasksCount: todayTasks.length,
      todayTasks: todayTasks.map(t => ({ id: t.id, title: t.title, status: t.status, assigned_to: t.assigned_to, claimed_by: t.claimed_by, completed_by: t.completed_by }))
    });
    
    // Deduplicate tasks first by task ID
    const uniqueTasksMap = new Map();
    todayTasks.forEach(task => {
      uniqueTasksMap.set(task.id, task);
    });
    const uniqueTasks = Array.from(uniqueTasksMap.values());
    
    console.log('📋 After deduplication:', {
      originalCount: todayTasks.length,
      uniqueCount: uniqueTasks.length,
      duplicatesRemoved: todayTasks.length - uniqueTasks.length
    });
    
    // Now categorize into mutually exclusive groups
    const unassigned: Task[] = [];
    const assignedClaimed: Task[] = [];
    const completed: Task[] = [];
    
    uniqueTasks.forEach(task => {
      if (task.status === 'completed') {
        // Only show completed tasks that the current user was involved with
        if (task.assigned_to === userProfile?.id || 
            task.claimed_by === userProfile?.id || 
            task.completed_by === userProfile?.id) {
          completed.push(task);
        }
      } else {
        // For non-completed tasks
        if (!task.assigned_to && !task.claimed_by) {
          unassigned.push(task);
        } else if (task.assigned_to === userProfile?.id || task.claimed_by === userProfile?.id) {
          assignedClaimed.push(task);
        }
        // Tasks assigned to others are not shown
      }
    });
    
    console.log('📊 Final task categories:', {
      unassigned: unassigned.length,
      assignedClaimed: assignedClaimed.length,
      completed: completed.length,
      totalProcessed: uniqueTasks.length,
      totalCategorized: unassigned.length + assignedClaimed.length + completed.length
    });
    
    return { 
      unassignedTasks: unassigned, 
      assignedClaimedTasks: assignedClaimed, 
      completedTasks: completed 
    };
  }, [tasks, selectedDate, userProfile?.id]);

  const totalTasks = unassignedTasks.length + assignedClaimedTasks.length + completedTasks.length;

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-semibold">My Tasks</h2>
            <Badge variant="secondary">
              {totalTasks} task{totalTasks !== 1 ? 's' : ''}
            </Badge>
            {loading && (
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefetch}
              disabled={loading}
              className="h-7 px-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="flex gap-1 p-1 bg-muted rounded-md">
              <Button
                variant={viewMode === 'day' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('day')}
                className="h-7 px-3"
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('week')}
                className="h-7 px-3"
              >
                Week
              </Button>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(viewMode === 'day' ? subDays(selectedDate, 1) : subWeeks(selectedDate, 1))}
              className="h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="h-8 px-3 text-xs"
              disabled={isToday(selectedDate) && viewMode === 'day'}
            >
              Today
            </Button>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-semibold">
                {viewMode === 'day' 
                  ? format(selectedDate, 'EEEE, MMM d, yyyy')
                  : `${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`
                }
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {isToday(selectedDate) && viewMode === 'day' && (
              <Badge className="mt-1 bg-primary text-primary-foreground text-xs">Today</Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(viewMode === 'day' ? addDays(selectedDate, 1) : addWeeks(selectedDate, 1))}
            className="h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Tasks Display */}
      {viewMode === 'day' ? (
        <div className="space-y-6">
          {totalTasks > 0 ? (
            <>
              {/* Unassigned Tasks */}
              {unassignedTasks.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <h3 className="font-semibold text-orange-800">Unassigned Tasks</h3>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                      {unassignedTasks.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {unassignedTasks.map((task) => (
                      <OptimizedTaskCard 
                        key={task.id}
                        task={task} 
                        assistants={assistants}
                        onUpdateTask={updateTask!}
                      />
                    ))}
                  </div>
                </Card>
              )}

              {/* Assigned/Claimed Tasks */}
              {assignedClaimedTasks.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h3 className="font-semibold text-blue-800">My Assigned & Claimed Tasks</h3>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {assignedClaimedTasks.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {assignedClaimedTasks.map((task) => (
                      <OptimizedTaskCard 
                        key={task.id}
                        task={task} 
                        assistants={assistants}
                        onUpdateTask={updateTask!}
                      />
                    ))}
                  </div>
                </Card>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h3 className="font-semibold text-green-800">Completed Tasks</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {completedTasks.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {completedTasks.map((task) => (
                      <OptimizedTaskCard 
                        key={task.id}
                        task={task} 
                        assistants={assistants}
                        onUpdateTask={updateTask!}
                      />
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No tasks for today</h3>
                <p className="text-sm text-muted-foreground">
                  Enjoy your free time or check other dates for upcoming tasks.
                </p>
              </div>
            </Card>
          )}
        </div>
      ) : (
        // Week view
        <div className="grid grid-cols-7 gap-2">
          {eachDayOfInterval({
            start: startOfWeek(selectedDate),
            end: endOfWeek(selectedDate)
          }).map((date) => {
            const dayTasks = getTasksForDate(tasks.filter(task => 
              task.assigned_to === userProfile?.id || !task.assigned_to
            ), date);
            const isCurrentDate = isSameDay(date, selectedDate);
            const isCurrentMonth = isSameMonth(date, selectedDate);
            
            return (
              <Card 
                key={date.toISOString()} 
                className={`p-2 cursor-pointer transition-colors hover:shadow-md ${
                  isCurrentDate ? 'ring-2 ring-primary' : ''
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="text-center">
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(date) ? 'text-primary font-semibold' : 
                    isCurrentDate ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-lg font-semibold mb-2 ${
                    isToday(date) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' :
                    isCurrentDate ? 'text-primary' : ''
                  }`}>
                    {format(date, 'd')}
                  </div>
                  {dayTasks.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayTasks.length}
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}