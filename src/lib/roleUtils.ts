/**
 * Role utilities for consistent role-based styling and behavior
 */

export type UserRole = 'owner' | 'assistant' | 'front_desk' | 'admin';

/**
 * Get consistent badge styling for roles
 */
export const getRoleBadgeStyle = (role: string): string => {
  switch (role) {
    case 'owner':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'assistant':
      return 'bg-green-50 text-green-600 border-green-100';
    case 'front_desk':
      return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'admin':
      return 'bg-orange-50 text-orange-600 border-orange-100';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'assistant':
      return 'Assistant';
    case 'front_desk':
      return 'Front Desk';
    case 'admin':
      return 'Admin';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

/**
 * Get avatar gradient for roles
 */
export const getRoleAvatarGradient = (role: string): string => {
  switch (role) {
    case 'owner':
      return 'from-blue-500 to-indigo-600';
    case 'assistant':
      return 'from-green-500 to-emerald-600';
    case 'front_desk':
      return 'from-purple-500 to-violet-600';
    case 'admin':
      return 'from-orange-500 to-amber-600';
    default:
      return 'from-gray-500 to-slate-600';
  }
};
