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
      title: 'Opening Routine (Daily)',
      icon: Sunrise,
      color: 'text-amber-600',
      templates: [
        {
          id: 'morning-opening',
          title: 'Morning Opening Checklist',
          description: 'Standard checklist before patients arrive',
          category: 'opening',
          checklist: [
            { id: '1', task: 'Room setup (lights, seats, tray covers)', completed: false },
            { id: '2', task: 'Turn on computers & dental software', completed: false },
            { id: '3', task: 'Disinfect counters and operatory handles', completed: false },
            { id: '4', task: 'Fill ultrasonic, check autoclave water', completed: false },
            { id: '5', task: 'Turn on suction & compressor', completed: false },
            { id: '6', task: 'Restock gauze, anesthetic, cotton rolls, bonding', completed: false },
            { id: '7', task: 'Check solutions (NaOCl, EDTA, CHX)', completed: false },
            { id: '8', task: 'Load sterilization pouches', completed: false },
            { id: '9', task: 'Set up microscopes / loupes', completed: false },
            { id: '10', task: 'Plug in iPads/scanners', completed: false }
          ]
        },
        {
          id: 'clinical-software-boot',
          title: 'Clinical Software & Imaging Boot',
          description: 'Boot up and verify all clinical systems',
          category: 'opening',
          checklist: [
            { id: '1', task: 'Login to practice software', completed: false },
            { id: '2', task: 'Launch radiograph/CBCT software', completed: false },
            { id: '3', task: 'Confirm network is active', completed: false },
            { id: '4', task: 'Label CBCT room sensor(s)', completed: false },
            { id: '5', task: 'Verify patient schedule sync', completed: false }
          ]
        }
      ]
    },
    {
      id: 'endodontics',
      title: 'Endodontics (Daily/Per-Patient)',
      icon: Activity,
      color: 'text-red-600',
      templates: [
        {
          id: 'endo-anterior-setup',
          title: 'Endo Case Setup - Anterior',
          description: 'Standard anterior root canal preparation',
          category: 'treatment',
          specialty: 'endodontics',
          checklist: [
            { id: '1', task: 'Patient seated, bib placed', completed: false },
            { id: '2', task: 'Rubber dam tray & dam sheet out', completed: false },
            { id: '3', task: 'Select clamp & forceps', completed: false },
            { id: '4', task: 'Set up: DG-16, Endo explorer, cotton pellets', completed: false },
            { id: '5', task: 'NaOCl syringe prepared', completed: false },
            { id: '6', task: 'Microscope cleaned and angled', completed: false },
            { id: '7', task: 'Operatory tray with sterile setup', completed: false },
            { id: '8', task: 'Put out bite block, lubricant, measuring ruler', completed: false }
          ]
        },
        {
          id: 'endo-posterior-setup',
          title: 'Endo Case Setup - Posterior',
          description: 'Standard posterior root canal preparation',
          category: 'treatment',
          specialty: 'endodontics',
          checklist: [
            { id: '1', task: 'Patient seated, bib placed', completed: false },
            { id: '2', task: 'Larger rubber dam frame', completed: false },
            { id: '3', task: 'Second suction line', completed: false },
            { id: '4', task: 'Wedge and matrix on standby', completed: false },
            { id: '5', task: 'Extra paper points and larger files', completed: false },
            { id: '6', task: 'NaOCl syringe prepared', completed: false },
            { id: '7', task: 'Microscope cleaned and angled', completed: false },
            { id: '8', task: 'Operatory tray with sterile setup', completed: false }
          ]
        },
        {
          id: 'post-endo-breakdown',
          title: 'Post-Endo Breakdown',
          description: 'Standard cleanup after endodontic treatment',
          category: 'cleanup',
          specialty: 'endodontics',
          checklist: [
            { id: '1', task: 'Dispose of used cotton and dam', completed: false },
            { id: '2', task: 'Clean and store microscope lens', completed: false },
            { id: '3', task: 'Disinfect chair, handles, and monitor', completed: false },
            { id: '4', task: 'Replace barriers', completed: false },
            { id: '5', task: 'Run suction cleaner', completed: false },
            { id: '6', task: 'Place files for sterilization', completed: false },
            { id: '7', task: 'Wipe operatory tray & barriers', completed: false }
          ]
        }
      ]
    },
    {
      id: 'orthodontics',
      title: 'Orthodontics (Daily/Weekly)',
      icon: Smile,
      color: 'text-blue-600',
      templates: [
        {
          id: 'ortho-adjustment-setup',
          title: 'Ortho Adjustment Day Setup',
          description: 'Preparation for orthodontic adjustment appointments',
          category: 'preparation',
          specialty: 'orthodontics',
          checklist: [
            { id: '1', task: 'Stock brackets, wires, elastics', completed: false },
            { id: '2', task: 'Prepare bands & separators', completed: false },
            { id: '3', task: 'Load patient recall notes', completed: false },
            { id: '4', task: 'Ready iTero or scanning tray', completed: false },
            { id: '5', task: 'Fill bonding agents', completed: false },
            { id: '6', task: 'Turn on curing light', completed: false },
            { id: '7', task: 'Label bracket kits (if multiple types used)', completed: false }
          ]
        },
        {
          id: 'post-ortho-sterilization',
          title: 'Post-Ortho Sterilization',
          description: 'Cleanup and sterilization after ortho appointments',
          category: 'sterilization',
          specialty: 'orthodontics',
          checklist: [
            { id: '1', task: 'Sort and soak pliers', completed: false },
            { id: '2', task: 'Sterilize bracket kits', completed: false },
            { id: '3', task: 'Repack ortho trays', completed: false },
            { id: '4', task: 'Wipe headrest, scanner, mirrors', completed: false },
            { id: '5', task: 'Restock elastics, wax, mirrors', completed: false }
          ]
        }
      ]
    },
    {
      id: 'weekly-maintenance',
      title: 'Weekly/Biweekly Maintenance',
      icon: Settings,
      color: 'text-indigo-600',
      templates: [
        {
          id: 'suction-cleaning',
          title: 'Suction Line Cleaning (Biweekly)',
          description: 'Deep cleaning of suction systems',
          category: 'maintenance',
          checklist: [
            { id: '1', task: 'Mix suction cleaning solution', completed: false },
            { id: '2', task: 'Flush through HVE & SE', completed: false },
            { id: '3', task: 'Clean filters', completed: false },
            { id: '4', task: 'Log completion in sheet', completed: false }
          ]
        },
        {
          id: 'instrument-inventory',
          title: 'Instrument Inventory Check (Weekly)',
          description: 'Weekly check of instrument supplies',
          category: 'inventory',
          checklist: [
            { id: '1', task: 'Count explorer, pluggers, mirrors', completed: false },
            { id: '2', task: 'Restock missing ones', completed: false },
            { id: '3', task: 'Check if replacements are needed', completed: false },
            { id: '4', task: 'Submit order if below threshold', completed: false }
          ]
        },
        {
          id: 'staff-supplies-check',
          title: 'Staff Supplies Check (Weekly)',
          description: 'Weekly check of staff protection supplies',
          category: 'inventory',
          checklist: [
            { id: '1', task: 'Gloves (all sizes)', completed: false },
            { id: '2', task: 'Masks', completed: false },
            { id: '3', task: 'Gowns', completed: false },
            { id: '4', task: 'Patient bibs', completed: false },
            { id: '5', task: 'Surface barriers', completed: false }
          ]
        }
      ]
    },
    {
      id: 'sterilization-cleaning',
      title: 'Sterilization & Cleaning (Daily/EOD)',
      icon: RotateCcw,
      color: 'text-green-600',
      templates: [
        {
          id: 'eod-steri-protocol',
          title: 'End of Day Steri Protocol',
          description: 'End of day sterilization routine',
          category: 'sterilization',
          checklist: [
            { id: '1', task: 'Empty ultrasonic & wipe basin', completed: false },
            { id: '2', task: 'Run final autoclave cycle', completed: false },
            { id: '3', task: 'Wipe down trays', completed: false },
            { id: '4', task: 'Sort used instruments for next-day prep', completed: false },
            { id: '5', task: 'Clean handpieces with spray/lube', completed: false },
            { id: '6', task: 'Close sterilization logs', completed: false }
          ]
        },
        {
          id: 'full-op-cleaning',
          title: 'Full Op Cleaning (EOD)',
          description: 'Complete operatory cleaning end of day',
          category: 'cleaning',
          checklist: [
            { id: '1', task: 'Wipe light handles', completed: false },
            { id: '2', task: 'Disinfect chairs & buttons', completed: false },
            { id: '3', task: 'Change all tray barriers', completed: false },
            { id: '4', task: 'Restock drawers', completed: false },
            { id: '5', task: 'Mop room if needed', completed: false },
            { id: '6', task: 'Trash out', completed: false }
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
          id: 'monthly-deep-clean',
          title: 'Monthly Deep Clean',
          description: 'Comprehensive monthly cleaning tasks',
          category: 'cleaning',
          checklist: [
            { id: '1', task: 'Clean baseboards and wall corners', completed: false },
            { id: '2', task: 'Wipe cabinet handles', completed: false },
            { id: '3', task: 'Clean scanner screen', completed: false },
            { id: '4', task: 'Disinfect keyboards and mice', completed: false },
            { id: '5', task: 'Replace any stained ceiling tiles', completed: false }
          ]
        },
        {
          id: 'inventory-order-submission',
          title: 'Inventory & Order Submission',
          description: 'Monthly inventory and ordering routine',
          category: 'administrative',
          checklist: [
            { id: '1', task: 'Full clinic supply count', completed: false },
            { id: '2', task: 'Submit monthly order form', completed: false },
            { id: '3', task: 'Organize backroom shelving', completed: false },
            { id: '4', task: 'Log outdated/expired supplies', completed: false }
          ]
        }
      ]
    },
    {
      id: 'utilities-backoffice',
      title: 'Utilities & Back Office',
      icon: Settings,
      color: 'text-slate-600',
      templates: [
        {
          id: 'gentlewave-maintenance',
          title: 'GentleWave Maintenance (Weekly)',
          description: 'Weekly GentleWave system maintenance',
          category: 'equipment',
          checklist: [
            { id: '1', task: 'Prime system', completed: false },
            { id: '2', task: 'Empty waste', completed: false },
            { id: '3', task: 'Wipe and polish screen', completed: false },
            { id: '4', task: 'Refill GentleWave solution', completed: false },
            { id: '5', task: 'Clean cartridges', completed: false }
          ]
        },
        {
          id: 'cbct-maintenance',
          title: 'CBCT Maintenance (Monthly)',
          description: 'Monthly CBCT system maintenance',
          category: 'equipment',
          checklist: [
            { id: '1', task: 'Wipe sensor and chin rest', completed: false },
            { id: '2', task: 'Check calibration log', completed: false },
            { id: '3', task: 'Perform phantom scan (if required)', completed: false },
            { id: '4', task: 'Notify if any error codes present', completed: false }
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
      // Create individual tasks for each checklist item
      const taskPromises = template.checklist.map(async (checklistItem) => {
        return onCreateTask({
          title: checklistItem.task,
          description: `From template: ${template.title}`,
          category: template.category,
          priority: 'medium',
          checklist: [], // Individual tasks don't need checklists
          specialty: template.specialty,
          'due-type': 'today',
          status: 'pending'
        });
      });

      // Wait for all tasks to be created
      await Promise.all(taskPromises);

      toast({
        title: "Template Added",
        description: `${template.checklist.length} tasks from "${template.title}" have been added to today's tasks.`,
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