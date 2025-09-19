import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home,
  CheckSquare, 
  Calendar, 
  BarChart3, 
  BookOpen,
  Award,
  MessageSquare,
  Settings
} from 'lucide-react';
import AssistantHomeTab from './AssistantHomeTab';
import AssistantTasksTab from './AssistantTasksTab';
import AssistantScheduleTab from './AssistantScheduleTab';
import AssistantStatsTab from './AssistantStatsTab';
import AssistantLearningTab from './AssistantLearningTab';
import { LearningHub } from '../learning/LearningHub';
import AssistantCertificationsTab from './AssistantCertificationsTab';
import AssistantFeedbackTab from './AssistantFeedbackTab';
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
      <div className="hidden"> {/* Hide the original tabs list since we're using sidebar */}
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="home" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Home
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            My Stats
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Learning
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="home">
        <AssistantHomeTab />
      </TabsContent>

      <TabsContent value="tasks">
        <AssistantTasksTab />
      </TabsContent>

      <TabsContent value="schedule">
        <AssistantScheduleTab />
      </TabsContent>

      <TabsContent value="stats">
        <AssistantStatsTab tasks={[]} />
      </TabsContent>

      <TabsContent value="learning">
        <LearningHub />
      </TabsContent>

      <TabsContent value="certifications">
        <AssistantCertificationsTab />
      </TabsContent>

      <TabsContent value="feedback">
        <AssistantFeedbackTab />
      </TabsContent>

      <TabsContent value="settings">
        <AssistantSettingsTab />
      </TabsContent>
    </Tabs>
  );
}