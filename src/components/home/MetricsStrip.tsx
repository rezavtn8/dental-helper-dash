import { Zap, Smartphone, Shield } from 'lucide-react';
export function MetricsStrip() {
  const metrics = [{
    icon: Zap,
    text: "Real-time sync"
  }, {
    icon: Smartphone,
    text: "Mobile-ready"
  }, {
    icon: Shield,
    text: "HIPAA-aware workflows"
  }];
  return (
    <div className="flex items-center justify-center gap-8 py-4 border-y border-border/50">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{metric.text}</span>
          </div>
        );
      })}
    </div>
  );
}