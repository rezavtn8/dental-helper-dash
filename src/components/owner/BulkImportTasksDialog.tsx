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
    ['title', 'description', 'category', 'priority', 'owner_notes'],
    ['Morning Opening Routine', 'Complete checklist for opening the clinic', 'operational', 'high', 'Must be completed before first patient'],
    ['Equipment Check', 'Daily equipment maintenance check', 'operational', 'medium', 'Check all equipment is functioning'],
    ['Weekly Deep Clean', 'Thorough cleaning of all areas', 'operational', 'medium', 'Schedule for Friday evenings'],
    ['Inventory Check', 'Count and order supplies', 'operational', 'low', 'Check stock levels and reorder as needed'],
    ['Patient Records Update', 'Update and file patient records', 'administrative', 'medium', 'Ensure all records are current and complete']
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

      // Get clinic name for template title
      const { data: clinic } = await supabase
        .from('clinics')
        .select('name')
        .eq('id', clinicId)
        .single();

      const checklistItems = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvRow(lines[i]).map(v => v.replace(/"/g, ''));
        const checklistItem: any = {
          id: `item-${i}`,
          completed: false,
        };

        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value) {
            switch (header) {
              case 'title':
                checklistItem.title = value;
                break;
              case 'description':
                checklistItem.description = value;
                break;
              case 'category':
                checklistItem.category = value;
                break;
              case 'priority':
                checklistItem.priority = value;
                break;
              case 'owner_notes':
                checklistItem.owner_notes = value;
                break;
            }
          }
        });

        if (checklistItem.title) {
          checklistItems.push(checklistItem);
        }
      }

      // Create a single template with all items as checklist
      const templateData = {
        title: `${clinic?.name || 'Custom'} Workflow Template`,
        description: `Bulk imported template with ${checklistItems.length} tasks`,
        category: 'operational',
        specialty: 'custom_workflow',
        'due-type': 'anytime',
        recurrence: 'once',
        priority: 'medium',
        owner_notes: 'Imported from CSV file',
        checklist: checklistItems,
        clinic_id: clinicId,
        created_by: user.user.id,
        is_active: true,
        is_enabled: true,
        start_date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('task_templates')
        .insert([templateData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully created template with ${checklistItems.length} checklist items`,
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
            Create Template from CSV
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
                Download the CSV template, fill it with checklist items, and upload it to create a single template with all items as a checklist.
              </p>
              
              <div className="bg-muted p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">CSV Columns:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>title:</strong> Checklist item name (required)</li>
                  <li><strong>description:</strong> Item details</li>
                  <li><strong>category:</strong> operational, administrative, clinical</li>
                  <li><strong>priority:</strong> high, medium, low</li>
                  <li><strong>owner_notes:</strong> Instructions for this checklist item</li>
                </ul>
                <div className="mt-3 p-3 bg-background rounded border">
                  <p className="text-sm font-medium">Note:</p>
                  <p className="text-sm text-muted-foreground">All CSV rows will be combined into a single template named after your clinic with each row becoming a checklist item.</p>
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
                Upload your completed CSV file to create a single template with all rows as checklist items. The template will be named after your clinic.
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