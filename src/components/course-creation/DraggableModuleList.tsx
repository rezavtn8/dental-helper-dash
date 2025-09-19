import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Video, 
  Image as ImageIcon,
  FileText,
  Clock,
  Eye
} from 'lucide-react';

interface ModuleFormData {
  title: string;
  content: string;
  module_type: string;
  duration: number;
  resources?: any;
  media_assets?: string[];
}

interface DraggableModuleItemProps {
  module: ModuleFormData;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  onPreview?: (index: number) => void;
}

const SortableModuleItem: React.FC<DraggableModuleItemProps> = ({
  module,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `module-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getModuleTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getModuleTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'image':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`group hover:shadow-md transition-all duration-200 ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-grab active:cursor-grabbing p-1 opacity-60 hover:opacity-100"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-semibold truncate">
                  {module.title || `Module ${index + 1}`}
                </CardTitle>
                <Badge variant="secondary" className={`${getModuleTypeBadgeColor(module.module_type)} flex items-center gap-1`}>
                  {getModuleTypeIcon(module.module_type)}
                  <span className="capitalize">{module.module_type}</span>
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{module.duration} min</span>
                </div>
                {module.media_assets && module.media_assets.length > 0 && (
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>{module.media_assets.length} media files</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreview(index)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(index)}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(index)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {module.content || 'No content added yet...'}
        </p>
      </CardContent>
    </Card>
  );
};

interface DraggableModuleListProps {
  modules: ModuleFormData[];
  onReorder: (newModules: ModuleFormData[]) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  onPreview?: (index: number) => void;
}

export const DraggableModuleList: React.FC<DraggableModuleListProps> = ({
  modules,
  onReorder,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((_, index) => `module-${index}` === active.id);
      const newIndex = modules.findIndex((_, index) => `module-${index}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newModules = arrayMove(modules, oldIndex, newIndex);
        onReorder(newModules);
      }
    }
  };

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No modules created yet. Add your first module to get started!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={modules.map((_, index) => `module-${index}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {modules.map((module, index) => (
            <SortableModuleItem
              key={`module-${index}`}
              module={module}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onPreview={onPreview}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};