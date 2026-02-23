import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssistantHomeTab from './AssistantHomeTab';
import AssistantTasksTab from './AssistantTasksTab';
import AssistantScheduleTab from './AssistantScheduleTab';
import { LearningHub } from '../learning/LearningHub';
import AssistantSettingsTab from './AssistantSettingsTab';

interface AssistantDashboardTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function AssistantDashboardTabs({ 
  activeTab = 'home', 
  onTabChange 
}: AssistantDashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <div className="hidden">
        <TabsList />
      </div>

      <TabsContent value="home">
        <AssistantHomeTab onViewAll={() => onTabChange?.('tasks')} />
      </TabsContent>

      <TabsContent value="tasks">
        <AssistantTasksTab />
      </TabsContent>

      <TabsContent value="schedule">
        <AssistantScheduleTab />
      </TabsContent>

      <TabsContent value="learning">
        <LearningHub />
      </TabsContent>

      <TabsContent value="settings">
        <AssistantSettingsTab />
      </TabsContent>
    </Tabs>
  );
}
