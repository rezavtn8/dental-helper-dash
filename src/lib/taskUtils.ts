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
import { TaskStatus, isCompleted } from '@/lib/taskStatus';
import { addDays, addWeeks, addMonths, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';

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

// Recurrence utilities
export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'none';

export interface RecurringTaskInstance extends Task {
  isRecurringInstance: boolean;
  parentTaskId: string;
  instanceDate: Date;
  originalDueDate?: Date;
  isOverdue?: boolean;
  overdueReason?: string;
}

/**
 * Generate recurring task instances for a given task within a date range
 */
export const generateRecurringInstances = (
  task: Task, 
  startDate: Date, 
  endDate: Date
): RecurringTaskInstance[] => {
  if (!task.recurrence || task.recurrence === 'none') {
    return [];
  }

  // If task is already completed, don't generate instances
  if (isCompleted(task.status)) {
    return [];
  }

  const instances: RecurringTaskInstance[] = [];
  const taskBaseDate = task.custom_due_date 
    ? new Date(task.custom_due_date)
    : new Date(task.created_at);

  // Handle special recurring patterns
  switch (task.recurrence.toLowerCase()) {
    case 'eow': // End of Week - show Monday to Sunday until completed
      return generateEOWInstances(task, startDate, endDate, taskBaseDate);
    case 'midm': // Mid Month - show for 7 days after 1st and 15th
      return generateMidMInstances(task, startDate, endDate, taskBaseDate);
    case 'eom': // End of Month - show from 25th to end of month or 1st-5th
      return generateEOMInstances(task, startDate, endDate, taskBaseDate);
    default:
      // Handle standard recurrence patterns
      return generateStandardRecurrence(task, startDate, endDate, taskBaseDate);
  }
};

/**
 * Generate EOW (End of Week) instances - show Monday to Sunday until completed
 */
const generateEOWInstances = (
  task: Task,
  startDate: Date,
  endDate: Date,
  taskBaseDate: Date
): RecurringTaskInstance[] => {
  const instances: RecurringTaskInstance[] = [];
  let currentWeekStart = new Date(startDate);
  
  // Find the Monday of the week containing startDate
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
  
  while (currentWeekStart <= endDate) {
    // Generate instances for Monday through Sunday of this week
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const instanceDate = new Date(currentWeekStart);
      instanceDate.setDate(instanceDate.getDate() + dayOfWeek);
      
      if (instanceDate >= startDate && instanceDate <= endDate) {
        const isOverdue = isEOWOverdue(instanceDate, new Date());
        const instance: RecurringTaskInstance = {
          ...task,
          id: `${task.id}_eow_${instanceDate.toISOString().split('T')[0]}`,
          isRecurringInstance: true,
          parentTaskId: task.id,
          instanceDate: new Date(instanceDate),
          originalDueDate: taskBaseDate,
          custom_due_date: instanceDate.toISOString(),
          status: 'pending' as TaskStatus,
          completed_at: undefined,
          completed_by: undefined,
          isOverdue,
          overdueReason: isOverdue ? getOverdueReason({ ...task, recurrence: 'eow' }) : undefined
        };
        instances.push(instance);
      }
    }
    
    // Move to next week
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  return instances;
};

/**
 * Generate MidM (Mid Month) instances - show for 7 days after 1st and 15th
 */
const generateMidMInstances = (
  task: Task,
  startDate: Date,
  endDate: Date,
  taskBaseDate: Date
): RecurringTaskInstance[] => {
  const instances: RecurringTaskInstance[] = [];
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  while (currentDate <= endDate) {
    // Generate instances for 1st-7th of the month
    const firstPeriodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstPeriodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 7);
    
    for (let day = 1; day <= 7; day++) {
      const instanceDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      if (instanceDate >= startDate && instanceDate <= endDate) {
        instances.push(createMidMInstance(task, instanceDate, taskBaseDate, 'first'));
      }
    }
    
    // Generate instances for 15th-21st of the month
    const secondPeriodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
    const secondPeriodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 21);
    
    for (let day = 15; day <= 21; day++) {
      const instanceDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      if (instanceDate >= startDate && instanceDate <= endDate) {
        instances.push(createMidMInstance(task, instanceDate, taskBaseDate, 'second'));
      }
    }
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return instances;
};

const createMidMInstance = (
  task: Task,
  instanceDate: Date,
  taskBaseDate: Date,
  period: 'first' | 'second'
): RecurringTaskInstance => {
  const isOverdue = isMidMOverdue(instanceDate, new Date());
  return {
    ...task,
    id: `${task.id}_midm_${period}_${instanceDate.toISOString().split('T')[0]}`,
    isRecurringInstance: true,
    parentTaskId: task.id,
    instanceDate: new Date(instanceDate),
    originalDueDate: taskBaseDate,
    custom_due_date: instanceDate.toISOString(),
    status: 'pending' as TaskStatus,
    completed_at: undefined,
    completed_by: undefined,
    isOverdue,
    overdueReason: isOverdue ? getOverdueReason({ ...task, recurrence: 'midm' }) : undefined
  };
};

