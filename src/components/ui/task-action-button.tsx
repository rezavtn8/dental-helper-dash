import React from 'react';
import { Button } from '@/components/ui/button';
import { TaskStatus } from '@/lib/taskStatus';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Hand,
  Undo2,
  RotateCcw,
  Play,
  Check,
  ArrowUp,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskActionButtonProps {
  status: TaskStatus;
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
  className?: string;
  action?: 'toggle' | 'pickup' | 'return' | 'undo';
}

export function TaskActionButton({ 
  status, 
  onClick, 
  size = 'md',
  variant = 'ghost',
  showLabel = false,
  className,
  action = 'toggle'
}: TaskActionButtonProps) {
  const getButtonConfig = () => {
    if (action === 'pickup') {
      return {
        icon: ArrowUp,
        label: 'Pick Up',
        bgColor: 'hover:bg-blue-50',
        iconColor: 'text-blue-600',
        borderColor: 'hover:border-blue-200'
      };
    }
    
    if (action === 'return') {
      return {
        icon: ArrowLeft,
        label: 'Return',
        bgColor: 'hover:bg-slate-50',
        iconColor: 'text-slate-600',
        borderColor: 'hover:border-slate-200'
      };
    }
    
    if (action === 'undo') {
      return {
        icon: Undo2,
        label: 'Undo',
        bgColor: 'hover:bg-orange-50',
        iconColor: 'text-orange-600',
        borderColor: 'hover:border-orange-200'
      };
    }

    // Default toggle behavior
    switch (status) {
      case 'pending':
        return {
          icon: Hand,
          label: 'Start',
          bgColor: 'hover:bg-blue-50',
          iconColor: 'text-blue-600',
          borderColor: 'hover:border-blue-200'
        };
      case 'in-progress':
        return {
          icon: CheckCircle,
          label: 'Complete',
          bgColor: 'hover:bg-green-50',
          iconColor: 'text-green-600',
          borderColor: 'hover:border-green-200'
        };
      case 'completed':
        return {
          icon: Undo2,
          label: 'Undo',
          bgColor: 'hover:bg-orange-50',
          iconColor: 'text-orange-600',
          borderColor: 'hover:border-orange-200'
        };
      default:
        return {
          icon: Circle,
          label: 'Start',
          bgColor: 'hover:bg-slate-50',
          iconColor: 'text-slate-400',
          borderColor: 'hover:border-slate-200'
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: showLabel ? 'h-7 px-2 text-xs' : 'h-7 w-7 p-0',
    md: showLabel ? 'h-9 px-3 text-sm' : 'h-9 w-9 p-0',
    lg: showLabel ? 'h-11 px-4' : 'h-11 w-11 p-0'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={cn(
        sizeClasses[size],
        config.bgColor,
        config.borderColor,
        'transition-all duration-200 hover:scale-105 active:scale-95',
        'border border-transparent',
        className
      )}
      onClick={onClick}
      title={config.label}
    >
      <Icon className={cn(iconSizes[size], config.iconColor, 'transition-colors')} />
      {showLabel && (
        <span className={cn('ml-2', config.iconColor)}>{config.label}</span>
      )}
    </Button>
  );
}

export function TaskStatusIcon({ status, className }: { status: TaskStatus; className?: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className={cn('text-green-600', className)} />;
    case 'in-progress':
      return <Clock className={cn('text-orange-600', className)} />;
    default:
      return <Circle className={cn('text-slate-400', className)} />;
  }
}