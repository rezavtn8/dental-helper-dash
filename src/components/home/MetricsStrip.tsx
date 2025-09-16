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
    <div className="py-8 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center space-x-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex items-center space-x-3">
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