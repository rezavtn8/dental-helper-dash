import { useEffect, useRef, useState } from 'react';

export function ThreeRoles() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set(prev).add(index));
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const sections = [
    {
      title: 'Train',
      description: 'Equip your team with structured, clinic-specific learning. From HIPAA and infection control to patient communication, marketing, and insurance skills—Dentaleague turns everyday staff training into engaging, trackable progress.',
      align: 'left' as const,
    },
    {
      title: 'Track',
      description: 'Run your clinic with precision. Use ready-to-go daily, weekly, and monthly task templates tailored to your practice—or create your own recurring workflows. Track who\'s done what, when, and how well, all in one clean dashboard.',
      align: 'right' as const,
    },
    {
      title: 'Analyze',
      description: 'See performance at a glance. Dentaleague automatically compiles team analytics, completion rates, and compliance reports so you can identify gaps, reward progress, and keep your operations running at peak efficiency.',
      align: 'left' as const,
    },
  ];

  return (
    <section className="relative py-20 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Vertical connecting line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden lg:block" />
      
      <div className="max-w-6xl mx-auto">
        {sections.map((section, index) => {
          const isVisible = visibleSections.has(index);
          const isLeft = section.align === 'left';
          
          return (
            <div
              key={index}
              ref={(el) => (sectionRefs.current[index] = el)}
              className="relative mb-32 sm:mb-40 lg:mb-48 last:mb-0"
            >
              {/* Connecting dot */}
              <div className="absolute left-1/2 top-8 -translate-x-1/2 hidden lg:block">
                <div 
                  className={`w-3 h-3 rounded-full bg-primary transition-all duration-700 ${
                    isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                >
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                </div>
              </div>

              {/* Content */}
              <div
                className={`relative transition-all duration-1000 ease-out ${
                  isVisible
                    ? 'opacity-100 translate-x-0 translate-y-0'
                    : `opacity-0 ${isLeft ? '-translate-x-12' : 'translate-x-12'} translate-y-8`
                } ${
                  isLeft 
                    ? 'lg:pr-[55%] text-left' 
                    : 'lg:pl-[55%] text-left lg:text-right'
                }`}
              >
                {/* Motion lines */}
                <div className={`absolute top-8 ${isLeft ? '-right-8 lg:-right-16' : '-left-8 lg:-left-16'} hidden lg:block`}>
                  <div 
                    className={`w-12 h-px bg-gradient-to-r ${
                      isLeft ? 'from-primary/40 to-transparent' : 'from-transparent to-primary/40'
                    } transition-all duration-1000 ${
                      isVisible ? 'scale-x-100' : 'scale-x-0'
                    }`}
                    style={{ transformOrigin: isLeft ? 'left' : 'right' }}
                  />
                </div>

                <h3 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight">
                  {section.title}
                </h3>
                <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                  {section.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}