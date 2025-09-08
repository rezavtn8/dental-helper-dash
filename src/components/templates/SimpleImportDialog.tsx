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
    const csvContent = `title,description,category,priority,due_type,recurrence,assigned_to,checklist_items
"Morning Opening","Complete opening checklist","operational","high","before_opening","daily","","Unlock doors|Turn on lights|Check equipment"
"Equipment Check","Daily equipment inspection","operational","medium","anytime","daily","","Test X-ray|Check suction|Verify autoclave"
"Weekly Deep Clean","Thorough cleaning","operational","medium","end_of_week","weekly","Dr. Smith","Clean operatories|Sanitize equipment|Mop floors"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'task-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded",
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
      // Read file
      const text = await file.text();
      const { headers, rows } = parseCSV(text);
      
      if (rows.length === 0) {
        throw new Error('No data rows found in CSV');
      }

      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Create template
      const templateName = file.name.replace('.csv', '');
      const { data: template, error: templateError } = await supabase
        .from('task_templates')
        .insert({
          title: templateName,
          description: `Imported from ${file.name}`,
          category: 'operational',
          priority: 'medium',
          'due-type': 'anytime',
          recurrence: 'once',
          clinic_id: clinicId,
          created_by: user.user.id,
          is_active: true,
          is_enabled: true,
          source_type: 'csv_import'
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Create tasks
      const tasksData = rows.map(row => {
        const task: any = {
          clinic_id: clinicId,
          created_by: user.user.id,
          template_id: template.id,
          status: 'pending',
          generated_date: new Date().toISOString().split('T')[0]
        };

        headers.forEach((header, index) => {
          const value = row[index]?.replace(/^"|"$/g, '').trim();
          if (!value) return;

          switch (header.toLowerCase()) {
            case 'title':
              task.title = value;
              break;
            case 'description':
              task.description = value;
              break;
            case 'category':
              task.category = value;
              break;
            case 'priority':
              task.priority = value;
              break;
            case 'due_type':
            case 'due-type':
              task['due-type'] = value;
              break;
            case 'recurrence':
              task.recurrence = value;
              break;
            case 'assigned_to':
            case 'assigned-to':
              // Simple: if it looks like a name, put it in owner_notes
              if (value && !value.includes('@') && !value.match(/^[0-9a-f-]{36}$/i)) {
                task.owner_notes = `Assigned to: ${value}`;
              }
              break;
            case 'checklist_items':
            case 'checklist-items':
              if (value) {
                const items = value.split('|').map((item, idx) => ({
                  id: `item-${idx + 1}`,
                  title: item.trim(),
                  completed: false
                }));
                task.checklist = items;
              }
              break;
            case 'owner_notes':
            case 'owner-notes':
              task.owner_notes = task.owner_notes ? `${task.owner_notes}\n${value}` : value;
              break;
          }
        });

        // Ensure required fields
        if (!task.title) task.title = 'Imported Task';
        if (!task.category) task.category = 'operational';
        if (!task.priority) task.priority = 'medium';
        if (!task['due-type']) task['due-type'] = 'anytime';
        if (!task.recurrence) task.recurrence = 'once';

        return task;
      });

      // Insert tasks
      const { data: createdTasks, error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksData)
        .select();

      if (tasksError) throw tasksError;

      // Update template task count
      await supabase
        .from('task_templates')
        .update({ tasks_count: createdTasks?.length || 0 })
        .eq('id', template.id);

      toast({
        title: "Import Successful",
        description: `Created ${createdTasks?.length || 0} tasks from ${templateName}`,
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