import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Calendar, Settings, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ClinicSettings {
  id?: string;
  weekends_are_workdays: boolean;
}

interface HolidaySetting {
  id: string;
  holiday_name: string;
  holiday_date: string;
  end_date?: string;
  is_enabled: boolean;
  is_federal_holiday: boolean;
  is_custom: boolean;
  notes?: string;
}

interface CustomHolidayForm {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  notes: string;
}

export default function SchedulingSettings() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ClinicSettings>({
    weekends_are_workdays: false
  });
  const [holidays, setHolidays] = useState<HolidaySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customHoliday, setCustomHoliday] = useState<CustomHolidayForm>({
    name: '',
    startDate: undefined,
    endDate: undefined,
    notes: ''
  });

  useEffect(() => {
    if (userProfile?.clinic_id) {
      fetchSettings();
      fetchHolidays();
    }
  }, [userProfile?.clinic_id]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .eq('clinic_id', userProfile?.clinic_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load clinic settings.",
        variant: "destructive",
      });
    }
  };

  const fetchHolidays = async () => {
    try {
      const { data, error } = await supabase
        .from('holiday_settings')
        .select('*')
        .eq('clinic_id', userProfile?.clinic_id)
        .order('holiday_date', { ascending: true });

      if (error) throw error;

      setHolidays(data || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast({
        title: "Error",
        description: "Failed to load holiday settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeFederalHolidays = async () => {
    try {
      const { error } = await supabase.rpc('initialize_federal_holidays', {
        p_clinic_id: userProfile?.clinic_id
      });

      if (error) throw error;

      await fetchHolidays();
      toast({
        title: "Success",
        description: "Federal holidays have been initialized for your clinic.",
      });
    } catch (error) {
      console.error('Error initializing holidays:', error);
      toast({
        title: "Error",
        description: "Failed to initialize federal holidays.",
        variant: "destructive",
      });
    }
  };

  const saveWeekendSetting = async (enabled: boolean) => {
    if (!userProfile?.clinic_id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('clinic_settings')
        .upsert({
          clinic_id: userProfile.clinic_id,
          weekends_are_workdays: enabled
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, weekends_are_workdays: enabled }));
      toast({
        title: "Settings saved",
        description: `Weekend workdays ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error saving weekend setting:', error);
      toast({
        title: "Error",
        description: "Failed to save weekend setting.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleHoliday = async (holidayId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('holiday_settings')
        .update({ is_enabled: enabled })
        .eq('id', holidayId);

      if (error) throw error;

      setHolidays(prev => 
        prev.map(h => h.id === holidayId ? { ...h, is_enabled: enabled } : h)
      );

      toast({
        title: "Holiday updated",
        description: `Holiday ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating holiday:', error);
      toast({
        title: "Error",
        description: "Failed to update holiday setting.",
        variant: "destructive",
      });
    }
  };

  const addCustomHoliday = async () => {
    if (!customHoliday.name || !customHoliday.startDate || !userProfile?.clinic_id) {
      toast({
        title: "Error",
        description: "Please provide a name and start date for the custom holiday.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('holiday_settings')
        .insert({
          clinic_id: userProfile.clinic_id,
          holiday_name: customHoliday.name,
          holiday_date: format(customHoliday.startDate, 'yyyy-MM-dd'),
          end_date: customHoliday.endDate ? format(customHoliday.endDate, 'yyyy-MM-dd') : null,
          is_enabled: true,
          is_federal_holiday: false,
          is_custom: true,
          notes: customHoliday.notes || null
        });

      if (error) throw error;

      await fetchHolidays();
      setShowCustomForm(false);
      setCustomHoliday({
        name: '',
        startDate: undefined,
        endDate: undefined,
        notes: ''
      });

      toast({
        title: "Success",
        description: "Custom holiday added successfully.",
      });
    } catch (error) {
      console.error('Error adding custom holiday:', error);
      toast({
        title: "Error",
        description: "Failed to add custom holiday.",
        variant: "destructive",
      });
    }
  };

  const deleteCustomHoliday = async (holidayId: string) => {
    try {
      const { error } = await supabase
        .from('holiday_settings')
        .delete()
        .eq('id', holidayId);

      if (error) throw error;

      setHolidays(prev => prev.filter(h => h.id !== holidayId));
      toast({
        title: "Success",
        description: "Custom holiday deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast({
        title: "Error",
        description: "Failed to delete holiday.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const federalHolidays = holidays.filter(h => h.is_federal_holiday);
  const customHolidays = holidays.filter(h => h.is_custom);

  return (
    <div className="space-y-6">
      {/* Weekend Workday Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Weekend Workdays
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Are weekends workdays?</Label>
              <p className="text-sm text-muted-foreground">
                When disabled, tasks won't be generated on Saturdays and Sundays
              </p>
            </div>
            <Switch
              checked={settings.weekends_are_workdays}
              onCheckedChange={saveWeekendSetting}
              disabled={saving}
            />
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Current setting:</strong> Weekends are {settings.weekends_are_workdays ? 'workdays' : 'non-workdays'}
            <br />
            {!settings.weekends_are_workdays && (
              <span>• Recurring tasks (EOW, MidM, EOM) will skip weekends<br />• Daily logs and analytics will ignore weekends</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Holiday Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Holiday Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Federal Holidays */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">US Federal Holidays</h3>
              {federalHolidays.length === 0 && (
                <Button onClick={initializeFederalHolidays} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Initialize Federal Holidays
                </Button>
              )}
            </div>
            
            {federalHolidays.length > 0 ? (
              <div className="grid gap-3">
                {federalHolidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{holiday.holiday_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(holiday.holiday_date), 'MMMM d, yyyy')}
                        {holiday.end_date && (
                          <span> - {format(new Date(holiday.end_date), 'MMMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={holiday.is_enabled ? "default" : "secondary"}>
                        {holiday.is_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={holiday.is_enabled}
                        onCheckedChange={(enabled) => toggleHoliday(holiday.id, enabled)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No federal holidays configured. Click "Initialize Federal Holidays" to add them.
              </p>
            )}
          </div>

          {/* Custom Holidays */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Custom Holidays & Closures</h3>
              <Button 
                onClick={() => setShowCustomForm(true)} 
                variant="outline" 
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Holiday
              </Button>
            </div>

            {/* Custom Holiday Form */}
            {showCustomForm && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Add Custom Holiday</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="holiday-name">Holiday Name</Label>
                    <Input
                      id="holiday-name"
                      value={customHoliday.name}
                      onChange={(e) => setCustomHoliday(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., CE Day, Office Maintenance"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !customHoliday.startDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {customHoliday.startDate ? format(customHoliday.startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={customHoliday.startDate}
                            onSelect={(date) => setCustomHoliday(prev => ({ ...prev, startDate: date }))}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>End Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !customHoliday.endDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {customHoliday.endDate ? format(customHoliday.endDate, "PPP") : "Pick end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={customHoliday.endDate}
                            onSelect={(date) => setCustomHoliday(prev => ({ ...prev, endDate: date }))}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="holiday-notes">Notes (Optional)</Label>
                    <Textarea
                      id="holiday-notes"
                      value={customHoliday.notes}
                      onChange={(e) => setCustomHoliday(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this closure..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addCustomHoliday}>Add Holiday</Button>
                    <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Holidays List */}
            {customHolidays.length > 0 ? (
              <div className="grid gap-3">
                {customHolidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{holiday.holiday_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(holiday.holiday_date), 'MMMM d, yyyy')}
                        {holiday.end_date && (
                          <span> - {format(new Date(holiday.end_date), 'MMMM d, yyyy')}</span>
                        )}
                      </div>
                      {holiday.notes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {holiday.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={holiday.is_enabled ? "default" : "secondary"}>
                        {holiday.is_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={holiday.is_enabled}
                        onCheckedChange={(enabled) => toggleHoliday(holiday.id, enabled)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCustomHoliday(holiday.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No custom holidays configured. Add custom holidays or clinic closure dates.
              </p>
            )}
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>How it works:</strong>
            <br />
            • When a holiday is enabled, no tasks will be generated for that date
            <br />
            • Recurring tasks (EOW, MidM, EOM) will automatically skip enabled holidays
            <br />
            • Patient logs and analytics will ignore enabled holiday dates
            <br />
            • Multi-day closures are supported (set both start and end dates)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}