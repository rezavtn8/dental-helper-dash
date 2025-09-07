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
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="flex items-center justify-center gap-3">
                <IconComponent className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">{metric.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}