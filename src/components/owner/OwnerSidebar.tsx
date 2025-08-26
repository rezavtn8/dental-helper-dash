import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Building2, 
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface OwnerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  clinic: any;
  userProfile: any;
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function OwnerSidebar({ 
  activeTab, 
  onTabChange, 
  clinic, 
  userProfile, 
  isCollapsed, 
  onToggle 
}: OwnerSidebarProps) {
  const { signOut } = useAuth();

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'w-80 lg:w-80'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-900 truncate">
                      {clinic?.name || 'Dental Clinic'}
                    </h1>
                    <p className="text-sm text-gray-500">Practice Portal</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="lg:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="mx-auto"
              >
                <Building2 className="w-5 h-5 text-teal-600" />
              </Button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`w-full justify-start p-0 h-auto ${isCollapsed ? 'justify-center' : ''}`}>
                <div className={`flex items-center space-x-3 ${isCollapsed ? 'flex-col space-x-0 space-y-1' : ''}`}>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm font-medium">
                      {getInitials(userProfile?.name || 'Owner')}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 truncate">
                          {userProfile?.name || 'Practice Owner'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-xs">
                            Owner
                          </Badge>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCollapsed ? "start" : "end"} className="w-56">
              <DropdownMenuItem onClick={() => onTabChange('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onTabChange(item.id)}
                className={`
                  w-full justify-start text-left h-12 font-medium transition-all duration-200
                  ${isCollapsed ? 'justify-center px-0' : 'px-4'}
                  ${isActive 
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25' 
                    : 'hover:bg-teal-50 hover:text-teal-700 text-gray-600'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1 h-6 bg-white/30 rounded-full" />
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Clinic Code */}
        {!isCollapsed && clinic?.clinic_code && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Clinic Code</p>
              <p className="font-mono text-sm font-semibold text-gray-900 tracking-wider">
                {clinic.clinic_code}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}