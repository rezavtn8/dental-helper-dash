import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Upload,
  Download,
  Copy,
  Trash2,
  FileText,
  Plus,
  Zap,
  CheckCircle,
  RotateCcw,
  RotateCw,
  History
} from 'lucide-react';

interface BulkOperationsToolbarProps {
  selectedItems?: number[];
  totalItems: number;
  onBulkDelete?: (indices: number[]) => void;
  onBulkDuplicate?: (indices: number[]) => void;
  onImportFromText?: (text: string) => void;
  onExportToText?: () => string;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

export const BulkOperationsToolbar: React.FC<BulkOperationsToolbarProps> = ({
  selectedItems = [],
  totalItems,
  onBulkDelete,
  onBulkDuplicate,
  onImportFromText,
  onExportToText,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSelectAll,
  onClearSelection
}) => {
  const [importText, setImportText] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportedText, setExportedText] = useState('');

  const hasSelection = selectedItems.length > 0;

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error('Please enter some text to import');
      return;
    }

    if (onImportFromText) {
      onImportFromText(importText);
      setImportText('');
      setImportDialogOpen(false);
      toast.success(`Imported content successfully`);
    }
  };

  const handleExport = () => {
    if (onExportToText) {
      const text = onExportToText();
      setExportedText(text);
      setExportDialogOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedText);
      toast.success('Content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="border-b bg-muted/30 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Selection info and actions */}
        <div className="flex items-center gap-3">
          {hasSelection ? (
            <>
              <Badge variant="secondary" className="px-3 py-1">
                {selectedItems.length} of {totalItems} selected
              </Badge>
              
              <div className="flex items-center gap-2">
                {onBulkDuplicate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkDuplicate(selectedItems)}
                    className="h-8"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                )}
                
                {onBulkDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkDelete(selectedItems)}
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
                
                {onClearSelection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                    className="h-8"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {totalItems} items total
              </span>
              
              {onSelectAll && totalItems > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSelectAll}
                  className="h-8"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Select All
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right side - Bulk operations and undo/redo */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
              title="Undo"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
              title="Redo"
            >
              <RotateCw className="h-3 w-3" />
            </Button>
          </div>

          {/* Import/Export */}
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Upload className="h-3 w-3 mr-1" />
                Import Text
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Content from Text</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-text">
                    Paste your content below (one item per line)
                  </Label>
                  <Textarea
                    id="import-text"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Module 1: Introduction&#10;Module 2: Getting Started&#10;Module 3: Advanced Topics"
                    className="min-h-[200px] mt-2 font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport}>
                    <Plus className="h-4 w-4 mr-2" />
                    Import Content
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleExport} className="h-8">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>

          {/* Export Dialog */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Export Content</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="export-text">Content Export</Label>
                  <Textarea
                    id="export-text"
                    value={exportedText}
                    readOnly
                    className="min-h-[200px] mt-2 font-mono text-sm bg-muted/50"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};