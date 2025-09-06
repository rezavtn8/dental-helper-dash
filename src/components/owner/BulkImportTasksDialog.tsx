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
    ['title', 'description', 'category', 'specialty', 'due_type', 'recurrence', 'priority', 'owner_notes', 'assigned_to_email'],
    ['Morning Opening Routine', 'Complete checklist for opening the clinic', 'operational', 'daily_opening', 'before_opening', 'daily', 'high', 'Must be completed before first patient', 'assistant@clinic.com'],
    ['Equipment Check', 'Daily equipment maintenance check', 'operational', 'equipment_check', 'anytime', 'daily', 'medium', 'Check all equipment is functioning', ''],
    ['Weekly Deep Clean', 'Thorough cleaning of all areas', 'operational', 'weekly_deep_clean', 'end_of_week', 'weekly', 'medium', 'Schedule for Friday evenings', 'cleaning@clinic.com']
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
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV must contain at least a header row and one data row');
      }

      const headers = parseCsvRow(lines[0]).map(h => h.replace(/"/g, '').toLowerCase());
      const requiredHeaders = ['title'];
      
      if (!requiredHeaders.every(header => headers.includes(header))) {
        throw new Error('CSV must contain at least a "title" column');
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const tasks = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvRow(lines[i]).map(v => v.replace(/"/g, ''));
        const taskData: any = {
          clinic_id: clinicId,
          created_by: user.user.id,
        };

        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value) {
            switch (header) {
              case 'title':
                taskData.title = value;
                break;
              case 'description':
                taskData.description = value;
                break;
              case 'category':
                taskData.category = value;
                break;
              case 'specialty':
                taskData.specialty = value;
                break;
              case 'due_type':
                taskData['due-type'] = value;
                break;
              case 'recurrence':
                taskData.recurrence = value;
                break;
              case 'priority':
                taskData.priority = value;
                break;
              case 'owner_notes':
                taskData.owner_notes = value;
                break;
              case 'assigned_to_email':
                // We'll handle email-to-user lookup later
                taskData.assigned_to_email = value;
                break;
            }
          }
        });

        if (taskData.title) {
          tasks.push(taskData);
        }
      }

      // Look up assigned users by email
      const emails = tasks.map(t => t.assigned_to_email).filter(Boolean);
      let userEmailMap: Record<string, string> = {};
      
      if (emails.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, email')
          .eq('clinic_id', clinicId)
          .in('email', emails);
        
        if (users) {
          userEmailMap = users.reduce((acc, user) => {
            acc[user.email] = user.id;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Convert email assignments to user IDs
      const finalTasks = tasks.map(task => {
        const { assigned_to_email, ...taskWithoutEmail } = task;
        return {
          ...taskWithoutEmail,
          assigned_to: assigned_to_email ? userEmailMap[assigned_to_email] || null : null,
          status: 'pending',
          'due-date': null
        };
      });

      const { error } = await supabase
        .from('tasks')
        .insert(finalTasks);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${finalTasks.length} task(s)`,
      });

      setCsvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Invalid CSV format",
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
            Bulk Import Tasks
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
                Download the CSV template, fill it with your tasks, and then upload it back to create multiple tasks at once.
              </p>
              
              <div className="bg-muted p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">CSV Columns:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>title:</strong> Task name (required)</li>
                  <li><strong>description:</strong> Task details</li>
                  <li><strong>category:</strong> operational, specialty, training, calendar</li>
                  <li><strong>specialty:</strong> daily_opening, daily_closing, weekly_deep_clean, etc.</li>
                  <li><strong>due_type:</strong> before_opening, before_1pm, end_of_day, anytime</li>
                  <li><strong>recurrence:</strong> daily, weekly, monthly, once</li>
                  <li><strong>priority:</strong> high, medium, low</li>
                  <li><strong>owner_notes:</strong> Instructions for the task</li>
                  <li><strong>assigned_to_email:</strong> Email of team member to assign</li>
                </ul>
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
                Upload your completed CSV file to create all the tasks at once. Make sure to follow the template format.
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
                {importing ? 'Importing...' : 'Import Tasks'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}