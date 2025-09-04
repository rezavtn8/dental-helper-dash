import { Zap, Smartphone, Shield } from 'lucide-react';

export function MetricsStrip() {
  const metrics = [
    {
      icon: Zap,
      text: "Real-time sync"
    },
    {
      icon: Smartphone, 
      text: "Mobile-ready"
    },
    {
      icon: Shield,
      text: "HIPAA-aware workflows"
    }
  ];

  return (
    <div className="bg-muted/50 py-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {metrics.map((metric, index) => (
            <div key={metric.text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <metric.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {metric.text}
              </span>
              {index < metrics.length - 1 && (
                <div className="hidden md:block w-1 h-1 bg-border rounded-full ml-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}