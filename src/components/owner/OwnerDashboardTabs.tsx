import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, Settings } from 'lucide-react';
import SimpleTeamView from './SimpleTeamView';

export default function OwnerDashboardTabs() {
  return (
    <Tabs defaultValue="team" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="team" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Team
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="team">
        <SimpleTeamView />
      </TabsContent>

      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4" />
              <p>Analytics coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4" />
              <p>Settings coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}