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
  CheckSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  Building2, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AssistantSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  clinic: any;
  userProfile: any;
}

const navigationItems = [
  { id: 'tasks', label: 'Today\'s Tasks', icon: CheckSquare },
  { id: 'stats', label: 'My Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AssistantSidebar({ 
  activeTab, 
  onTabChange, 
  clinic, 
  userProfile
}: AssistantSidebarProps) {
  const { signOut } = useAuth();
  const { open } = useSidebar();
  const [isCollapsed] = useState(false);

  const isActive = (tabId: string) => activeTab === tabId;

  return (
    <Sidebar className="border-r border-teal-100 bg-white">
      <SidebarContent>
        {/* Clinic Header */}
        <div className="p-6 border-b border-teal-50 bg-gradient-to-r from-teal-50 to-blue-50">
          {open && !isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-teal-900 truncate text-lg">
                  {clinic?.name || 'Dental Clinic'}
                </h1>
                <p className="text-sm text-teal-600 font-medium">Assistant Portal</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-teal-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`w-full justify-start p-0 h-auto hover:bg-teal-50 ${!open || isCollapsed ? 'justify-center' : ''}`}>
                <div className={`flex items-center space-x-3 ${!open || isCollapsed ? 'flex-col space-x-0 space-y-2' : ''}`}>
                  <Avatar className="w-12 h-12 border-2 border-teal-200 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                      {getUserInitials(userProfile?.name || 'Assistant')}
                    </AvatarFallback>
                  </Avatar>
                  {open && !isCollapsed && (
                    <>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-teal-900 truncate text-base">
                          {userProfile?.name || 'Assistant'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-xs font-medium border-teal-200">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {userProfile?.role === 'admin' ? 'Admin Assistant' : 'Assistant'}
                          </Badge>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-teal-500" />
                    </>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={!open || isCollapsed ? "start" : "end"} className="w-56 shadow-xl border-teal-100">
              <DropdownMenuItem onClick={() => onTabChange('settings')} className="hover:bg-teal-50">
                <Settings className="mr-2 h-4 w-4 text-teal-600" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-teal-100" />
              <DropdownMenuItem onClick={signOut} className="text-red-600 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-teal-700 font-semibold tracking-wide">
            {(open && !isCollapsed) && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.id);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      className={`
                        h-12 transition-all duration-200 rounded-xl mx-2 mb-1
                        ${!open || isCollapsed ? 'justify-center px-0' : 'px-4'}
                        ${active 
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-teal-700' 
                          : 'hover:bg-teal-50 hover:text-teal-700 text-teal-600'
                        }
                      `}
                    >
                      <button onClick={() => onTabChange(item.id)} className="w-full flex items-center">
                        <Icon className={`w-5 h-5 ${(!open || isCollapsed) ? '' : 'mr-3'}`} />
                        {(open && !isCollapsed) && (
                          <>
                            <span className="font-medium">{item.label}</span>
                            {active && (
                              <div className="ml-auto w-2 h-2 bg-white/80 rounded-full" />
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

      {/* Footer with Clinic Code */}
      {clinic?.clinic_code && (
        <SidebarFooter className="border-t border-teal-50">
          {(open && !isCollapsed) && (
            <div className="p-4">
              <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                <p className="text-xs font-semibold text-teal-600 mb-1 uppercase tracking-wide">Clinic Code</p>
                <p className="font-mono text-sm font-bold text-teal-900 tracking-wider">
                  {clinic.clinic_code}
                </p>
              </div>
            </div>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}