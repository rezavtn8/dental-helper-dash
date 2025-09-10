import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Task, Assistant } from '@/types/task';
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
import { TaskCard } from './TaskCard';

interface TasksTabProps {
  tasks: Task[];
  assistants: Assistant[];
  onTaskUpdate?: () => void;
  onTaskClick?: (task: Task) => void;
}

export default function TasksTab({ 
  tasks, 
  assistants, 
  onTaskUpdate, 
  onTaskClick
}: TasksTabProps) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Filter tasks to show only assigned to current user or unassigned
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.assigned_to === userProfile?.id || 
      task.assigned_to === null || 
      task.assigned_to === undefined
    );
  }, [tasks, userProfile?.id]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    return getTasksForDate(filteredTasks, selectedDate);
  }, [filteredTasks, selectedDate]);

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

  // Show connect to clinic message if no clinic access

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Task Calendar</h2>
            <Badge variant="secondary">
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
            </Badge>
          </div>
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
            <h3 className="font-semibold">
              {viewMode === 'day' 
                ? format(selectedDate, 'EEEE, MMM d, yyyy')
                : `${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`
              }
            </h3>
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
        <div className="space-y-3">
          {selectedDateTasks.length > 0 ? (
            selectedDateTasks.map((task, index) => (
              <TaskCard 
                key={`${task.id}-${index}`} 
                task={task} 
                assistants={assistants}
                onTaskUpdate={onTaskUpdate}
              />
            ))
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
            const dayTasks = getTasksForDate(filteredTasks, date);
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