import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getUserInitials } from '@/lib/taskUtils';
import { useNavigate } from 'react-router-dom';
import { AnimatedLogo } from '@/components/ui/animated-logo';
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
  Home,
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Building2, 
  ChevronDown,
  BookOpen,
  Award,
  MessageSquare,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NewAssistantSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  clinic: any;
  userProfile: any;
}

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'stats', label: 'My Stats', icon: BarChart3 },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function NewAssistantSidebar({ 
  activeTab, 
  onTabChange, 
  clinic, 
  userProfile
}: NewAssistantSidebarProps) {
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
                <AnimatedLogo size={72} animated={false} className="text-primary" />
                <span className="font-semibold text-base text-foreground">DentaLeague</span>
              </>
            ) : (
              <div className="mx-auto">
                <AnimatedLogo size={72} animated={false} className="text-primary" />
              </div>
            )}
          </Button>
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
            <div className="space-y-2">
              <button 
                onClick={copyClinicCode}
                className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 hover:bg-slate-100 transition-colors text-left w-full"
              >
                <p className="text-xs font-medium text-slate-500 mb-0.5">Clinic Code</p>
                <p className="font-mono text-xs font-semibold text-slate-700 tracking-wide">
                  {clinic.clinic_code}
                </p>
              </button>
              
              {/* Quick Join Button for non-clinic users */}
              {!userProfile?.clinic_id && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/join')}
                  className="w-full text-xs"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Join Clinic
                </Button>
              )}
            </div>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}