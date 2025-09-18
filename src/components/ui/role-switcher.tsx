import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, RotateCcw, UserCheck, Users } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: string;
  availableRoles: string[];
  userProfile: any;
  variant?: 'dropdown' | 'inline';
  className?: string;
}

export function RoleSwitcher({ 
  currentRole, 
  availableRoles, 
  userProfile, 
  variant = 'dropdown',
  className = '' 
}: RoleSwitcherProps) {
  const navigate = useNavigate();

  if (!availableRoles || availableRoles.length <= 1) {
    return null;
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'assistant': return 'Assistant';
      case 'front_desk': return 'Front Desk';
      case 'owner': return 'Owner';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'assistant': return UserCheck;
      case 'front_desk': return Users;
      case 'owner': return Users; // Could use a crown icon if available
      default: return Users;
    }
  };

  const handleRoleSwitch = (role: string) => {
    if (role === currentRole) return;
    
    // Store the selected role preference
    localStorage.setItem('preferred_role', role);
    
    // Navigate to the appropriate dashboard
    switch (role) {
      case 'assistant':
        navigate('/assistant');
        break;
      case 'front_desk':
        navigate('/front-desk');
        break;
      case 'owner':
        navigate('/owner');
        break;
      default:
        break;
    }
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs text-muted-foreground">Switch to:</span>
        {availableRoles.filter(role => role !== currentRole).map((role) => {
          const Icon = getRoleIcon(role);
          return (
            <Button
              key={role}
              variant="ghost"
              size="sm"
              onClick={() => handleRoleSwitch(role)}
              className="h-6 px-2 text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {getRoleDisplayName(role)}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`flex items-center gap-2 ${className}`}>
          <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
            {getRoleDisplayName(currentRole)}
          </Badge>
          <RotateCcw className="h-3 w-3" />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Switch Role
        </div>
        <DropdownMenuSeparator />
        {availableRoles.map((role) => {
          const Icon = getRoleIcon(role);
          const isActive = role === currentRole;
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              disabled={isActive}
              className={`flex items-center gap-2 ${isActive ? 'bg-muted' : ''}`}
            >
              <Icon className="h-4 w-4" />
              <span>{getRoleDisplayName(role)}</span>
              {isActive && (
                <Badge variant="outline" className="ml-auto text-xs">
                  Current
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}