import React from 'react';
import { Button } from '@/components/ui/button';
import { TaskStatus } from '@/lib/taskStatus';
import { 
  CheckCircle2, 
  Circle,
  Clock3,
  Play,
  RotateCcw,
  ArrowRight,
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
        icon: ArrowRight,
        label: 'Take Task',
        bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
        iconColor: 'text-white',
        borderColor: 'border-blue-500',
        textColor: 'text-white'
      };
    }
    
    if (action === 'return') {
      return {
        icon: ArrowLeft,
        label: 'Return',
        bgColor: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700',
        iconColor: 'text-white',
        borderColor: 'border-slate-500',
        textColor: 'text-white'
      };
    }
    
    if (action === 'undo') {
      return {
        icon: RotateCcw,
        label: 'Undo',
        bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
        iconColor: 'text-white',
        borderColor: 'border-orange-500',
        textColor: 'text-white'
      };
    }

    // Default toggle behavior with modern styling
    switch (status) {
      case 'pending':
        return {
          icon: Play,
          label: 'Start Task',
          bgColor: 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25',
          iconColor: 'text-primary-foreground',
          borderColor: 'border-primary',
          textColor: 'text-primary-foreground'
        };
      case 'in-progress':
        return {
          icon: CheckCircle2,
          label: 'Complete',
          bgColor: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25',
          iconColor: 'text-white',
          borderColor: 'border-green-500',
          textColor: 'text-white'
        };
      case 'completed':
        return {
          icon: RotateCcw,
          label: 'Undo',
          bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25',
          iconColor: 'text-white',
          borderColor: 'border-orange-500',
          textColor: 'text-white'
        };
      default:
        return {
          icon: Circle,
          label: 'Start',
          bgColor: 'bg-gradient-to-r from-muted to-muted/90 hover:from-muted/90 hover:to-muted',
          iconColor: 'text-muted-foreground',
          borderColor: 'border-muted',
          textColor: 'text-muted-foreground'
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: showLabel ? 'h-8 px-3 text-xs font-medium' : 'h-8 w-8 p-0',
    md: showLabel ? 'h-10 px-4 text-sm font-medium' : 'h-10 w-10 p-0',
    lg: showLabel ? 'h-12 px-5 text-base font-medium' : 'h-12 w-12 p-0'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Button
      className={cn(
        sizeClasses[size],
        config.bgColor,
        config.borderColor,
        'transition-all duration-300 hover:scale-105 active:scale-95 transform-gpu',
        'border-2 rounded-xl font-medium',
        'focus:ring-4 focus:ring-primary/20 focus:outline-none',
        className
      )}
      onClick={onClick}
      title={config.label}
    >
      <Icon className={cn(iconSizes[size], config.iconColor, 'transition-all duration-200')} />
      {showLabel && (
        <span className={cn('ml-2', config.textColor)}>{config.label}</span>
      )}
    </Button>
  );
}

export function TaskStatusIcon({ status, className }: { status: TaskStatus; className?: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className={cn('text-green-600', className)} />;
    case 'in-progress':
      return <Clock3 className={cn('text-orange-600', className)} />;
    default:
      return <Circle className={cn('text-muted-foreground', className)} />;
  }
}