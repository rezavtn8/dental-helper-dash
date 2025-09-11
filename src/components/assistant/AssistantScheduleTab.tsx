import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  notes?: string;
}

interface Schedule {
  id: string;
  month: number;
  year: number;
  title?: string;
  notes?: string;
  is_published: boolean;
  shifts: Shift[];
}

export default function ScheduleTab() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Show connect to clinic message if no clinic access
  if (!userProfile?.clinic_id) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect to a Clinic</h3>
            <p className="text-muted-foreground mb-4">
              To view your schedule and shifts, you need to join a clinic first.
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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const fetchSchedule = async (month: number, year: number) => {
    if (!userProfile?.clinic_id) return;

    try {
      setLoading(true);
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .eq('clinic_id', userProfile.clinic_id)
        .eq('month', month)
        .eq('year', year)
        .eq('is_published', true)
        .maybeSingle();

      if (scheduleError) throw scheduleError;

      if (scheduleData) {
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .eq('schedule_id', scheduleData.id)
          .eq('user_id', userProfile.id)
          .order('date');

        if (shiftsError) throw shiftsError;

        setSchedule({
          ...scheduleData,
          shifts: shiftsData || []
        });
      } else {
        setSchedule(null);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(currentDate.getMonth() + 1, currentDate.getFullYear());
  }, [currentDate, userProfile]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getShiftForDate = (day: number) => {
    if (!schedule || !day) return null;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return schedule.shifts.find(shift => shift.date === dateStr);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }).map((_, i) => (
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">My Schedule</h1>
          <p className="text-slate-600">View your upcoming shifts and schedule</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Month Navigation */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {schedule && (
              <Badge variant="default" className="bg-blue-100 text-blue-700">
                <Calendar className="w-3 h-3 mr-1" />
                Schedule Published
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!schedule ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No Schedule Available</h3>
              <p className="text-slate-500 mb-4">
                The schedule for {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} hasn't been published yet.
              </p>
              <Badge variant="outline" className="text-slate-600">
                <Clock className="w-3 h-3 mr-1" />
                Waiting for owner to publish
              </Badge>
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-semibold text-slate-600 bg-slate-50 rounded">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, index) => {
                  const shift = getShiftForDate(day);
                  const isToday = day && 
                    new Date().getDate() === day && 
                    new Date().getMonth() === currentDate.getMonth() && 
                    new Date().getFullYear() === currentDate.getFullYear();

                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] p-2 border rounded-lg ${
                        !day ? 'bg-slate-50' : 
                        isToday ? 'bg-blue-50 border-blue-200' : 
                        shift ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {day && (
                        <>
                          <div className={`font-semibold text-sm mb-1 ${
                            isToday ? 'text-blue-700' : 'text-slate-700'
                          }`}>
                            {day}
                          </div>
                          {shift && (
                            <div className="space-y-1">
                              <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                              </div>
                              {shift.notes && (
                                <div className="text-xs text-slate-600 truncate">
                                  {shift.notes}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Schedule Info */}
              {schedule.notes && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-700 mb-2">Schedule Notes</h4>
                  <p className="text-slate-600">{schedule.notes}</p>
                </div>
              )}

              {/* Shift Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">{schedule.shifts.length}</p>
                        <p className="text-sm text-blue-600">Shifts This Month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">
                          {schedule.shifts.reduce((total, shift) => {
                            const start = new Date(`2000-01-01T${shift.start_time}`);
                            const end = new Date(`2000-01-01T${shift.end_time}`);
                            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                            return total + diff - (shift.break_minutes / 60);
                          }, 0).toFixed(1)}h
                        </p>
                        <p className="text-sm text-blue-600">Total Hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">
                          {Math.round(schedule.shifts.length / 4.33)}
                        </p>
                        <p className="text-sm text-blue-600">Shifts/Week Avg</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}