/**
 * Generate EOM (End of Month) instances - show from 25th to end of month or 1st-5th
 */
const generateEOMInstances = (
  task: Task,
  startDate: Date,
  endDate: Date,
  taskBaseDate: Date
): RecurringTaskInstance[] => {
  const instances: RecurringTaskInstance[] = [];
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  while (currentDate <= endDate) {
    // Generate instances for 25th to end of month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 25; day <= lastDayOfMonth; day++) {
      const instanceDate = new Date(year, month, day);
      if (instanceDate >= startDate && instanceDate <= endDate) {
        instances.push(createEOMInstance(task, instanceDate, taskBaseDate, 'end'));
      }
    }
    
    // Generate instances for 1st-5th of the month (continuation of previous month's EOM)
    for (let day = 1; day <= 5; day++) {
      const instanceDate = new Date(year, month, day);
      if (instanceDate >= startDate && instanceDate <= endDate) {
        instances.push(createEOMInstance(task, instanceDate, taskBaseDate, 'start'));
      }
    }
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return instances;
};

const createEOMInstance = (
  task: Task,
  instanceDate: Date,
  taskBaseDate: Date,
  period: 'end' | 'start'
): RecurringTaskInstance => {
  const isOverdue = isEOMOverdue(instanceDate, new Date());
  return {
    ...task,
    id: `${task.id}_eom_${period}_${instanceDate.toISOString().split('T')[0]}`,
    isRecurringInstance: true,
    parentTaskId: task.id,
    instanceDate: new Date(instanceDate),
    originalDueDate: taskBaseDate,
    custom_due_date: instanceDate.toISOString(),
    status: 'pending' as TaskStatus,
    completed_at: undefined,
    completed_by: undefined,
    isOverdue,
    overdueReason: isOverdue ? getOverdueReason({ ...task, recurrence: 'eom' }) : undefined
  };
};

/**
 * Generate standard recurrence instances (daily, weekly, monthly, etc.)
 */
const generateStandardRecurrence = (
  task: Task,
  startDate: Date,
  endDate: Date,
  taskBaseDate: Date
): RecurringTaskInstance[] => {
  const instances: RecurringTaskInstance[] = [];
  let currentDate = new Date(taskBaseDate);
  let instanceCount = 0;
  const maxInstances = 365;

  while (currentDate <= endDate && instanceCount < maxInstances) {
    if (currentDate >= startDate) {
      const instance: RecurringTaskInstance = {
        ...task,
        id: `${task.id}_${currentDate.toISOString().split('T')[0]}`,
        isRecurringInstance: true,
        parentTaskId: task.id,
        instanceDate: new Date(currentDate),
        originalDueDate: taskBaseDate,
        custom_due_date: currentDate.toISOString(),
        status: 'pending' as TaskStatus,
        completed_at: undefined,
        completed_by: undefined
      };
      instances.push(instance);
    }
    
    instanceCount++;

    // Calculate next occurrence based on recurrence pattern
    switch (task.recurrence.toLowerCase()) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        currentDate = addDays(currentDate, 7);
        break;
      case 'biweekly':
        currentDate = addDays(currentDate, 14);
        break;
      case 'monthly':
        currentDate = addDays(currentDate, 30);
        break;
      case 'quarterly':
        currentDate = addDays(currentDate, 90);
        break;
      case 'yearly':
        currentDate = addDays(currentDate, 365);
        break;
      default:
        // Unknown recurrence pattern, break the loop
        break;
    }
  }

  return instances;
};

/**
 * Expand a list of tasks to include recurring instances within a date range
 */
export const expandTasksWithRecurrence = (
  tasks: Task[], 
  startDate: Date, 
  endDate: Date
): (Task | RecurringTaskInstance)[] => {
  const expandedTasks: (Task | RecurringTaskInstance)[] = [...tasks];
  
  tasks.forEach(task => {
    if (task.recurrence && task.recurrence !== 'none') {
      // Only generate instances if the task is not completed
      // For recurring tasks, we consider them "active" until explicitly completed
      if (!isCompleted(task.status)) {
        const instances = generateRecurringInstances(task, startDate, endDate);
        expandedTasks.push(...instances);
      }
    }
  });

  return expandedTasks;
};

/**
 * Check if a recurring task instance is overdue based on its type and current date
 */
