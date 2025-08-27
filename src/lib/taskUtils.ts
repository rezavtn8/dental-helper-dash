/**
 * Task Utilities Module
 * 
 * This module provides centralized, reusable utility functions for task management.
 * It eliminates duplicate logic across owner and assistant components by providing
 * pure functions for common task operations.
 * 
 * Key features:
 * - Priority styling and labels
 * - Due date formatting and validation
 * - User utilities (initials, etc.)
 * - Task filtering and grouping
 * - Task statistics calculation
 * - Assistant lookup utilities
 * - Permission validation
 * 
 * Usage:
 * import { getPriorityStyles, filterTasks, taskUtils } from '@/lib/taskUtils';
 */

import { Task, Assistant } from '@/types/task';

// Priority utilities
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export const getPriorityLabel = (priority?: string): string => {
  if (!priority) return 'Medium';
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
};

export const getPriorityStyles = (priority?: string): string => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Due date utilities
export type DueType = 'morning' | 'afternoon' | 'evening' | 'end-of-day' | 'EoD' | 'custom' | 'none';

export const getDueText = (task: Task): string => {
  if (task['due-type'] === 'custom' && task.custom_due_date) {
    const date = new Date(task.custom_due_date);
    return `Due ${date.toLocaleDateString()}`;
  }
  
  switch (task['due-type']) {
    case 'morning':
      return 'Due Morning';
    case 'afternoon':
      return 'Due Afternoon';
    case 'evening':
      return 'Due Evening';
    case 'end-of-day':
    case 'EoD':
      return 'Due End of Day';
    case 'none':
      return 'No due date';
    default:
      return task['due-type'] || 'No due date';
  }
};

export const isDueToday = (task: Task): boolean => {
  if (task['due-type'] === 'custom' && task.custom_due_date) {
    const dueDate = new Date(task.custom_due_date);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  }
  return task['due-type'] && task['due-type'] !== 'none';
};

// User utilities
export const getUserInitials = (name?: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Task filtering utilities
export interface TaskFilters {
  searchTerm?: string;
  statusFilter?: string;
  priorityFilter?: string;
  assigneeFilter?: string;
}

export const filterTasks = (
  tasks: Task[], 
  filters: TaskFilters,
  assistants?: Assistant[]
): Task[] => {
  const {
    searchTerm = '',
    statusFilter = 'all',
    priorityFilter = 'all',
    assigneeFilter = 'all'
  } = filters;

  return tasks.filter(task => {
    // Search filter
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && task.status === 'pending') ||
      (statusFilter === 'in-progress' && task.status === 'in-progress') ||
      (statusFilter === 'completed' && task.status === 'completed');
    
    // Priority filter
    const matchesPriority = priorityFilter === 'all' || 
      task.priority?.toLowerCase() === priorityFilter;
    
    // Assignee filter
    const matchesAssignee = assigneeFilter === 'all' || 
      (assigneeFilter === 'unassigned' && !task.assigned_to) ||
      task.assigned_to === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });
};

// Task grouping utilities
export const getTodaysTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(isDueToday);
};

export const getTasksByStatus = (tasks: Task[], status: string): Task[] => {
  return tasks.filter(task => task.status === status);
};

export const getTasksByAssignee = (tasks: Task[], assigneeId?: string): Task[] => {
  if (!assigneeId) return tasks.filter(task => !task.assigned_to);
  return tasks.filter(task => task.assigned_to === assigneeId);
};

export const getUnassignedTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => !task.assigned_to);
};

// Task statistics utilities
export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueToday: number;
  unassigned: number;
}

export const calculateTaskStats = (tasks: Task[]): TaskStats => {
  const stats: TaskStats = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    unassigned: 0
  };

  tasks.forEach(task => {
    // Status counts
    switch (task.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'in-progress':
        stats.inProgress++;
        break;
      case 'completed':
        stats.completed++;
        break;
    }

    // Due today count
    if (isDueToday(task)) {
      stats.dueToday++;
    }

    // Unassigned count
    if (!task.assigned_to) {
      stats.unassigned++;
    }

    // Overdue logic (simple implementation for now)
    if (task.status !== 'completed' && task.custom_due_date) {
      const dueDate = new Date(task.custom_due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        stats.overdue++;
      }
    }
  });

  return stats;
};

// Assistant utilities
export const findAssignedAssistant = (task: Task, assistants: Assistant[]): Assistant | null => {
  if (!task.assigned_to) return null;
  return assistants.find(assistant => assistant.id === task.assigned_to) || null;
};

// Task validation utilities
export const isValidTask = (task: Partial<Task>): task is Task => {
  return !!(task.id && task.title && task.clinic_id);
};

export const canUserModifyTask = (task: Task, userId?: string, userRole?: string): boolean => {
  if (!userId || !userRole) return false;
  
  // Owners can modify all tasks in their clinic
  if (userRole === 'owner') return true;
  
  // Assistants can only modify tasks assigned to them
  if (userRole === 'assistant') {
    return task.assigned_to === userId;
  }
  
  return false;
};

// Export all utilities as default object for easier importing
export const taskUtils = {
  // Priority
  getPriorityLabel,
  getPriorityStyles,
  
  // Due dates
  getDueText,
  isDueToday,
  
  // Users
  getUserInitials,
  
  // Filtering
  filterTasks,
  
  // Grouping
  getTodaysTasks,
  getTasksByStatus,
  getTasksByAssignee,
  getUnassignedTasks,
  
  // Statistics
  calculateTaskStats,
  
  // Assistants
  findAssignedAssistant,
  
  // Validation
  isValidTask,
  canUserModifyTask
};