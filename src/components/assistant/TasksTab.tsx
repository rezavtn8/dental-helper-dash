import React from 'react';
import TodaysTasksTab from './TodaysTasksTab';

interface TasksTabProps {
  tasks: any[];
  onTaskUpdate?: () => void;
}

export default function TasksTab({ tasks, onTaskUpdate }: TasksTabProps) {
  return <TodaysTasksTab tasks={tasks} onTaskUpdate={onTaskUpdate} />;
}