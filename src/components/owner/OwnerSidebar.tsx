import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getUserInitials } from '@/lib/taskUtils';
import { useNavigate } from 'react-router-dom';
import { StaticLogo } from '@/components/ui/static-logo';
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
  UserPlus,
  ScrollText,
  Bot,
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
  { id: 'task-calendar', label: 'Task Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'schedule', label: 'Team Schedule', icon: CalendarDays },
  { id: 'log', label: 'Logs', icon: ScrollText },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
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
  const navigate = useNavigate();
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
        {/* DentaLeague Brand */}
        <div className="p-3 border-b border-slate-100/80">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 h-auto p-0 hover:bg-transparent w-full justify-start"
            onClick={() => navigate('/')}
            aria-label="DentaLeague home"
          >
            {open && !isCollapsed ? (
              <>
                <StaticLogo size={72} className="text-primary" />
                <span className="font-semibold text-base text-foreground">DentaLeague</span>
              </>
            ) : (
              <div className="mx-auto">
                <StaticLogo size={72} className="text-primary" />
              </div>
            )}
          </Button>
        </div>

        {/* User Profile Section Removed - Now in Header */}

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