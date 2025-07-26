import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Sunrise, 
  Activity,
  Smile,
  RotateCcw,
  Calendar,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  checklist: ChecklistItem[];
  category: string;
  specialty?: string;
}

interface TemplateGroup {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  templates: TaskTemplate[];
}

interface TemplatesTabProps {
  onCreateTask: (taskData: any) => Promise<void>;
  userRole: string;
}

const TemplatesTab: React.FC<TemplatesTabProps> = ({ onCreateTask, userRole }) => {
  const [openGroups, setOpenGroups] = useState<string[]>(['opening-routine']);
  const [openTemplates, setOpenTemplates] = useState<string[]>([]);
  const [addingTasks, setAddingTasks] = useState<string[]>([]);
  const { toast } = useToast();

  const templateGroups: TemplateGroup[] = [
    {
      id: 'opening-routine',
      title: 'Opening Routine',
      icon: Sunrise,
      color: 'text-amber-600',
      templates: [
        {
          id: 'morning-opening',
          title: 'Morning Opening Checklist',
          description: 'Standard checklist before patients arrive',
          category: 'opening',
          checklist: [
            { id: '1', task: 'Room Setup', completed: false },
            { id: '2', task: 'Turn on PCs and software', completed: false },
            { id: '3', task: 'Autoclave ready check', completed: false },
            { id: '4', task: 'Disinfect countertops', completed: false },
            { id: '5', task: 'Stock up solutions (NaOCl, EDTA)', completed: false }
          ]
        }
      ]
    },
    {
      id: 'endodontics',
      title: 'Endodontics',
      icon: Activity,
      color: 'text-red-600',
      templates: [
        {
          id: 'endo-anterior-setup',
          title: 'Endo Case Setup (Anterior)',
          description: 'Standard anterior root canal prep',
          category: 'treatment',
          specialty: 'endodontics',
          checklist: [
            { id: '1', task: 'Patient seated and bib placed', completed: false },
            { id: '2', task: 'Load x-ray and CBCT if needed', completed: false },
            { id: '3', task: 'Select and place rubber dam', completed: false },
            { id: '4', task: 'Prepare syringe with NaOCl', completed: false },
            { id: '5', task: 'Ready endo tray with explorer, DG-16, cotton rolls, etc.', completed: false },
            { id: '6', task: 'Microscope cleaned and angled', completed: false }
          ]
        },
        {
          id: 'post-endo-cleanup',
          title: 'Post-Endo Cleanup',
          description: 'Standard cleanup after endodontic treatment',
          category: 'cleanup',
          specialty: 'endodontics',
          checklist: [
            { id: '1', task: 'Remove rubber dam', completed: false },
            { id: '2', task: 'Wipe microscope lenses', completed: false },
            { id: '3', task: 'Flush suction lines', completed: false },
            { id: '4', task: 'Empty trash', completed: false },
            { id: '5', task: 'Sterilize and pack files', completed: false }
          ]
        }
      ]
    },
    {
      id: 'orthodontics',
      title: 'Orthodontics',
      icon: Smile,
      color: 'text-blue-600',
      templates: [
        {
          id: 'ortho-adjustment-prep',
          title: 'Ortho Adjustment Day Prep',
          description: 'Preparation for orthodontic adjustment appointments',
          category: 'preparation',
          specialty: 'orthodontics',
          checklist: [
            { id: '1', task: 'Stock brackets and wires', completed: false },
            { id: '2', task: 'Clean and set up bands & separators', completed: false },
            { id: '3', task: 'Confirm elastic and wax stock', completed: false },
            { id: '4', task: 'Load last visit notes', completed: false },
            { id: '5', task: 'Prepare iTero or scanner if used', completed: false }
          ]
        }
      ]
    },
    {
      id: 'sterilization',
      title: 'Sterilization & Maintenance',
      icon: RotateCcw,
      color: 'text-green-600',
      templates: [
        {
          id: 'daily-sterilization',
          title: 'Daily Sterilization Check',
          description: 'Daily sterilization and maintenance routine',
          category: 'sterilization',
          checklist: [
            { id: '1', task: 'Check autoclave water levels', completed: false },
            { id: '2', task: 'Run biological indicator test', completed: false },
            { id: '3', task: 'Clean ultrasonic baths', completed: false },
            { id: '4', task: 'Check chemical indicators', completed: false },
            { id: '5', task: 'Maintain sterilization logs', completed: false }
          ]
        }
      ]
    },
    {
      id: 'monthly-admin',
      title: 'Monthly Admin Tasks',
      icon: Calendar,
      color: 'text-purple-600',
      templates: [
        {
          id: 'monthly-inventory',
          title: 'Monthly Inventory Check',
          description: 'Comprehensive monthly inventory and administrative tasks',
          category: 'administrative',
          checklist: [
            { id: '1', task: 'Count and order dental supplies', completed: false },
            { id: '2', task: 'Review insurance claims status', completed: false },
            { id: '3', task: 'Update patient contact information', completed: false },
            { id: '4', task: 'Backup patient data', completed: false },
            { id: '5', task: 'Equipment maintenance checks', completed: false }
          ]
        }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleTemplate = (templateId: string) => {
    setOpenTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const addTemplateToTasks = async (template: TaskTemplate) => {
    setAddingTasks(prev => [...prev, template.id]);
    
    try {
      // Create a task for this template
      await onCreateTask({
        title: template.title,
        description: template.description,
        category: template.category,
        priority: 'medium',
        checklist: template.checklist,
        specialty: template.specialty,
        'due-type': 'today',
        status: 'pending'
      });

      toast({
        title: "Template Added",
        description: `"${template.title}" has been added to today's tasks.`,
      });
    } catch (error) {
      console.error('Error adding template to tasks:', error);
      toast({
        title: "Error",
        description: "Failed to add template to tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingTasks(prev => prev.filter(id => id !== template.id));
    }
  };

  const canCreateTasks = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Templates</h2>
          <p className="text-muted-foreground">
            Pre-built task templates organized by category. Click to expand and add to your task list.
          </p>
        </div>
        {canCreateTasks && (
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Template
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {templateGroups.map((group) => (
          <Card key={group.id} className="overflow-hidden">
            <Collapsible
              open={openGroups.includes(group.id)}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger className="w-full">
                <CardHeader className="hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <group.icon className={`h-5 w-5 ${group.color}`} />
                      <div className="text-left">
                        <CardTitle className="text-lg">{group.title}</CardTitle>
                        <CardDescription>
                          {group.templates.length} template{group.templates.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    {openGroups.includes(group.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {group.templates.map((template) => (
                      <Card key={template.id} className="bg-muted/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-base">{template.title}</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                  {template.checklist.length} tasks
                                </Badge>
                              </div>
                              <CardDescription>{template.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTemplate(template.id)}
                                className="gap-1"
                              >
                                {openTemplates.includes(template.id) ? (
                                  <>Hide <ChevronUp className="h-3 w-3" /></>
                                ) : (
                                  <>Preview <ChevronDown className="h-3 w-3" /></>
                                )}
                              </Button>
                              {canCreateTasks && (
                                <Button
                                  size="sm"
                                  onClick={() => addTemplateToTasks(template)}
                                  disabled={addingTasks.includes(template.id)}
                                  className="gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  {addingTasks.includes(template.id) ? 'Adding...' : 'Add to Tasks'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <Collapsible
                          open={openTemplates.includes(template.id)}
                          onOpenChange={() => toggleTemplate(template.id)}
                        >
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="bg-background rounded-lg p-4">
                                <h4 className="font-medium mb-3">Task Checklist:</h4>
                                <div className="space-y-2">
                                  {template.checklist.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                      <div className="w-4 h-4 rounded border border-muted-foreground/30 flex items-center justify-center bg-muted">
                                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                                      </div>
                                      <span className="text-sm">{item.task}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplatesTab;