import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileJson, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onImportComplete: () => void;
  templates: any[];
}

export default function ImportTemplatesDialog({ 
  open, 
  onOpenChange, 
  clinicId, 
  onImportComplete,
  templates 
}: ImportTemplatesDialogProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const sampleTemplate = {
    title: "Morning Opening Routine",
    description: "Complete checklist for opening the clinic",
    category: "operational",
    specialty: "daily_opening",
    "due-type": "before_opening",
    recurrence: "daily",
    owner_notes: "Must be completed before first patient",
    is_enabled: true,
    start_date: new Date().toISOString().split('T')[0],
    checklist: [
      {
        id: "1",
        title: "Turn on all equipment",
        description: "Power on compressors, computers, and dental units",
        completed: false
      },
      {
        id: "2", 
        title: "Check sterilization equipment",
        description: "Verify autoclave completed cycle and check indicators",
        completed: false
      }
    ]
  };

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter JSON data to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      const templates = JSON.parse(jsonInput);
      const templatesArray = Array.isArray(templates) ? templates : [templates];
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const templatesWithMetadata = templatesArray.map(template => ({
        ...template,
        clinic_id: clinicId,
        created_by: user.user.id,
        is_active: true
      }));

      const { error } = await supabase
        .from('task_templates')
        .insert(templatesWithMetadata);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${templatesArray.length} template(s)`,
      });

      setJsonInput('');
      onOpenChange(false);
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    if (templates.length === 0) {
      toast({
        title: "No Templates",
        description: "No templates available to export",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      // Clean templates for export - remove internal fields
      const exportTemplates = templates.map(template => ({
        title: template.title,
        description: template.description,
        category: template.category,
        specialty: template.specialty,
        "due-type": template['due-type'],
        recurrence: template.recurrence,
        owner_notes: template.owner_notes,
        is_enabled: template.is_enabled,
        start_date: template.start_date,
        checklist: template.checklist
      }));

      const jsonData = JSON.stringify(exportTemplates, null, 2);
      
      // Create and download file
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `templates-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Exported ${exportTemplates.length} template(s) to JSON file`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export templates",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const loadSample = () => {
    setJsonInput(JSON.stringify([sampleTemplate], null, 2));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            Import & Export Templates
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import Templates</TabsTrigger>
            <TabsTrigger value="export">Export Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Paste JSON data for your templates. You can import a single template or an array of templates.
              </p>
              <Button variant="outline" size="sm" onClick={loadSample}>
                Load Sample Template
              </Button>
            </div>

            <Textarea
              placeholder="Paste your JSON template data here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={importing || !jsonInput.trim()}>
                <Upload className="w-4 h-4 mr-2" />
                {importing ? 'Importing...' : 'Import Templates'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Export your current templates as a JSON file. You can later import this file to restore or share your templates.
              </p>
              <p className="text-sm text-muted-foreground">
                Found {templates.length} template(s) to export.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={exporting || templates.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export Templates'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}