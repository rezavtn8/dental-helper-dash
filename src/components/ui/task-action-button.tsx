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
        variant: 'default' as const,
        className: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    }
    
    if (action === 'return') {
      return {
        icon: ArrowLeft,
        label: 'Return',
        variant: 'outline' as const,
        className: 'border-slate-300 hover:bg-slate-50'
      };
    }
    
    if (action === 'undo') {
      return {
        icon: RotateCcw,
        label: 'Undo',
        variant: 'outline' as const,
        className: 'border-orange-300 text-orange-600 hover:bg-orange-50'
      };
    }

    // Default toggle behavior with simple styling
    switch (status) {
      case 'pending':
        return {
          icon: Play,
          label: 'Start',
          variant: 'default' as const,
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'in-progress':
        return {
          icon: CheckCircle2,
          label: 'Complete',
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'completed':
        return {
          icon: RotateCcw,
          label: 'Undo',
          variant: 'outline' as const,
          className: 'border-orange-300 text-orange-600 hover:bg-orange-50'
        };
      default:
        return {
          icon: Circle,
          label: 'Start',
          variant: 'outline' as const,
          className: 'border-muted-foreground/30 hover:bg-muted'
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: showLabel ? 'h-8 px-3 text-xs' : 'h-8 w-8 p-0',
    md: showLabel ? 'h-9 px-4 text-sm' : 'h-9 w-9 p-0',
    lg: showLabel ? 'h-10 px-5 text-base' : 'h-10 w-10 p-0'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Button
      variant={config.variant}
      className={cn(
        sizeClasses[size],
        config.className,
        className
      )}
      onClick={onClick}
      title={config.label}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && (
        <span className="ml-2">{config.label}</span>
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