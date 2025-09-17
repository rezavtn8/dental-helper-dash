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
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{metric.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}