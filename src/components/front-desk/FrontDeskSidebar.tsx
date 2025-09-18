import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  LogOut, 
  Settings,
  ChevronLeft,
  Users,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RoleSwitcher } from '@/components/ui/role-switcher';

export function FrontDeskSidebar() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account."
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRoleSwitch = () => {
    if (userProfile?.roles?.includes('assistant')) {
      navigate('/assistant');
    }
  };

  const canSwitchRoles = userProfile?.roles && userProfile.roles.length > 1;

  if (isCollapsed) {
    return (
      <div className="w-16 bg-card/30 border-r border-border flex flex-col">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="w-full p-2"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
        
        <div className="flex-1" />
        
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card/30 border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Front Desk</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* User Profile Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userProfile?.name || 'Front Desk User'}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <RoleSwitcher 
                    currentRole="front_desk"
                    availableRoles={userProfile?.roles || ['front_desk']}
                    userProfile={userProfile}
                    variant="inline"
                    className="flex-wrap"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Users className="h-4 w-4 mr-2" />
                View Tasks
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Separator />
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}