import { supabase } from '@/integrations/supabase/client';

export interface AssignmentResolution {
  userId: string | null;
  assigneeNote: string | null;
}

export class AssignmentResolver {
  private static userCache = new Map<string, string>();
  
  /**
   * Resolves assignment input to either a valid user ID or creates a note
   */
  static async resolveAssignment(
    assignedTo: string | null | undefined, 
    clinicId: string
  ): Promise<AssignmentResolution> {
    if (!assignedTo?.trim()) {
      return { userId: null, assigneeNote: null };
    }

    const trimmedAssignment = assignedTo.trim();
    
    // Check if it's already a valid UUID
    if (this.isValidUUID(trimmedAssignment)) {
      return { userId: trimmedAssignment, assigneeNote: null };
    }

    // Check cache first
    const cacheKey = `${clinicId}:${trimmedAssignment.toLowerCase()}`;
    if (this.userCache.has(cacheKey)) {
      const userId = this.userCache.get(cacheKey)!;
      return { userId: userId === 'NOT_FOUND' ? null : userId, assigneeNote: userId === 'NOT_FOUND' ? `Assigned to: ${trimmedAssignment}` : null };
    }

    try {
      // Try to find user by email first
      if (this.isValidEmail(trimmedAssignment)) {
        const userId = await this.findUserByEmail(trimmedAssignment, clinicId);
        if (userId) {
          this.userCache.set(cacheKey, userId);
          return { userId, assigneeNote: null };
        }
      }

      // Try to find user by name
      const userId = await this.findUserByName(trimmedAssignment, clinicId);
      if (userId) {
        this.userCache.set(cacheKey, userId);
        return { userId, assigneeNote: null };
      }

      // No user found - create a note instead
      this.userCache.set(cacheKey, 'NOT_FOUND');
      return { 
        userId: null, 
        assigneeNote: `Assigned to: ${trimmedAssignment}` 
      };
    } catch (error) {
      console.warn('Error resolving assignment:', error);
      return { 
        userId: null, 
        assigneeNote: `Assigned to: ${trimmedAssignment}` 
      };
    }
  }

  private static async findUserByEmail(email: string, clinicId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return null;
    return data.id;
  }

  private static async findUserByName(name: string, clinicId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .ilike('name', `%${name}%`)
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return null;
    return data.id;
  }

  private static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  private static isValidEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  static clearCache(): void {
    this.userCache.clear();
  }
}