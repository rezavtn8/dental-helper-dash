import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FrontDeskHomeTab } from './FrontDeskHomeTab';
import { FrontDeskTasksTab } from './FrontDeskTasksTab';
import { LearningHub } from '@/components/learning/LearningHub';

interface FrontDeskDashboardTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function FrontDeskDashboardTabs({ activeTab = 'home', onTabChange }: FrontDeskDashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="h-full">
      <div className="hidden">
        <TabsList />
      </div>

      <TabsContent value="home" className="h-full">
        <FrontDeskHomeTab />
      </TabsContent>

      <TabsContent value="tasks" className="h-full">
        <FrontDeskTasksTab />
      </TabsContent>

      <TabsContent value="learning" className="h-full">
        <LearningHub />
      </TabsContent>

      <TabsContent value="settings" className="h-full">
        <div className="text-center py-12 text-muted-foreground">
          <p>Settings coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
