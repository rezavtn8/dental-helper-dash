import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkImportTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onImportComplete: () => void;
}

export default function BulkImportTasksDialog({ 
  open, 
  onOpenChange, 
  clinicId, 
  onImportComplete
}: BulkImportTasksDialogProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const csvTemplate = [
    ['title', 'description', 'category', 'specialty', 'due_type', 'recurrence', 'priority', 'owner_notes'],
    ['Morning Opening Routine', 'Complete checklist for opening the clinic', 'operational', 'daily_opening', 'before_opening', 'daily', 'high', 'Must be completed before first patient'],
    ['Equipment Check', 'Daily equipment maintenance check', 'operational', 'equipment_check', 'anytime', 'daily', 'medium', 'Check all equipment is functioning'],
    ['Weekly Deep Clean', 'Thorough cleaning of all areas', 'operational', 'weekly_deep_clean', 'end_of_week', 'weekly', 'medium', 'Schedule for Friday evenings'],
    ['Inventory Check', 'Count and order supplies', 'operational', 'custom_workflow', 'anytime', 'monthly', 'low', 'Check stock levels and reorder as needed'],
    ['Patient Records Update', 'Update and file patient records', 'administrative', 'custom_workflow', 'end_of_day', 'weekly', 'medium', 'Ensure all records are current and complete']
  ];

  const handleDownloadTemplate = () => {
    const csvContent = csvTemplate.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-import-template-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template downloaded successfully. Fill it out and upload to import tasks.",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCsvRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleImportCsv = async () => {
    if (!csvFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    let templateId: string | null = null;
    
    try {
      console.log('🚀 Starting CSV import process...');
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV must contain at least a header row and one data row');
      }

      const headers = parseCsvRow(lines[0]).map(h => h.replace(/"/g, '').toLowerCase().trim());
      console.log('📊 CSV Headers:', headers);
      
      const requiredHeaders = ['title'];
      if (!requiredHeaders.every(header => headers.includes(header))) {
        throw new Error('CSV must contain at least a "title" column');
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get clinic name for template title
      const { data: clinic } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', clinicId)
        .single();

      const tasks: any[] = [];
      let templateSettings = {
        category: 'operational',
        specialty: 'custom_workflow',
        'due-type': 'anytime',
        recurrence: 'once',
        priority: 'medium'
      };
      
      console.log('📝 Processing CSV rows...');
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvRow(lines[i]).map(v => v.replace(/"/g, '').trim());
        
        // Skip empty rows
        if (values.every(v => !v)) {
          console.log(`⚠️ Skipping empty row ${i}`);
          continue;
        }
        
        console.log(`📄 Processing row ${i}:`, values);
        
        const taskData: any = {
          clinic_id: clinicId,
          created_by: user.user.id,
          status: 'pending',
          generated_date: new Date().toISOString().split('T')[0]
        };

        // Process each column
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value) {
            switch (header) {
              case 'title':
                taskData.title = value;
                break;
              case 'description':
                taskData.description = value;
                // Create checklist from description
                taskData.checklist = [{
                  id: `item-1`,
                  title: value,
                  completed: false
                }];
                break;
              case 'category':
                taskData.category = value;
                if (i === 1) templateSettings.category = value;
                break;
              case 'specialty':
                // Specialty is only for template
                if (i === 1) templateSettings.specialty = value;
                break;
              case 'due_type':
                taskData['due-type'] = value;
                if (i === 1) templateSettings['due-type'] = value;
                break;
              case 'recurrence':
                taskData.recurrence = value;
                if (i === 1) templateSettings.recurrence = value;
                break;
              case 'priority':
                taskData.priority = value;
                if (i === 1) templateSettings.priority = value;
                break;
              case 'owner_notes':
                taskData.owner_notes = value;
                break;
            }
          }
        });

        // Validate and set defaults for required fields
        if (!taskData.title || taskData.title.length < 2) {
          console.log(`⚠️ Skipping row ${i} - invalid or missing title`);
          continue;
        }
        
        // Set defaults
        taskData.category = taskData.category || templateSettings.category;
        taskData['due-type'] = taskData['due-type'] || templateSettings['due-type'];
        taskData.recurrence = taskData.recurrence || templateSettings.recurrence;
        taskData.priority = taskData.priority || templateSettings.priority;
        taskData.description = taskData.description || '';
        taskData.owner_notes = taskData.owner_notes || '';

        console.log(`✅ Valid task data for row ${i}:`, taskData);
        tasks.push(taskData);
      }

      if (tasks.length === 0) {
        throw new Error('No valid tasks found in CSV. Make sure at least one row has a title.');
      }

      console.log(`📋 Processed ${tasks.length} valid tasks`);

      // Create template first
      const templateData = {
        title: `${clinic?.name || 'Custom'} Workflow Template - ${new Date().toLocaleDateString()}`,
        description: `Bulk imported template with ${tasks.length} tasks`,
        category: templateSettings.category,
        specialty: templateSettings.specialty,
        'due-type': templateSettings['due-type'],
        recurrence: templateSettings.recurrence,
        priority: templateSettings.priority,
        owner_notes: `Imported from CSV file "${csvFile.name}" on ${new Date().toLocaleDateString()}`,
        clinic_id: clinicId,
        created_by: user.user.id,
        is_active: true,
        is_enabled: true,
        start_date: new Date().toISOString().split('T')[0],
        tasks_count: 0 // Will be updated after task insertion
      };

      console.log('📄 Creating template:', templateData);

      const { data: newTemplate, error: templateError } = await supabase
        .from('task_templates')
        .insert([templateData])
        .select()
        .single();

      if (templateError) {
        console.error('❌ Template creation error:', templateError);
        throw new Error(`Failed to create template: ${templateError.message}`);
      }

      templateId = newTemplate.id;
      console.log('✅ Template created successfully:', newTemplate);

      // Add template_id to all tasks
      const tasksWithTemplate = tasks.map(task => ({
        ...task,
        template_id: newTemplate.id
      }));

      console.log('📤 Inserting tasks:', tasksWithTemplate);

      // Insert tasks in smaller batches to avoid issues
      const batchSize = 10;
      let insertedCount = 0;
      
      for (let i = 0; i < tasksWithTemplate.length; i += batchSize) {
        const batch = tasksWithTemplate.slice(i, i + batchSize);
        console.log(`📦 Inserting batch ${Math.floor(i/batchSize) + 1}:`, batch);
        
        const { data: insertedTasks, error: tasksError } = await supabase
          .from('tasks')
          .insert(batch)
          .select('id');

        if (tasksError) {
          console.error('❌ Task insertion error:', tasksError);
          throw new Error(`Failed to insert tasks (batch ${Math.floor(i/batchSize) + 1}): ${tasksError.message}`);
        }
        
        insertedCount += insertedTasks?.length || 0;
        console.log(`✅ Batch inserted successfully. Count: ${insertedTasks?.length}`);
      }

      console.log(`✅ All tasks inserted successfully. Total: ${insertedCount}`);

      // Manually update template task count as backup to trigger
      const { error: updateError } = await supabase
        .from('task_templates')
        .update({ tasks_count: insertedCount })
        .eq('id', newTemplate.id);

      if (updateError) {
        console.error('❌ Failed to update template count:', updateError);
        // Don't throw error here as tasks were created successfully
      } else {
        console.log(`✅ Template task count updated to ${insertedCount}`);
      }

      toast({
        title: "Success",
        description: `Successfully created template with ${insertedCount} tasks`,
      });

      setCsvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
      onImportComplete();
      
    } catch (error) {
      console.error('❌ Import error:', error);
      
      // If template was created but tasks failed, clean up the template
      if (templateId) {
        console.log('🧹 Cleaning up failed template...');
        await supabase.from('task_templates').delete().eq('id', templateId);
      }
      
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Invalid CSV format or data",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Create Template & Task from CSV
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Download Template</TabsTrigger>
            <TabsTrigger value="import">Upload CSV</TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 1: Download CSV Template</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download the CSV template, fill it with task details, and upload it to create a template with multiple tasks under it.
              </p>
              
              <div className="bg-muted p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">CSV Columns:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>title:</strong> Checklist item name (required)</li>
                  <li><strong>description:</strong> Item details</li>
                  <li><strong>category:</strong> operational, administrative, clinical</li>
                  <li><strong>specialty:</strong> daily_opening, daily_closing, weekly_deep_clean, etc.</li>
                  <li><strong>due_type:</strong> before_opening, before_1pm, end_of_day, anytime</li>
                  <li><strong>recurrence:</strong> daily, weekly, monthly, once</li>
                  <li><strong>priority:</strong> high, medium, low</li>
                  <li><strong>owner_notes:</strong> Instructions for this checklist item</li>
                </ul>
                <div className="mt-3 p-3 bg-background rounded border">
                  <p className="text-sm font-medium">Note:</p>
                  <p className="text-sm text-muted-foreground">Each CSV row will become a separate task under a single template with the first row's settings.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleDownloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 2: Upload Filled CSV</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your completed CSV file to create a template with multiple tasks. Each row will become a separate task under the template.
              </p>
            </div>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Select CSV File
                  </span>
                </Button>
              </label>
              {csvFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {csvFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportCsv} disabled={importing || !csvFile}>
                <Upload className="w-4 h-4 mr-2" />
                {importing ? 'Creating Template...' : 'Create Template'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}