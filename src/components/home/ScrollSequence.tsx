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
    <section className="relative py-32 px-4 bg-background">
      {/* Central Timeline */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/30 to-transparent -translate-x-1/2 hidden lg:block" />
      
      <div className="max-w-6xl mx-auto">
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
            className="relative mb-48 last:mb-0"
          >
            {/* Timeline Dot */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg transition-all duration-700 hidden lg:block ${
                visibleSections.has(section.id)
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-0'
              }`}
            />

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left Side - Header */}
              <div
                className={`lg:text-right lg:pr-16 transition-all duration-1000 ${
                  visibleSections.has(section.id)
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-12'
                }`}
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {section.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {section.description}
                </p>
              </div>

              {/* Right Side - Card */}
              <div
                className={`lg:pl-16 transition-all duration-1000 delay-200 ${
                  visibleSections.has(section.id)
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-12'
                }`}
              >
                <Card className="border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 md:p-8">
                    <div className="space-y-4">
                      
                      <div className="space-y-3 pt-2">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000"
                                style={{ 
                                  width: visibleSections.has(section.id) ? `${60 + item * 15}%` : '0%'
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{60 + item * 15}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex gap-2">
                        <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          Active
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                          {Math.floor(Math.random() * 20) + 10} tasks
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
