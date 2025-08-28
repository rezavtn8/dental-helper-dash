import { supabase } from '@/integrations/supabase/client';

/**
 * Utility to manually fix orphaned assistant accounts that have no clinic_id
 * This helps resolve existing issues where assistants exist but aren't linked to clinics
 */
export class ClinicAssignmentFixer {
  
  /**
   * Check if a user has pending invitations and link them automatically
   * This is useful for existing accounts that were created before the invitation system was robust
   */
  static async fixOrphanedAssistant(userId: string, email: string): Promise<{
    success: boolean;
    message: string;
    clinicId?: string;
  }> {
    try {
      // Check if user already has a clinic_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('clinic_id, role')
        .eq('id', userId)
        .single();

      if (userError) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (userData.clinic_id) {
        return {
          success: true,
          message: 'User already has a clinic assigned',
          clinicId: userData.clinic_id
        };
      }

      // Look for pending invitations
      const { data: invitations, error: invError } = await supabase
        .from('invitations')
        .select(`
          id,
          token,
          clinic_id,
          status,
          expires_at,
          clinics!inner(name)
        `)
        .eq('email', email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (invError || !invitations || invitations.length === 0) {
        return {
          success: false,
          message: 'No valid pending invitations found for this email address'
        };
      }

      // Use the most recent invitation
      const invitation = invitations[0];

      // Accept the invitation using the token
      const { data: acceptResult, error: acceptError } = await supabase.rpc('accept_invitation', {
        invitation_token: invitation.token
      });

      if (acceptError || !acceptResult || !acceptResult[0]?.success) {
        return {
          success: false,
          message: acceptError?.message || acceptResult?.[0]?.message || 'Failed to accept invitation'
        };
      }

      // Update the user's clinic_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ clinic_id: invitation.clinic_id })
        .eq('id', userId);

      if (updateError) {
        return {
          success: false,
          message: 'Invitation accepted but failed to update user profile'
        };
      }

      return {
        success: true,
        message: `Successfully linked to ${invitation.clinics?.name || 'clinic'}`,
        clinicId: invitation.clinic_id
      };

    } catch (error) {
      console.error('Error fixing orphaned assistant:', error);
      return {
        success: false,
        message: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Get all orphaned assistants in the system (for admin use)
   * Returns assistants who have no clinic_id but may have pending invitations
   */
  static async getOrphanedAssistants(): Promise<{
    success: boolean;
    orphanedAssistants: any[];
    message?: string;
  }> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at')
        .eq('role', 'assistant')
        .is('clinic_id', null)
        .eq('is_active', true);

      if (error) {
        return {
          success: false,
          orphanedAssistants: [],
          message: error.message
        };
      }

      return {
        success: true,
        orphanedAssistants: users || []
      };

    } catch (error) {
      return {
        success: false,
        orphanedAssistants: [],
        message: 'Failed to fetch orphaned assistants'
      };
    }
  }
}

/**
 * Quick helper function to fix the current user if they're orphaned
 * This can be called from components when needed
 */
export const fixCurrentUserClinicAssignment = async (userId: string, email: string) => {
  const result = await ClinicAssignmentFixer.fixOrphanedAssistant(userId, email);
  return result;
};