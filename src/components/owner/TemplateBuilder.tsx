import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface TaskTemplate {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  specialty?: string;
  checklist?: any;
  'due-type'?: string;
  recurrence?: string;
  owner_notes?: string;
}

interface TemplateTask {
  id?: string;
  title: string;
  description?: string;
  checklist?: { id: string; text: string; completed: boolean }[];
}

interface TemplateBuilderProps {
  clinicId: string;
  template?: TaskTemplate | null;
  onSave: () => void;
  onCancel: () => void;
}

const categoryOptions = [
  { value: 'specialty', label: 'Specialty' },
  { value: 'operational', label: 'Operational' },
  { value: 'training', label: 'Training' },
  { value: 'calendar', label: 'Calendar' },
];

const scenarioOptions = [
  { value: 'startup_day', label: 'Startup Day' },
  { value: 'monthly_maintenance', label: 'Monthly Maintenance' },
  { value: 'new_hire_week1', label: 'New Hire Week 1' },
  { value: 'weekly_deep_clean', label: 'Weekly Deep Clean' },
  { value: 'daily_opening', label: 'Daily Opening' },
  { value: 'daily_closing', label: 'Daily Closing' },
  { value: 'equipment_check', label: 'Equipment Check' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const timeOfDayOptions = [
  { value: 'before_opening', label: 'Before Opening' },
  { value: 'before_1pm', label: 'Before 1PM' },
  { value: 'end_of_day', label: 'End of Day' },
  { value: 'end_of_week', label: 'End of Week' },
  { value: 'anytime', label: 'Anytime' },
];

const recurrenceOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'none', label: 'One-time' },
];

export default function TemplateBuilder({ 
  clinicId, 
  template, 
  onSave, 
  onCancel 
}: TemplateBuilderProps) {
  const [formData, setFormData] = useState({
    title: template?.title || '',
    description: template?.description || '',
    category: template?.category || '',
    specialty: template?.specialty || '',
    priority: 'medium',
    timeOfDay: 'anytime',
    recurrence: template?.recurrence || 'none',
    ownerNotes: template?.owner_notes || '',
  });

  const [tasks, setTasks] = useState<TemplateTask[]>([
    { title: '', description: '', checklist: [] }
  ]);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (template?.checklist) {
      try {
        // Parse the existing template's tasks from checklist
        const existingTasks = Array.isArray(template.checklist) 
          ? template.checklist.map((task: any, index: number) => ({
              id: `task-${index}`,
              title: task.title || task.text || '',
              description: task.description || '',
              checklist: task.checklist || []
            }))
          : [{ title: '', description: '', checklist: [] }];
        
        setTasks(existingTasks);
      } catch (error) {
        console.error('Error parsing template checklist:', error);
      }
    }
  }, [template]);

  const addTask = () => {
    setTasks([...tasks, { title: '', description: '', checklist: [] }]);
  };

  const updateTask = (index: number, field: keyof TemplateTask, value: string) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const removeTask = (index: number) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const addChecklistItem = (taskIndex: number) => {
    const updated = [...tasks];
    if (!updated[taskIndex].checklist) {
      updated[taskIndex].checklist = [];
    }
    updated[taskIndex].checklist!.push({
      id: Date.now().toString(),
      text: '',
      completed: false
    });
    setTasks(updated);
  };

  const updateChecklistItem = (taskIndex: number, itemIndex: number, text: string) => {
    const updated = [...tasks];
    if (updated[taskIndex].checklist) {
      updated[taskIndex].checklist![itemIndex].text = text;
      setTasks(updated);
    }
  };

  const removeChecklistItem = (taskIndex: number, itemIndex: number) => {
    const updated = [...tasks];
    if (updated[taskIndex].checklist) {
      updated[taskIndex].checklist = updated[taskIndex].checklist!.filter((_, i) => i !== itemIndex);
      setTasks(updated);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    if (!tasks.some(task => task.title.trim())) {
      toast({
        title: "Error",
        description: "At least one task with a title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const templateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        specialty: formData.specialty,
        'due-type': formData.timeOfDay,
        recurrence: formData.recurrence,
        owner_notes: formData.ownerNotes,
        checklist: JSON.parse(JSON.stringify(tasks.filter(task => task.title.trim()))),
        clinic_id: clinicId,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      let error;
      if (template?.id) {
        // Update existing template
        ({ error } = await supabase
          .from('task_templates')
          .update(templateData)
          .eq('id', template.id));
      } else {
        // Create new template
        ({ error } = await supabase
          .from('task_templates')
          .insert(templateData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Template ${template?.id ? 'updated' : 'created'} successfully`,
      });

      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {template?.id ? 'Edit Template' : 'Create New Template'}
          </h2>
          <p className="text-muted-foreground">Build reusable task templates for your team</p>
        </div>
      </div>

      {/* Template Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Template Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Template Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Daily Opening Routine"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category Type</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Scenario Use Case</Label>
              <Select
                value={formData.specialty}
                onValueChange={(value) => setFormData({ ...formData, specialty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarioOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeOfDay">Suggested Time</Label>
              <Select
                value={formData.timeOfDay}
                onValueChange={(value) => setFormData({ ...formData, timeOfDay: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOfDayOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Template Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose and context of this template..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerNotes">Owner Notes</Label>
            <Textarea
              id="ownerNotes"
              value={formData.ownerNotes}
              onChange={(e) => setFormData({ ...formData, ownerNotes: e.target.value })}
              placeholder="Internal notes for team management..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tasks Builder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Template Tasks</CardTitle>
          <Button onClick={addTask} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.map((task, taskIndex) => (
            <div key={taskIndex} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline">Task {taskIndex + 1}</Badge>
                </div>
                {tasks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(taskIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Task Title *</Label>
                  <Input
                    value={task.title}
                    onChange={(e) => updateTask(taskIndex, 'title', e.target.value)}
                    placeholder="e.g., Turn on equipment"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Task Description</Label>
                  <Input
                    value={task.description || ''}
                    onChange={(e) => updateTask(taskIndex, 'description', e.target.value)}
                    placeholder="Optional instructions..."
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Checklist Items</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addChecklistItem(taskIndex)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Item
                  </Button>
                </div>

                {task.checklist?.map((item, itemIndex) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input
                      value={item.text}
                      onChange={(e) => updateChecklistItem(taskIndex, itemIndex, e.target.value)}
                      placeholder="Checklist item..."
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(taskIndex, itemIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">
                    No checklist items. Click "Add Item" to create subtasks.
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : template?.id ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
}