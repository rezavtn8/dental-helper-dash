import { supabase } from '@/integrations/supabase/client';
import { TaskTemplate, ImportableTaskTemplate, TaskTemplateInput } from '@/types/template';

export class TemplateService {
  static async getTemplates(clinicId: string): Promise<TaskTemplate[]> {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
    return data || [];
  }

  static async createTemplate(template: TaskTemplateInput): Promise<TaskTemplate> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Remove any fields that don't exist in the database schema
    const { tasks, ...cleanTemplate } = template as any;
    
    const templateData = {
      ...cleanTemplate,
      created_by: user.user.id,
      is_active: true,
      is_enabled: true,
      tasks_count: 0
    };

    const { data, error } = await supabase
      .from('task_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return data;
  }

  static async updateTemplate(id: string, updates: Partial<TaskTemplateInput>): Promise<TaskTemplate> {
    const { data, error } = await supabase
      .from('task_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update template: ${error.message}`);
    return data;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('task_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete template: ${error.message}`);
  }

  static async bulkDeleteTemplates(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('task_templates')
      .update({ is_active: false })
      .in('id', ids);

    if (error) throw new Error(`Failed to delete templates: ${error.message}`);
  }

  static async duplicateTemplate(templateId: string, clinicId: string): Promise<TaskTemplate> {
    const { data: original, error: fetchError } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch template: ${fetchError.message}`);

    const { id, created_at, updated_at, ...templateData } = original;
    const duplicatedTemplate = {
      ...templateData,
      title: `${original.title} (Copy)`,
      clinic_id: clinicId
    };

    return this.createTemplate(duplicatedTemplate);
  }

  static async importFromDefaults(clinicId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Check if defaults already imported
    const { data: clinic } = await supabase
      .from('clinics')
      .select('defaults_imported')
      .eq('id', clinicId)
      .single();

    if (clinic?.defaults_imported) return;

    // Get default templates
    const { data: defaultTemplates, error: defaultError } = await supabase
      .from('default_task_templates')
      .select('*')
      .eq('is_active', true);

    if (defaultError) throw new Error(`Failed to fetch default templates: ${defaultError.message}`);

    if (defaultTemplates?.length) {
      const clinicTemplates = defaultTemplates.map(template => ({
        title: template.title,
        description: template.description,
        category: template.category,
        specialty: template.specialty,
        'due-type': template['due-type'],
        recurrence: template.recurrence,
        owner_notes: template.owner_notes,
        checklist: template.checklist,
        clinic_id: clinicId,
        created_by: user.user.id,
        is_active: true,
        is_enabled: true
      }));

      const { error: insertError } = await supabase
        .from('task_templates')
        .insert(clinicTemplates);

      if (insertError) throw new Error(`Failed to insert templates: ${insertError.message}`);

      // Mark as imported
      const { error: updateError } = await supabase
        .from('clinics')
        .update({ defaults_imported: true })
        .eq('id', clinicId);

      if (updateError) throw new Error(`Failed to mark defaults as imported: ${updateError.message}`);
    }
  }

  static async cleanupDuplicates(templates: TaskTemplate[]): Promise<string[]> {
    const duplicateGroups = templates.reduce((groups, template) => {
      const key = `${template.title}_${JSON.stringify(template.checklist)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(template);
      return groups;
    }, {} as Record<string, TaskTemplate[]>);

    const duplicatesToDelete = Object.values(duplicateGroups)
      .filter(group => group.length > 1)
      .flatMap(group => group.slice(1).map(t => t.id));

    if (duplicatesToDelete.length > 0) {
      await this.bulkDeleteTemplates(duplicatesToDelete);
    }

    return duplicatesToDelete;
  }
}