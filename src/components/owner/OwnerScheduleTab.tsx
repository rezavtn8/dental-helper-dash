import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Clock,
  Filter,
  Eye
} from 'lucide-react';

interface Schedule {
  id: string;
  title: string;
  month: number;
  year: number;
  is_published: boolean;
  shifts: Shift[];
}

interface Shift {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  notes?: string;
  assistant_name?: string;
}

interface Assistant {
  id: string;
  name: string;
  email: string;
}

interface OwnerScheduleTabProps {
  clinicId: string;
}

export default function OwnerScheduleTab({ clinicId }: OwnerScheduleTabProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [assistantFilter, setAssistantFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [createShiftDialog, setCreateShiftDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newShift, setNewShift] = useState({
    user_id: '',
    start_time: '09:00',
    end_time: '17:00',
    break_minutes: 60,
    notes: ''
  });

  useEffect(() => {
    if (clinicId) {
      fetchData();
    }
  }, [clinicId, currentDate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assistants
      const { data: assistantsData, error: assistantsError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('clinic_id', clinicId)
        .eq('role', 'assistant')
        .eq('is_active', true);

      if (assistantsError) throw assistantsError;
      setAssistants(assistantsData || []);

      // Fetch schedules for current month
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('month', currentDate.getMonth() + 1)
        .eq('year', currentDate.getFullYear());

      if (schedulesError) throw schedulesError;

      // Fetch shifts separately to avoid complex joins
      if (schedulesData && schedulesData.length > 0) {
        const scheduleIds = schedulesData.map(s => s.id);
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .in('schedule_id', scheduleIds);

        if (shiftsError) throw shiftsError;

        // Add assistant names to shifts
        const shiftsWithAssistants = shiftsData?.map(shift => ({
          ...shift,
          assistant_name: assistantsData?.find(a => a.id === shift.user_id)?.name || 'Unknown'
        })) || [];

        // Group shifts by schedule
        const schedulesWithShifts = schedulesData.map(schedule => ({
          ...schedule,
          shifts: shiftsWithAssistants.filter(shift => shift.schedule_id === schedule.id)
        }));

        setSchedules(schedulesWithShifts);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async () => {
    if (!selectedDate || !newShift.user_id) {
      toast.error('Please select a date and assistant');
      return;
    }

    if (!user?.id) {
      toast.error('User authentication required');
      return;
    }

    try {
      // First, ensure we have a schedule for this month
      let schedule = schedules.find(s => 
        s.month === currentDate.getMonth() + 1 && 
        s.year === currentDate.getFullYear()
      );

      if (!schedule) {
        const { data: newScheduleData, error: scheduleError } = await supabase
          .from('schedules')
          .insert({
            clinic_id: clinicId,
            created_by: user.id, // Use current user ID
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            title: `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`,
            is_published: false
          })
          .select()
          .single();

        if (scheduleError) throw scheduleError;
        schedule = { ...newScheduleData, shifts: [] };
      }

      // Create the shift
      const { error: shiftError } = await supabase
        .from('shifts')
        .insert([{
          schedule_id: schedule.id,
          user_id: newShift.user_id,
          date: selectedDate,
          start_time: newShift.start_time,
          end_time: newShift.end_time,
          break_minutes: newShift.break_minutes,
          notes: newShift.notes
        }]);

      if (shiftError) throw shiftError;

      toast.success('Shift created successfully');
      setCreateShiftDialog(false);
      setNewShift({
        user_id: '',
        start_time: '09:00',
        end_time: '17:00',
        break_minutes: 60,
        notes: ''
      });
      setSelectedDate('');
      fetchData();
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error('Failed to create shift');
    }
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getShiftsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const allShifts = schedules.flatMap(schedule => schedule.shifts);
    const dayShifts = allShifts.filter(shift => shift.date === dateStr);
    
    if (assistantFilter !== 'all') {
      return dayShifts.filter(shift => shift.user_id === assistantFilter);
    }
    
    return dayShifts;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading schedule...</span>
      </div>
    );
  }

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Schedule Management</h3>
          <p className="text-muted-foreground">Manage shifts and schedules for your team</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: 'monthly' | 'weekly' | 'daily') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={createShiftDialog} onOpenChange={setCreateShiftDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assistant">Assistant</Label>
                  <Select value={newShift.user_id} onValueChange={(value) => setNewShift(prev => ({ ...prev, user_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assistant" />
                    </SelectTrigger>
                    <SelectContent>
                      {assistants.map(assistant => (
                        <SelectItem key={assistant.id} value={assistant.id}>
                          {assistant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={newShift.start_time}
                      onChange={(e) => setNewShift(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={newShift.end_time}
                      onChange={(e) => setNewShift(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break_minutes">Break Minutes</Label>
                  <Input
                    id="break_minutes"
                    type="number"
                    value={newShift.break_minutes}
                    onChange={(e) => setNewShift(prev => ({ ...prev, break_minutes: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="480"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={newShift.notes}
                    onChange={(e) => setNewShift(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateShiftDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateShift}>
                    Create Shift
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <Select value={assistantFilter} onValueChange={setAssistantFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Assistants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assistants</SelectItem>
                {assistants.map(assistant => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day, index) => (
              <div 
                key={index} 
                className={`min-h-24 p-1 border border-border ${
                  day ? 'hover:bg-muted/50 cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (day) {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    setSelectedDate(dateStr);
                    setCreateShiftDialog(true);
                  }
                }}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium mb-1">{day}</div>
                    <div className="space-y-1">
                      {getShiftsForDate(day).slice(0, 2).map((shift, shiftIndex) => (
                        <div 
                          key={shiftIndex}
                          className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate"
                          title={`${shift.assistant_name}: ${shift.start_time} - ${shift.end_time}`}
                        >
                          {shift.assistant_name}
                        </div>
                      ))}
                      {getShiftsForDate(day).length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{getShiftsForDate(day).length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Shifts</p>
                <p className="text-2xl font-bold">
                  {schedules.reduce((total, schedule) => total + schedule.shifts.length, 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Assistants</p>
                <p className="text-2xl font-bold">{assistants.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Schedules</p>
                <p className="text-2xl font-bold">
                  {schedules.filter(s => s.is_published).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}