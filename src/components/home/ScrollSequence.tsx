import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Section {
  id: string;
  title: string;
  description: string;
  align: 'left' | 'right';
}

const sections: Section[] = [
  {
    id: 'train',
    title: 'Train',
    description: "Equip your team with structured, clinic-specific learning. From HIPAA and infection control to patient communication, marketing, and insurance skills—Dentaleague turns everyday staff training into engaging, trackable progress.",
    align: 'left'
  },
  {
    id: 'track',
    title: 'Track',
    description: "Run your clinic with precision. Use ready-to-go daily, weekly, and monthly task templates tailored to your practice—or create your own recurring workflows. Track who's done what, when, and how well, all in one clean dashboard.",
    align: 'right'
  },
  {
    id: 'analyze',
    title: 'Analyze',
    description: "See performance at a glance. Dentaleague automatically compiles team analytics, completion rates, and compliance reports so you can identify gaps, reward progress, and keep your operations running at peak efficiency.",
    align: 'left'
  }
];

export function ScrollSequence() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const observers = new Map<string, IntersectionObserver>();

    sections.forEach((section) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set(prev).add(section.id));
            }
          });
        },
        { threshold: 0.2, rootMargin: '-50px' }
      );

      const element = sectionRefs.current[section.id];
      if (element) {
        observer.observe(element);
        observers.set(section.id, observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-32">
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
            className={`flex flex-col ${
              section.align === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'
            } gap-12 lg:gap-16 items-center transition-all duration-1000 ${
              visibleSections.has(section.id)
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Text Content */}
            <div
              className={`flex-1 space-y-6 transition-all duration-1000 delay-150 ${
                visibleSections.has(section.id)
                  ? 'opacity-100 translate-x-0'
                  : section.align === 'left'
                  ? 'opacity-0 -translate-x-12'
                  : 'opacity-0 translate-x-12'
              }`}
            >
              <div className="inline-block">
                <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {section.title}
                </h2>
                <div className="h-1 w-24 bg-primary mt-4 rounded-full" />
              </div>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                {section.description}
              </p>
            </div>

            {/* Card */}
            <div
              className={`flex-1 transition-all duration-1000 delay-300 ${
                visibleSections.has(section.id)
                  ? 'opacity-100 translate-x-0 scale-100'
                  : section.align === 'left'
                  ? 'opacity-0 translate-x-12 scale-95'
                  : 'opacity-0 -translate-x-12 scale-95'
              }`}
            >
              <Card className="border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 md:p-12">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-lg bg-primary/20" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Module {index + 1}</p>
                        <p className="text-2xl font-bold text-foreground">{section.title}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-primary/60"
                              style={{ width: `${60 + item * 15}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{60 + item * 15}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Active
                      </div>
                      <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        {Math.floor(Math.random() * 20) + 10} tasks
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
