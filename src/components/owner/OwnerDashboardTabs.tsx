import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Settings 
} from 'lucide-react';
import OwnerDashboardTab from './OwnerDashboardTab';
import OwnerTasksTab from './OwnerTasksTab';
import OwnerScheduleTab from './OwnerScheduleTab';
import OwnerTeamTab from './OwnerTeamTab';
import OwnerAnalyticsTab from './OwnerAnalyticsTab';
import OwnerFeedbackTab from './OwnerFeedbackTab';
import OwnerSettingsTab from './OwnerSettingsTab';

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
      <div className="hidden"> {/* Hide the original tabs list since we're using sidebar */}
        <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="dashboard" className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Tasks
        </TabsTrigger>
        <TabsTrigger value="schedule" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Schedule
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Team
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="feedback" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Feedback & Growth
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dashboard">
        {clinicId && <OwnerDashboardTab clinicId={clinicId} onTabChange={onTabChange} />}
      </TabsContent>

      <TabsContent value="tasks">
        {clinicId && <OwnerTasksTab clinicId={clinicId} />}
      </TabsContent>

      <TabsContent value="schedule">
        {clinicId && <OwnerScheduleTab clinicId={clinicId} />}
      </TabsContent>

      <TabsContent value="team">
        {clinicId && <OwnerTeamTab clinicId={clinicId} />}
      </TabsContent>

      <TabsContent value="analytics">
        {clinicId && <OwnerAnalyticsTab clinicId={clinicId} />}
      </TabsContent>

      <TabsContent value="feedback">
        {clinicId && <OwnerFeedbackTab clinicId={clinicId} />}
      </TabsContent>

      <TabsContent value="settings">
        {clinicId && <OwnerSettingsTab clinicId={clinicId} />}
      </TabsContent>
    </Tabs>
  );
}