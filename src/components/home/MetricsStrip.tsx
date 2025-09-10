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
    <section className="bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex items-center gap-3 text-muted-foreground">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{metric.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}