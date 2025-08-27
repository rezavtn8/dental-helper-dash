export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export const TASK_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'completed'];

export const getStatusDisplay = (status: TaskStatus): string => {
  switch (status) {
    case 'pending':
      return 'To-Do';
    case 'in-progress':
      return 'In-Progress';
    case 'completed':
      return 'Completed';
    default:
      return 'To-Do';
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const isCompleted = (status: TaskStatus): boolean => {
  return status === 'completed';
};

export const isPending = (status: TaskStatus): boolean => {
  return status === 'pending';
};

export const isInProgress = (status: TaskStatus): boolean => {
  return status === 'in-progress';
};

export const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
  switch (currentStatus) {
    case 'pending':
      return 'in-progress';
    case 'in-progress':
      return 'completed';
    case 'completed':
      return 'pending';
    default:
      return 'pending';
  }
};

export const toggleTaskCompletion = (currentStatus: TaskStatus): TaskStatus => {
  return isCompleted(currentStatus) ? 'pending' : 'completed';
};