import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  FileText, 
  Video, 
  HelpCircle,
  Clock,
  Edit3,
  Save,
  X,
  Upload,
  Eye,
  ImageIcon,
  Zap
} from 'lucide-react';
import { MediaUpload } from './MediaUpload';

interface ModuleData {
  title: string;
  content: string;
  module_type: string;
  duration: number;
  resources?: any;
  media_assets?: string[]; // Array of media asset URLs
}

interface ModuleBuilderProps {
  modules: ModuleData[];
  onModulesChange: (modules: ModuleData[]) => void;
}

export const ModuleBuilder: React.FC<ModuleBuilderProps> = ({
  modules,
  onModulesChange
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingModule, setEditingModule] = useState<ModuleData | null>(null);

  const moduleTypes = [
    { value: 'text', label: 'Text Content', icon: FileText, description: 'Text-based learning material' },
    { value: 'video', label: 'Video Content', icon: Video, description: 'Video lectures and tutorials' },
    { value: 'interactive', label: 'Interactive', icon: HelpCircle, description: 'Quizzes and assessments' }
  ];

  const getModuleTypeIcon = (type: string) => {
    const moduleType = moduleTypes.find(t => t.value === type);
    return moduleType?.icon || FileText;
  };

  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'video': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'interactive': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const addModule = () => {
    const newModule: ModuleData = {
      title: `Module ${modules.length + 1}`,
      content: '',
      module_type: 'text',
      duration: 15
    };
    onModulesChange([...modules, newModule]);
    setEditingIndex(modules.length);
    setEditingModule({ ...newModule });
  };

  const removeModule = (index: number) => {
    const updatedModules = modules.filter((_, i) => i !== index);
    onModulesChange(updatedModules);
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingModule(null);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingModule({ ...modules[index] });
  };

  const saveModule = () => {
    if (editingIndex === null || !editingModule) return;
    
    const updatedModules = [...modules];
    updatedModules[editingIndex] = editingModule;
    onModulesChange(updatedModules);
    setEditingIndex(null);
    setEditingModule(null);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingModule(null);
  };

  const moveModule = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= modules.length) return;
    
    const updatedModules = [...modules];
    const [moved] = updatedModules.splice(fromIndex, 1);
    updatedModules.splice(toIndex, 0, moved);
    onModulesChange(updatedModules);
  };

  const totalDuration = modules.reduce((sum, module) => sum + module.duration, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
            Course Modules
          </h3>
          <p className="text-muted-foreground">
            Structure your course content into logical modules
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Total: {totalDuration} minutes</span>
          </div>
          <Button onClick={addModule} className="bg-gradient-to-r from-learning-quiz to-purple-500 hover:from-learning-quiz/90 hover:to-purple-500/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="font-semibold text-lg mb-2">No modules yet</h4>
              <p className="text-muted-foreground mb-4">
                Start building your course by adding your first module
              </p>
              <Button onClick={addModule} className="bg-gradient-to-r from-learning-quiz to-purple-500 hover:from-learning-quiz/90 hover:to-purple-500/90">
                <Plus className="h-4 w-4 mr-2" />
                Add First Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          modules.map((module, index) => {
            const ModuleIcon = getModuleTypeIcon(module.module_type);
            const isEditing = editingIndex === index;
            
            return (
              <Card 
                key={index} 
                className={`transition-all duration-200 ${
                  isEditing ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-4 w-4 cursor-move" />
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                      <div className={`p-2 rounded-lg ${getModuleTypeColor(module.module_type)}`}>
                        <ModuleIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline" className={getModuleTypeColor(module.module_type)}>
                            {moduleTypes.find(t => t.value === module.module_type)?.label}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{module.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(index)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeModule(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {isEditing && editingModule ? (
                  <CardContent className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${index}`}>Module Title *</Label>
                        <Input
                          id={`title-${index}`}
                          value={editingModule.title}
                          onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                          placeholder="Enter module title"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`type-${index}`}>Module Type</Label>
                        <Select
                          value={editingModule.module_type}
                          onValueChange={(value) => setEditingModule({ ...editingModule, module_type: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {moduleTypes.map((type) => {
                              const TypeIcon = type.icon;
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <TypeIcon className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">{type.label}</div>
                                      <div className="text-xs text-muted-foreground">{type.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`duration-${index}`}>Duration (minutes)</Label>
                      <Input
                        id={`duration-${index}`}
                        type="number"
                        value={editingModule.duration}
                        onChange={(e) => setEditingModule({ ...editingModule, duration: parseInt(e.target.value) || 0 })}
                        placeholder="15"
                        className="mt-1 w-full md:w-48"
                      />
                    </div>
                    
                     <div>
                       <Label htmlFor={`content-${index}`}>Module Content</Label>
                       <Textarea
                         id={`content-${index}`}
                         value={editingModule.content}
                         onChange={(e) => setEditingModule({ ...editingModule, content: e.target.value })}
                         placeholder="Enter the module content. You can use markdown formatting..."
                         className="mt-1 min-h-[200px]"
                       />
                       <div className="text-xs text-muted-foreground mt-1">
                         Tip: You can use Markdown formatting for rich text content
                       </div>
                     </div>
                     
      /* Media Upload Section */
      <div>
        <Label className="text-base font-semibold flex items-center gap-2">
          <Upload className="h-4 w-4" /> 
          Module Media
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Add images, videos, or documents to enhance your module content
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Video Upload */}
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-500" />
                Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload
                bucket="learning-content"
                multiple={true}
                acceptedTypes="video/*"
                maxSize={100 * 1024 * 1024} // 100MB
                onFileUploaded={(file) => {
                  const mediaUrl = file.url || `https://jnbdhtlmdxtanwlubyis.supabase.co/storage/v1/object/public/learning-content/${file.filename}`;
                  setEditingModule(prev => ({
                    ...prev,
                    media_assets: [...(prev?.media_assets || []), mediaUrl]
                  }));
                }}
                className="w-full"
                showPreview={false}
              />
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-green-500" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload
                bucket="learning-content"
                multiple={true}
                acceptedTypes="image/*"
                maxSize={10 * 1024 * 1024} // 10MB
                onFileUploaded={(file) => {
                  const mediaUrl = file.url || `https://jnbdhtlmdxtanwlubyis.supabase.co/storage/v1/object/public/learning-content/${file.filename}`;
                  setEditingModule(prev => ({
                    ...prev,
                    media_assets: [...(prev?.media_assets || []), mediaUrl]
                  }));
                }}
                className="w-full"
                showPreview={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Media Preview Grid */}
        {editingModule.media_assets && editingModule.media_assets.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Uploaded Media ({editingModule.media_assets.length} files)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {editingModule.media_assets.map((url, mediaIndex) => {
                const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
                
                return (
                  <div key={mediaIndex} className="relative group border rounded-lg overflow-hidden bg-muted">
                    {isVideo ? (
                      <div className="aspect-video bg-black/10 flex items-center justify-center">
                        <Video className="h-8 w-8 text-muted-foreground" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => window.open(url, '_blank')}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video relative">
                        <img
                          src={url}
                          alt={`Module media ${mediaIndex + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModule(prev => ({
                          ...prev,
                          media_assets: prev?.media_assets?.filter((_, i) => i !== mediaIndex) || []
                        }));
                      }}
                      className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    
                    {/* Media Type Badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-2 left-2 text-xs"
                    >
                      {isVideo ? 'Video' : 'Image'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
                    
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Button onClick={saveModule} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Module
                      </Button>
                      <Button variant="outline" onClick={cancelEditing} size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {module.content || 'No content added yet'}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Module Type Guide */}
      {modules.length > 0 && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Module Types Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {moduleTypes.map((type) => {
              const TypeIcon = type.icon;
              return (
                <div key={type.value} className="flex items-center gap-3 text-sm">
                  <div className={`p-1 rounded ${getModuleTypeColor(type.value)}`}>
                    <TypeIcon className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-medium">{type.label}:</span>{' '}
                    <span className="text-muted-foreground">{type.description}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};