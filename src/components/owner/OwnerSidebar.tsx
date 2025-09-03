import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getUserInitials } from '@/lib/taskUtils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard,
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Building2, 
  ChevronDown,
  Crown,
  Calendar,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  FileText,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface OwnerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  clinic: any;
  userProfile: any;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'schedule', label: 'Team Schedule', icon: CalendarDays },
  { id: 'task-calendar', label: 'Task Calendar', icon: Calendar },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function OwnerSidebar({ 
  activeTab, 
  onTabChange, 
  clinic, 
  userProfile
}: OwnerSidebarProps) {
  const { signOut } = useAuth();
  const { open } = useSidebar();
  const [isCollapsed] = useState(false);

  const isActive = (tabId: string) => activeTab === tabId;

  const copyClinicCode = () => {
    if (clinic?.clinic_code) {
      navigator.clipboard.writeText(clinic.clinic_code);
    }
  };

  return (
    <Sidebar className="border-r border-slate-200/60 bg-white/95 backdrop-blur-sm">
      <SidebarContent className="px-2">
        {/* Clinic Header - Compact */}
        <div className="p-3 border-b border-slate-100/80">
          {open && !isCollapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-slate-800 truncate text-sm">
                  {clinic?.name || 'Dental Clinic'}
                </h1>
                <p className="text-xs text-slate-500">Owner Portal</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* User Profile - Compact */}
        <div className="p-3 border-b border-slate-100/80">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`w-full justify-start p-1 h-auto hover:bg-slate-50 rounded-lg ${!open || isCollapsed ? 'justify-center' : ''}`}>
                <div className={`flex items-center space-x-2 ${!open || isCollapsed ? 'flex-col space-x-0' : ''}`}>
                  <Avatar className="w-8 h-8 border border-slate-200">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium">
                      {getUserInitials(userProfile?.name || 'Owner')}
                    </AvatarFallback>
                  </Avatar>
                  {open && !isCollapsed && (
                    <>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-slate-800 truncate text-sm">
                          {userProfile?.name || 'Practice Owner'}
                        </p>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs border-blue-100 h-4 px-1.5">
                          <Crown className="w-2.5 h-2.5 mr-1" />
                          Owner
                        </Badge>
                      </div>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={!open || isCollapsed ? "start" : "end"} className="w-48 shadow-lg border-slate-200">
              <DropdownMenuItem onClick={() => onTabChange('settings')} className="hover:bg-slate-50 text-sm">
                <Settings className="mr-2 h-3.5 w-3.5 text-slate-500" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 hover:bg-red-50 text-sm">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation - Compact */}
        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="text-slate-500 font-medium text-xs mb-2 px-2">
            {(open && !isCollapsed) && "NAVIGATION"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.id);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      className={`
                        h-9 transition-all duration-150 rounded-lg mx-1
                        ${!open || isCollapsed ? 'justify-center px-0 w-9' : 'px-3'}
                        ${active 
                          ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-600' 
                          : 'hover:bg-slate-50 hover:text-slate-700 text-slate-600'
                        }
                      `}
                    >
                      <button onClick={() => onTabChange(item.id)} className="w-full flex items-center">
                        <Icon className={`w-4 h-4 ${(!open || isCollapsed) ? '' : 'mr-2.5'} flex-shrink-0`} />
                        {(open && !isCollapsed) && (
                          <>
                            <span className="font-medium text-sm truncate">{item.label}</span>
                            {active && (
                              <div className="ml-auto w-1.5 h-1.5 bg-white/90 rounded-full flex-shrink-0" />
                            )}
                          </>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Clinic Code - Compact */}
      {clinic?.clinic_code && (
        <SidebarFooter className="border-t border-slate-100/80 p-2">
          {(open && !isCollapsed) && (
            <button 
              onClick={copyClinicCode}
              className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 hover:bg-slate-100 transition-colors text-left w-full"
            >
              <p className="text-xs font-medium text-slate-500 mb-0.5">Clinic Code</p>
              <p className="font-mono text-xs font-semibold text-slate-700 tracking-wide">
                {clinic.clinic_code}
              </p>
            </button>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}