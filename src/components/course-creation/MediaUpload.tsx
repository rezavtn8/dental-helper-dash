import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Video, 
  Music, 
  FileIcon,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  thumbnail_path?: string;
  url?: string;
  created_at: string;
}

interface MediaUploadProps {
  onFileUploaded?: (file: MediaFile) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  bucket?: string;
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onFileUploaded,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  maxSize = 50, // 50MB default
  bucket = 'learning-content',
  multiple = false,
  showPreview = true,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const { toast } = useToast();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.includes('pdf')) return FileText;
    return FileIcon;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<MediaFile | null> => {
    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: "File Validation Error",
          description: validationError,
          variant: "destructive"
        });
        return null;
      }

      setUploading(true);
      setUploadProgress(0);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Save media asset record
      const { data: user } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('id', user.user?.id)
        .single();

      const { data: assetData, error: assetError } = await supabase
        .from('media_assets')
        .insert({
          filename: fileName,
          original_filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: uploadData.path,
          uploaded_by: user.user?.id,
          clinic_id: userProfile?.clinic_id,
          metadata: {
            content_type: file.type,
            last_modified: file.lastModified,
            public_url: publicUrl
          }
        })
        .select()
        .single();

      if (assetError) throw assetError;

      const mediaFile: MediaFile = {
        ...assetData,
        url: publicUrl
      };

      setUploadedFiles(prev => [...prev, mediaFile]);
      onFileUploaded?.(mediaFile);

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`
      });

      return mediaFile;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      toast({
        title: "Multiple Files",
        description: "Please select only one file",
        variant: "destructive"
      });
      return;
    }

    for (const file of fileArray) {
      await uploadFile(file);
      if (!multiple) break; // Only upload one file if multiple is false
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getPreviewUrl = (file: MediaFile): string => {
    if (file.url) return file.url;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(file.filename);
    
    return data.publicUrl;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`transition-all duration-200 cursor-pointer ${
          dragActive 
            ? 'border-primary bg-primary/5 shadow-lg' 
            : 'border-dashed border-2 hover:border-muted-foreground/50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              dragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <Upload className="h-8 w-8" />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">
                {dragActive ? 'Drop files here' : 'Upload Media Files'}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here, or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {acceptedTypes.map((type, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum file size: {maxSize}MB
              </p>
            </div>

            <div>
              <Input
                type="file"
                accept={acceptedTypes.join(',')}
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <Label htmlFor="file-upload">
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={uploading}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Plus className="h-4 w-4 mr-2" />
                    Choose Files
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files Preview */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Uploaded Files</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadedFiles.map((file) => {
              const FileIcon = getFileIcon(file.file_type);
              const isImage = file.file_type.startsWith('image/');
              const isVideo = file.file_type.startsWith('video/');
              
              return (
                <Card key={file.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {/* Preview */}
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        {isImage ? (
                          <img 
                            src={getPreviewUrl(file)} 
                            alt={file.original_filename}
                            className="w-full h-full object-cover"
                          />
                        ) : isVideo ? (
                          <video 
                            src={getPreviewUrl(file)} 
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                          />
                        ) : (
                          <FileIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div>
                        <p className="text-sm font-medium truncate" title={file.original_filename}>
                          {file.original_filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(getPreviewUrl(file), '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeFile(file.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};