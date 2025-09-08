import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Download } from 'lucide-react';

interface SimpleImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onImportComplete: () => void;
}

export function SimpleImportDialog({ open, onOpenChange, clinicId, onImportComplete }: SimpleImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'title',
      'description', 
      'category',
      'priority',
      'due_type',
      'recurrence',
      'assigned_to',
      'checklist_items',
      'owner_notes'
    ];

    const sampleData = [
      [
        'Morning Opening Routine',
        'Complete all opening procedures before first patient',
        'operational',
        'high',
        'before_opening',
        'daily',
        'Front Desk Staff',
        'Unlock front door|Turn on all lights|Check temperature settings|Start coffee machine|Review daily schedule|Check supply levels',
        'Critical for smooth day operations'
      ],
      [
        'Equipment Safety Check',
        'Daily inspection of all dental equipment',
        'operational',
        'high',
        'before_opening',
        'daily',
        'Dr. Smith',
        'Test X-ray machine|Check suction units|Verify autoclave function|Inspect handpiece maintenance|Check emergency equipment',
        'Required by safety regulations'
      ],
      [
        'Patient Follow-up Calls',
        'Call patients to check on recovery and schedule follow-ups',
        'administrative',
        'medium',
        'anytime',
        'daily',
        'Office Manager',
        'Review yesterday appointments|Call post-surgery patients|Schedule follow-up appointments|Update patient records|Send treatment reminders',
        'Improve patient satisfaction and retention'
      ],
      [
        'Weekly Deep Cleaning',
        'Thorough sanitization of all treatment areas',
        'operational',
        'medium',
        'end_of_week',
        'weekly',
        'Hygienist Team',
        'Deep clean all operatories|Sanitize all equipment surfaces|Disinfect waiting area|Clean and organize supply rooms|Empty and sanitize waste containers',
        'Schedule for Friday after last patient'
      ],
      [
        'Monthly Inventory Check',
        'Complete inventory audit and restocking',
        'administrative',
        'medium',
        'end_of_week',
        'monthly',
        'Office Manager',
        'Count all supplies|Check expiration dates|Update inventory system|Place orders for low stock|Organize storage areas',
        'Schedule for last Friday of each month'
      ]
    ];

    // Create CSV content with proper escaping
    const csvRows = [headers, ...sampleData].map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = cell.replace(/"/g, '""');
        return /[",\n\r]/.test(cell) ? `"${escaped}"` : escaped;
      }).join(',')
    );

    const csvContent = csvRows.join('\n');
    
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
      description: "CSV template with examples has been downloaded",
    });
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line));
    
    return { headers, rows };
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
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

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    
    try {
      console.log('Starting import process...');
      
      // Read file
      const text = await file.text();
      console.log('File content:', text.substring(0, 200) + '...');
      
      const { headers, rows } = parseCSV(text);
      console.log('Parsed headers:', headers);
      console.log('Parsed rows count:', rows.length);
      
      if (rows.length === 0) {
        throw new Error('No data rows found in CSV');
      }

      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      console.log('Creating template...');
      
      // Create template
      const templateName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9\s]/g, '');
      const templateData = {
        title: templateName || 'Imported Template',
        description: `Imported from ${file.name} on ${new Date().toLocaleDateString()}`,
        category: 'operational',
        priority: 'medium',
        'due-type': 'anytime',
        recurrence: 'once',
        clinic_id: clinicId,
        created_by: user.user.id,
        is_active: true,
        is_enabled: true,
        source_type: 'csv_import',
        tasks_count: 0
      };

      const { data: template, error: templateError } = await supabase
        .from('task_templates')
        .insert(templateData)
        .select()
        .single();

      if (templateError) {
        console.error('Template creation error:', templateError);
        throw new Error(`Failed to create template: ${templateError.message}`);
      }

      console.log('Template created:', template);

      // Create tasks
      const tasksData: any[] = [];
      
      rows.forEach((row, rowIndex) => {
        const task: any = {
          clinic_id: clinicId,
          created_by: user.user.id,
          template_id: template.id,
          status: 'pending',
          generated_date: new Date().toISOString().split('T')[0],
          title: 'Untitled Task',
          category: 'operational',
          priority: 'medium',
          'due-type': 'anytime',
          recurrence: 'once'
        };

        headers.forEach((header, index) => {
          const value = row[index]?.replace(/^"|"$/g, '').trim();
          if (!value) return;

          const headerLower = header.toLowerCase().replace(/[_-]/g, '');

          switch (headerLower) {
            case 'title':
              task.title = value;
              break;
            case 'description':
              task.description = value;
              break;
            case 'category':
              const validCategories = ['operational', 'administrative', 'clinical', 'specialty', 'training', 'calendar'];
              task.category = validCategories.includes(value.toLowerCase()) ? value.toLowerCase() : 'operational';
              break;
            case 'priority':
              const validPriorities = ['low', 'medium', 'high'];
              task.priority = validPriorities.includes(value.toLowerCase()) ? value.toLowerCase() : 'medium';
              break;
            case 'duetype':
              const validDueTypes = ['before_opening', 'before_1pm', 'end_of_day', 'end_of_week', 'anytime'];
              const normalizedDueType = value.toLowerCase().replace(/-/g, '_');
              task['due-type'] = validDueTypes.includes(normalizedDueType) ? normalizedDueType : 'anytime';
              break;
            case 'recurrence':
              const validRecurrences = ['once', 'daily', 'weekly', 'biweekly', 'monthly'];
              task.recurrence = validRecurrences.includes(value.toLowerCase()) ? value.toLowerCase() : 'once';
              break;
            case 'assignedto':
              // Put assignment info in owner_notes
              if (value) {
                const assignmentNote = `Assigned to: ${value}`;
                task.owner_notes = task.owner_notes ? `${task.owner_notes}\n${assignmentNote}` : assignmentNote;
              }
              break;
            case 'checklistitems':
            case 'checklist':
              if (value) {
                const items = value.split('|').filter(item => item.trim()).map((item, idx) => ({
                  id: `item-${idx + 1}`,
                  title: item.trim(),
                  completed: false
                }));
                if (items.length > 0) {
                  task.checklist = items;
                }
              }
              break;
            case 'ownernotes':
              task.owner_notes = task.owner_notes ? `${task.owner_notes}\n${value}` : value;
              break;
          }
        });

        console.log(`Processed task ${rowIndex + 1}:`, task);
        tasksData.push(task);
      });

      console.log('Inserting tasks...', tasksData.length);

      if (tasksData.length === 0) {
        throw new Error('No valid tasks found to import');
      }

      // Insert tasks in smaller batches
      const batchSize = 5;
      const createdTasks: any[] = [];
      
      for (let i = 0; i < tasksData.length; i += batchSize) {
        const batch = tasksData.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}:`, batch);
        
        const { data: batchResult, error: batchError } = await supabase
          .from('tasks')
          .insert(batch)
          .select();

        if (batchError) {
          console.error('Batch insert error:', batchError);
          throw new Error(`Failed to insert tasks: ${batchError.message}`);
        }

        if (batchResult) {
          createdTasks.push(...batchResult);
          console.log(`Batch ${Math.floor(i/batchSize) + 1} inserted successfully`);
        }
      }

      console.log('All tasks created:', createdTasks.length);

      // Update template task count
      const { error: updateError } = await supabase
        .from('task_templates')
        .update({ tasks_count: createdTasks.length })
        .eq('id', template.id);

      if (updateError) {
        console.warn('Failed to update task count:', updateError);
      }

      toast({
        title: "Import Successful",
        description: `Created template "${template.title}" with ${createdTasks.length} tasks`,
      });

      onImportComplete();
      onOpenChange(false);
      setFile(null);

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Tasks from CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="mb-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!file ? (
              <div>
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <Button
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose CSV File
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium mb-2">{file.name}</p>
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import Tasks'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}