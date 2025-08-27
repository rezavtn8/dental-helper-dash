import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TaskStatus } from '@/lib/taskStatus';
import { 
  Stethoscope,
  Heart,
  Eye,
  Brain,
  Zap,
  Plus,
  CheckSquare
} from 'lucide-react';

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  'due-type': string;
  specialty: string;
  icon: React.ReactNode;
  tasks: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    'due-type': string;
    category: string;
  }>;
}

interface OwnerTemplatesProps {
  onTasksCreated: () => void;
}

const OwnerTemplates: React.FC<OwnerTemplatesProps> = ({ onTasksCreated }) => {
  const { user, userProfile } = useAuth();

  const templates: TaskTemplate[] = [
    {
      id: 'orthodontic-daily',
      title: 'Orthodontic Daily Setup',
      description: 'Complete daily setup routine for orthodontic practice',
      category: 'Setup',
      priority: 'high',
      'due-type': 'Before Opening',
      specialty: 'Orthodontics',
      icon: <Stethoscope className="h-6 w-6" />,
      tasks: [
        {
          title: 'Set up orthodontic instruments',
          description: 'Prepare brackets, wires, and orthodontic tools',
          priority: 'high',
          'due-type': 'Before Opening',
          category: 'Setup'
        },
        {
          title: 'Check x-ray equipment',
          description: 'Ensure cephalometric and panoramic equipment is ready',
          priority: 'medium',
          'due-type': 'Before Opening',
          category: 'Equipment'
        },
        {
          title: 'Review patient appointments',
          description: 'Check treatment plans and appointment notes',
          priority: 'high',
          'due-type': 'Before Opening',
          category: 'Patient Care'
        }
      ]
    },
    {
      id: 'endodontic-daily',
      title: 'Endodontic Daily Prep',
      description: 'Daily preparation for endodontic procedures',
      category: 'Setup',
      priority: 'high',
      'due-type': 'Before Opening',
      specialty: 'Endodontics',
      icon: <Heart className="h-6 w-6" />,
      tasks: [
        {
          title: 'Prepare endodontic files',
          description: 'Set up rotary files and hand instruments',
          priority: 'high',
          'due-type': 'Before Opening',
          category: 'Setup'
        },
        {
          title: 'Check microscope settings',
          description: 'Verify operating microscope is calibrated',
          priority: 'medium',
          'due-type': 'Before Opening',
          category: 'Equipment'
        },
        {
          title: 'Prepare irrigation solutions',
          description: 'Set up sodium hypochlorite and EDTA solutions',
          priority: 'high',
          'due-type': 'Before Opening',
          category: 'Preparation'
        }
      ]
    },
    {
      id: 'general-daily',
      title: 'General Practice Daily',
      description: 'Standard daily routine for general dental practice',
      category: 'Setup',
      priority: 'medium',
      'due-type': 'Before Opening',
      specialty: 'General Dentistry',
      icon: <Stethoscope className="h-6 w-6" />,
      tasks: [
        {
          title: 'Set up operatories',
          description: 'Prepare all treatment rooms with basic instruments',
          priority: 'high',
          'due-type': 'Before Opening',
          category: 'Setup'
        },
        {
          title: 'Check sterilization equipment',
          description: 'Verify autoclave and sterilization cycles',
          priority: 'high',
          'due-type': 'Before Opening',
          category: 'Sterilization'
        },
        {
          title: 'Review daily schedule',
          description: 'Check appointments and special needs',
          priority: 'medium',
          'due-type': 'Before Opening',
          category: 'Administrative'
        }
      ]
    },
    {
      id: 'weekly-cleaning',
      title: 'Weekly Deep Clean',
      description: 'Comprehensive weekly cleaning routine',
      category: 'Cleaning',
      priority: 'medium',
      'due-type': 'EoW',
      specialty: 'All Specialties',
      icon: <Zap className="h-6 w-6" />,
      tasks: [
        {
          title: 'Deep clean operatories',
          description: 'Thorough cleaning of all treatment rooms',
          priority: 'high',
          'due-type': 'EoW',
          category: 'Cleaning'
        },
        {
          title: 'Sanitize waiting area',
          description: 'Complete sanitization of patient areas',
          priority: 'medium',
          'due-type': 'EoW',
          category: 'Cleaning'
        },
        {
          title: 'Equipment maintenance check',
          description: 'Weekly maintenance of dental equipment',
          priority: 'medium',
          'due-type': 'EoW',
          category: 'Maintenance'
        }
      ]
    },
    {
      id: 'patient-comfort',
      title: 'Patient Comfort Setup',
      description: 'Enhance patient experience and comfort',
      category: 'Patient Care',
      priority: 'medium',
      'due-type': 'Before 1PM',
      specialty: 'All Specialties',
      icon: <Heart className="h-6 w-6" />,
      tasks: [
        {
          title: 'Prepare comfort amenities',
          description: 'Set up blankets, pillows, and entertainment options',
          priority: 'medium',
          'due-type': 'Before 1PM',
          category: 'Patient Care'
        },
        {
          title: 'Check temperature settings',
          description: 'Ensure optimal room temperature in all areas',
          priority: 'low',
          'due-type': 'Before 1PM',
          category: 'Environment'
        },
        {
          title: 'Review patient preferences',
          description: 'Check notes for special patient needs',
          priority: 'medium',
          'due-type': 'Before 1PM',
          category: 'Patient Care'
        }
      ]
    },
    {
      id: 'emergency-prep',
      title: 'Emergency Preparedness',
      description: 'Monthly emergency equipment and procedure check',
      category: 'Safety',
      priority: 'high',
      'due-type': 'EoM',
      specialty: 'All Specialties',
      icon: <Zap className="h-6 w-6" />,
      tasks: [
        {
          title: 'Check emergency kit',
          description: 'Verify all emergency medications and equipment',
          priority: 'high',
          'due-type': 'EoM',
          category: 'Safety'
        },
        {
          title: 'Test emergency procedures',
          description: 'Review emergency protocols with staff',
          priority: 'high',
          'due-type': 'EoM',
          category: 'Training'
        },
        {
          title: 'Update emergency contacts',
          description: 'Verify all emergency contact information',
          priority: 'medium',
          'due-type': 'EoM',
          category: 'Administrative'
        }
      ]
    }
  ];

  const createTasksFromTemplate = async (template: TaskTemplate) => {
    try {
      const tasksToCreate = template.tasks.map(task => ({
        ...task,
        clinic_id: userProfile?.clinic_id,
        created_by: user?.id,
        status: 'pending' as TaskStatus,
        assigned_to: null,
        recurrence: 'none'
      }));

      const { error } = await supabase
        .from('tasks')
        .insert(tasksToCreate);

      if (error) throw error;

      toast.success(`${template.tasks.length} tasks from "${template.title}" added successfully!`);

      onTasksCreated();
    } catch (error) {
      console.error('Error creating tasks from template:', error);
      toast.error("Failed to create tasks from template");
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'Orthodontics': return 'bg-blue-500';
      case 'Endodontics': return 'bg-red-500';
      case 'General Dentistry': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Templates</h2>
          <p className="text-muted-foreground">Pre-built task sets for different dental specialties</p>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary" className="text-xs">
                  {template.specialty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.tasks.length} tasks
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template['due-type']}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Tasks included:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {template.tasks.slice(0, 3).map((task, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="line-clamp-1">{task.title}</span>
                    </li>
                  ))}
                  {template.tasks.length > 3 && (
                    <li className="text-xs text-muted-foreground italic">
                      +{template.tasks.length - 3} more tasks...
                    </li>
                  )}
                </ul>
              </div>

              <Button 
                className="w-full" 
                onClick={() => createTasksFromTemplate(template)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add All Tasks
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Template Creation Hint */}
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="text-center space-y-2">
            <Plus className="h-8 w-8 mx-auto text-muted-foreground" />
            <h3 className="font-medium">Create Custom Template</h3>
            <p className="text-sm text-muted-foreground">
              Build your own task templates for recurring workflows in your practice
            </p>
            <Button variant="outline" className="mt-4">
              Create Custom Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerTemplates;