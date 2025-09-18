import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FrontDeskHomeTab } from './FrontDeskHomeTab';
import { FrontDeskTasksTab } from './FrontDeskTasksTab';
import { FrontDeskStatsTab } from './FrontDeskStatsTab';

export function FrontDeskDashboardTabs() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-2xl font-semibold">Front Desk Dashboard</h2>
        <p className="text-muted-foreground">Manage your front desk tasks and operations</p>
      </div>

      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <div className="mt-6 h-full">
            <TabsContent value="home" className="h-full">
              <FrontDeskHomeTab />
            </TabsContent>

            <TabsContent value="tasks" className="h-full">
              <FrontDeskTasksTab />
            </TabsContent>

            <TabsContent value="stats" className="h-full">
              <FrontDeskStatsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}