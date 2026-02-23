import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OwnerDashboardTab from './OwnerDashboardTab';
import OwnerTasksTab from './OwnerTasksTab';
import OwnerTeamTab from './OwnerTeamTab';
import OwnerSettingsTab from './OwnerSettingsTab';
import AIAssistantTab from './AIAssistantTab';
import { CourseManagementTab } from './CourseManagementTab';

interface OwnerDashboardTabsProps {
  clinicId?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function OwnerDashboardTabs({ 
  clinicId, 
  activeTab = 'dashboard', 
  onTabChange 
}: OwnerDashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <div className="hidden">
        <TabsList />
      </div>

      <TabsContent value="dashboard">
        {clinicId && <OwnerDashboardTab clinicId={clinicId} onTabChange={onTabChange} />}
      </TabsContent>

      <TabsContent value="tasks">
        {clinicId && <OwnerTasksTab clinicId={clinicId} />}
      </TabsContent>

      <TabsContent value="team">
        {clinicId && <OwnerTeamTab clinicId={clinicId} />}
      </TabsContent>

      <TabsContent value="courses">
        {clinicId && <CourseManagementTab />}
      </TabsContent>

      <TabsContent value="ai-assistant">
        {clinicId && <AIAssistantTab clinicId={clinicId} />}
      </TabsContent>

      <TabsContent value="settings">
        {clinicId && <OwnerSettingsTab clinicId={clinicId} />}
      </TabsContent>
    </Tabs>
  );
}
