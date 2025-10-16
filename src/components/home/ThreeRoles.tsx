import { useEffect, useRef, useState } from 'react';

export function ThreeRoles() {
  const sections = [
    {
      title: "Train",
      description: "Equip your team with structured, clinic-specific learning. From HIPAA and infection control to patient communication, marketing, and insurance skills—Dentaleague turns everyday staff training into engaging, trackable progress.",
      align: "left"
    },
    {
      title: "Track",
      description: "Run your clinic with precision. Use ready-to-go daily, weekly, and monthly task templates tailored to your practice—or create your own recurring workflows. Track who's done what, when, and how well, all in one clean dashboard.",
      align: "right"
    },
    {
      title: "Analyze",
      description: "See performance at a glance. Dentaleague automatically compiles team analytics, completion rates, and compliance reports so you can identify gaps, reward progress, and keep your operations running at peak efficiency.",
      align: "left"
    }
  ];

  const [visibleSections, setVisibleSections] = useState<number[]>([]);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSections((prev) => [...new Set([...prev, index])]);
              }
            });
          },
          { threshold: 0.2 }
        );

        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      {/* Vertical connecting line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden lg:block" />

      <div className="max-w-6xl mx-auto relative">
        {sections.map((section, index) => (
          <div key={index} className="relative">
            {/* Section content */}
            <div
              ref={(el) => (sectionRefs.current[index] = el)}
              className={`
                mb-24 sm:mb-32 lg:mb-40 last:mb-0 
                transition-all duration-1000 ease-out
                ${visibleSections.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                ${section.align === 'left' ? 'lg:pr-[calc(50%+4rem)]' : 'lg:pl-[calc(50%+4rem)]'}
              `}
            >
              {/* Connecting dot */}
              <div className={`
                hidden lg:block absolute top-0 w-3 h-3 rounded-full bg-primary
                transition-all duration-500 delay-300
                ${visibleSections.includes(index) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                ${section.align === 'left' ? 'right-[-6px]' : 'left-[-6px]'}
              `}>
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
              </div>

              {/* Motion line */}
              <div className={`
                hidden lg:block absolute top-0 h-px bg-gradient-to-r
                transition-all duration-700 delay-200
                ${visibleSections.includes(index) ? 'w-12 opacity-100' : 'w-0 opacity-0'}
                ${section.align === 'left' 
                  ? 'right-0 from-transparent to-primary/40' 
                  : 'left-0 from-primary/40 to-transparent'
                }
              `} />

              <div className={`
                ${section.align === 'left' ? 'text-left' : 'lg:text-right'}
              `}>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                  {section.title}
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  {section.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}