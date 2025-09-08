import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { TaskTemplate } from '@/types/template';
import { AssignmentResolver } from './assignmentResolver';

export interface TaskInput {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  'due-type'?: string;
  'due-date'?: string;
  custom_due_date?: string;
  recurrence?: string;
  owner_notes?: string;
  assigned_to?: string;
  checklist?: any;
  attachments?: any;
  clinic_id: string;
  created_by: string;
  template_id?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  generated_date?: string;
}

export class TaskService {
  static async createTask(taskData: TaskInput): Promise<Task> {
    const task = {
      ...taskData,
      status: (taskData.status || 'pending') as 'pending' | 'in-progress' | 'completed',
      generated_date: taskData.generated_date || new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw new Error(`Failed to create task: ${error.message}`);
    return data;
  }

  static async createTasksFromTemplate(
    template: TaskTemplate, 
    tasks: TaskInput[], 
    clinicId: string
  ): Promise<Task[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Resolve assignments for all tasks
    const resolvedTasks = await Promise.all(
      tasks.map(async (task) => {
        const { userId, assigneeNote } = await AssignmentResolver.resolveAssignment(
          task.assigned_to, 
          clinicId
        );

        return {
          ...task,
          assigned_to: userId,
          owner_notes: assigneeNote 
            ? (task.owner_notes ? `${task.owner_notes}\n${assigneeNote}` : assigneeNote)
            : task.owner_notes,
          clinic_id: clinicId,
          created_by: user.user.id,
          template_id: template.id,
          status: 'pending' as const,
          generated_date: new Date().toISOString().split('T')[0]
        };
      })
    );

    // Insert tasks in batches
    const batchSize = 10;
    const createdTasks: Task[] = [];

    for (let i = 0; i < resolvedTasks.length; i += batchSize) {
      const batch = resolvedTasks.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(batch)
        .select();

      if (error) throw new Error(`Failed to create tasks batch: ${error.message}`);
      if (data) createdTasks.push(...data);
    }

    // Update template task count
    await this.updateTemplateTaskCount(template.id, createdTasks.length);

    return createdTasks;
  }

  static async generateTasksFromTemplate(templateId: string): Promise<Task[]> {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw new Error(`Failed to fetch template: ${templateError.message}`);

    // Parse template data to create individual tasks  
    const templateData = template as any; // Cast to access checklist
    const templateTasks = templateData.checklist && Array.isArray(templateData.checklist)
      ? templateData.checklist 
      : [{ title: template.title, description: template.description }];

    const taskInputs: TaskInput[] = templateTasks.map((taskData: any) => ({
      title: taskData.title || template.title,
      description: taskData.description || template.description,
      category: template.category,
      priority: template.priority || 'medium',
      'due-type': template['due-type'],
      recurrence: template.recurrence,
      owner_notes: template.owner_notes,
      checklist: taskData.checklist,
      clinic_id: template.clinic_id,
      created_by: template.created_by
    }));

    return this.createTasksFromTemplate(template, taskInputs, template.clinic_id);
  }

  private static async updateTemplateTaskCount(templateId: string, increment: number): Promise<void> {
    // Simple update without RPC
    const { data: current } = await supabase
      .from('task_templates')
      .select('tasks_count')
      .eq('id', templateId)
      .single();

    const newCount = (current?.tasks_count || 0) + increment;
    
    const { error } = await supabase
      .from('task_templates')
      .update({ tasks_count: newCount })
      .eq('id', templateId);
    
    if (error) {
      console.warn('Failed to update template task count:', error);
    }
  }

  static async bulkCreateTasks(tasks: TaskInput[]): Promise<Task[]> {
    const batchSize = 10;
    const createdTasks: Task[] = [];

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(batch)
        .select();

      if (error) throw new Error(`Failed to create tasks batch ${Math.floor(i/batchSize) + 1}: ${error.message}`);
      if (data) createdTasks.push(...data);
    }

    return createdTasks;
  }
}