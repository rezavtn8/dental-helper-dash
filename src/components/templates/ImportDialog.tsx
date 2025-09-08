import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useTemplateImport } from '@/hooks/useTemplateImport';
import { Badge } from '@/components/ui/badge';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onImportComplete: () => void;
}

export function ImportDialog({ 
  open, 
  onOpenChange, 
  clinicId, 
  onImportComplete 
}: ImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    importFromFile, 
    downloadTemplate, 
    getSupportedFormats, 
    isImporting, 
    progress 
  } = useTemplateImport({
    clinicId,
    onSuccess: () => {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
      onImportComplete();
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const supportedFormats = getSupportedFormats();
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      
      if (supportedFormats.includes(fileExtension) || supportedFormats.includes(file.type)) {
        setSelectedFile(file);
      } else {
        // Reset input
        event.target.value = '';
        // Toast will be shown by the hook
      }
    }
  };

  const handleImport = async () => {
    if (selectedFile) {
      await importFromFile(selectedFile);
    }
  };

  const getProgressIcon = () => {
    if (!progress) return null;
    
    switch (progress.stage) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'parsing':
      case 'validating':
      case 'creating_template':
      case 'creating_tasks':
        return <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      parsing: 'Parsing File',
      validating: 'Validating Data',
      creating_template: 'Creating Template',
      creating_tasks: 'Creating Tasks',
      complete: 'Complete'
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Tasks & Template
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Download Template</TabsTrigger>
            <TabsTrigger value="import">Import File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Step 1: Download Template</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download our CSV template to get started. The template includes all the required columns 
                      and sample data to help you format your tasks correctly.
                    </p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Supported Columns:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <div><Badge variant="outline">title</Badge> <span className="text-muted-foreground">Required - Task name</span></div>
                        <div><Badge variant="outline">description</Badge> <span className="text-muted-foreground">Task details</span></div>
                        <div><Badge variant="outline">category</Badge> <span className="text-muted-foreground">operational, clinical, etc.</span></div>
                        <div><Badge variant="outline">priority</Badge> <span className="text-muted-foreground">low, medium, high</span></div>
                        <div><Badge variant="outline">due_type</Badge> <span className="text-muted-foreground">When task is due</span></div>
                        <div><Badge variant="outline">recurrence</Badge> <span className="text-muted-foreground">daily, weekly, etc.</span></div>
                      </div>
                      <div className="space-y-1">
                        <div><Badge variant="outline">due_date</Badge> <span className="text-muted-foreground">ISO date format</span></div>
                        <div><Badge variant="outline">owner_notes</Badge> <span className="text-muted-foreground">Instructions</span></div>
                        <div><Badge variant="outline">assigned_to</Badge> <span className="text-muted-foreground">User ID or email</span></div>
                        <div><Badge variant="outline">checklist_items</Badge> <span className="text-muted-foreground">Pipe-separated items</span></div>
                        <div><Badge variant="outline">attachments</Badge> <span className="text-muted-foreground">JSON or text</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => downloadTemplate('csv')} className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download CSV Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Step 2: Import Your File</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select your filled-out CSV file to import tasks and create a new template.
                    </p>
                  </div>

                  {/* File Selection */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      selectedFile ? 'border-green-300 bg-green-50/50' : 'border-muted-foreground/25'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isImporting}
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Ready to import
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isImporting}
                        >
                          Choose Different File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                        <p className="font-medium">Choose a CSV file to import</p>
                        <p className="text-sm text-muted-foreground">
                          Click here or drag and drop your file
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isImporting}
                        >
                          Select File
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Progress Display */}
                  {progress && (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {getProgressIcon()}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{getStageLabel(progress.stage)}</span>
                                <span className="text-sm text-muted-foreground">{progress.percentage}%</span>
                              </div>
                              <Progress value={progress.percentage} className="h-2" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{progress.message}</p>
                          {progress.currentItem !== undefined && progress.totalItems && (
                            <p className="text-xs text-muted-foreground">
                              Processing item {progress.currentItem} of {progress.totalItems}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                      disabled={isImporting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleImport}
                      disabled={!selectedFile || isImporting}
                      className="flex items-center gap-2"
                    >
                      {isImporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Import Tasks
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}