export const isRecurringTaskOverdue = (task: Task, currentDate: Date = new Date()): boolean => {
  if (isCompleted(task.status) || !task.recurrence) {
    return false;
  }

  const today = new Date(currentDate);
  const taskDate = task.custom_due_date ? new Date(task.custom_due_date) : new Date(task.created_at);
  
  switch (task.recurrence.toLowerCase()) {
    case 'eow': // End of Week - overdue if not done by Sunday
      return isEOWOverdue(taskDate, today);
    case 'midm': // Mid Month - overdue if not done within 7 days of cycle
      return isMidMOverdue(taskDate, today);
    case 'eom': // End of Month - overdue if not done by last day of month
      return isEOMOverdue(taskDate, today);
    default:
      return false;
  }
};

/**
 * Check if EOW task is overdue (not done by Sunday of the same week)
 */
const isEOWOverdue = (taskDate: Date, currentDate: Date): boolean => {
  const taskWeekStart = new Date(taskDate);
  taskWeekStart.setDate(taskWeekStart.getDate() - taskWeekStart.getDay() + 1); // Monday of task week
  
  const taskWeekEnd = new Date(taskWeekStart);
  taskWeekEnd.setDate(taskWeekEnd.getDate() + 6); // Sunday of task week
  taskWeekEnd.setHours(23, 59, 59, 999);
  
  return currentDate > taskWeekEnd;
};

/**
 * Check if MidM task is overdue (not done within 7 days of cycle)
 */
const isMidMOverdue = (taskDate: Date, currentDate: Date): boolean => {
  const day = taskDate.getDate();
  const month = taskDate.getMonth();
  const year = taskDate.getFullYear();
  
  let cycleEndDate: Date;
  
  if (day <= 7) {
    // First cycle (1st-7th), due by 7th
    cycleEndDate = new Date(year, month, 7, 23, 59, 59, 999);
  } else {
    // Second cycle (15th-21st), due by 21st
    cycleEndDate = new Date(year, month, 21, 23, 59, 59, 999);
  }
  
  return currentDate > cycleEndDate;
};

/**
 * Check if EOM task is overdue (not done by last day of month)
 */
const isEOMOverdue = (taskDate: Date, currentDate: Date): boolean => {
  const month = taskDate.getMonth();
  const year = taskDate.getFullYear();
  
  // Get last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  lastDayOfMonth.setHours(23, 59, 59, 999);
  
  return currentDate > lastDayOfMonth;
};

/**
 * Get overdue reason text for recurring tasks
 */
export const getOverdueReason = (task: Task): string => {
  switch (task.recurrence?.toLowerCase()) {
    case 'eow':
      return 'Overdue - should have been completed by Sunday';
    case 'midm':
      return 'Overdue - should have been completed within the cycle period';
    case 'eom':
      return 'Overdue - should have been completed by end of month';
    default:
      return 'Overdue';
  }
};
export const shouldShowRecurringInstances = (task: Task): boolean => {
  // Don't show instances if the parent task is completed
  if (isCompleted(task.status)) {
    return false;
  }
  
  // For EOW, MidM, EOM tasks, they should continue showing until marked complete
  const recurringPatterns = ['eow', 'midm', 'eom'];
  if (recurringPatterns.includes(task.recurrence?.toLowerCase() || '')) {
    return true;
  }
  
  // For other recurring patterns, use standard logic
  return !isCompleted(task.status);
};

/**
 * Check if a task instance is a recurring instance
 */
export const isRecurringInstance = (task: Task | RecurringTaskInstance): task is RecurringTaskInstance => {
  return 'isRecurringInstance' in task && task.isRecurringInstance === true;
};

/**
 * Get tasks for a specific date, including recurring instances
 */
export const getTasksForDate = (
  tasks: Task[], 
  targetDate: Date
): (Task | RecurringTaskInstance)[] => {
  const startOfTargetDate = startOfDay(targetDate);
  const endOfTargetDate = endOfDay(targetDate);
  
  // Expand tasks with recurrence for the target date range
  const expandedTasks = expandTasksWithRecurrence(tasks, startOfTargetDate, endOfTargetDate);
  
  // Filter tasks that match the target date
  return expandedTasks.filter(task => {
    const taskDate = task.custom_due_date 
      ? startOfDay(new Date(task.custom_due_date))
      : startOfDay(new Date(task.created_at));
    
    return taskDate.getTime() === startOfTargetDate.getTime();
  });
};

/**
 * Get tasks for a date range, including recurring instances
 */
export const getTasksForDateRange = (
  tasks: Task[], 
  startDate: Date, 
  endDate: Date
): (Task | RecurringTaskInstance)[] => {
  return expandTasksWithRecurrence(tasks, startDate, endDate);
};
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
  
  // Recurrence
  generateRecurringInstances,
  expandTasksWithRecurrence,
  isRecurringInstance,
  getTasksForDate,
  getTasksForDateRange,
  shouldShowRecurringInstances,
  isRecurringTaskOverdue,
  getOverdueReason,
  
  // Validation
  isValidTask,
  canUserModifyTask
};