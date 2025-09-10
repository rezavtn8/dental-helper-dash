import { Task } from '@/types/task';
import { TaskStatus } from '@/lib/taskStatus';

export interface TaskOperation {
  id: string;
  operation: 'claim' | 'start' | 'complete' | 'reset' | 'return' | 'undo';
  taskId: string;
  timestamp: number;
}

export const getTaskDisplayInfo = (task: Task, currentUserId?: string) => {
  const isAssignedToMe = task.assigned_to === currentUserId;
  const isUnassigned = !task.assigned_to;
  const canClaim = isUnassigned && task.status !== 'completed';
  const canStart = isAssignedToMe && task.status === 'pending';
  const canComplete = isAssignedToMe && (task.status === 'pending' || task.status === 'in-progress');
  const canReset = isAssignedToMe && task.status === 'in-progress';
  const canReturn = isAssignedToMe && task.status !== 'completed';
  const canUndo = isAssignedToMe && task.status === 'completed';

  return {
    isAssignedToMe,
    isUnassigned,
    canClaim,
    canStart,
    canComplete,
    canReset,
    canReturn,
    canUndo
  };
};

export const getTaskStatusColor = (status: TaskStatus, isOverdue = false) => {
  if (isOverdue) return 'bg-red-50 border-red-200';
  
  switch (status) {
    case 'completed':
      return 'bg-green-50 border-green-200';
    case 'in-progress':
      return 'bg-yellow-50 border-yellow-200';
    case 'pending':
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export const getNextTaskStatus = (currentStatus: TaskStatus, operation: string): TaskStatus => {
  switch (operation) {
    case 'start':
      return 'in-progress';
    case 'complete':
      return 'completed';
    case 'reset':
    case 'return':
    case 'undo':
      return 'pending';
    default:
      return currentStatus;
  }
};