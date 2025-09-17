import { Card } from '@/components/ui/card';
import { TrendingUp, Clock, Users, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

function AnimatedCounter({ end, duration = 2000, suffix = '' }: { 
  end: number; 
  duration?: number; 
  suffix?: string; 
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}

export function RealImpact() {
  const metrics = [
    {
      icon: TrendingUp,
      value: 45,
      suffix: '%',
      label: 'Increase in Efficiency',
      description: 'Teams report significant productivity gains within first month'
    },
    {
      icon: Clock,
      value: 2.5,
      suffix: 'hrs',
      label: 'Time Saved Daily',
      description: 'Average time savings per assistant per day'
    },
    {
      icon: Users,
      value: 98,
      suffix: '%',
      label: 'Team Satisfaction', 
      description: 'Assistants love the clarity and organization'
    },
    {
      icon: Target,
      value: 12,
      suffix: ' min',
      label: 'Average Task Time',
      description: 'From assignment to completion'
    }
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Real Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Numbers that matter. Results you can measure. Success you can feel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="bento-item text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div>
                    <div className="text-4xl font-bold font-display mb-2">
                      <AnimatedCounter end={metric.value} suffix={metric.suffix} />
                    </div>
                    <h3 className="font-display text-lg font-bold mb-2">{metric.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="glass-card inline-block p-8 max-w-2xl">
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-bold">
                "Our practice efficiency increased by 45% in the first month"
              </h3>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold">DS</span>
                </div>
                <div className="text-left">
                  <div className="font-medium">Dr. Sarah Chen</div>
                  <div className="text-sm text-muted-foreground">Westside Dental Practice</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}