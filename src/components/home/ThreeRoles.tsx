import { useEffect, useRef, useState } from 'react';

export function ThreeRoles() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress through the section
      const progress = Math.max(0, Math.min(1, 
        (windowHeight - rect.top) / (windowHeight + rect.height)
      ));
      
      setScrollProgress(progress);
      
      // Trigger section visibility based on scroll position - more responsive thresholds
      const newVisible = new Set<number>();
      if (progress > 0.1) newVisible.add(0);
      if (progress > 0.35) newVisible.add(1);
      if (progress > 0.55) newVisible.add(2);
      
      setVisibleSections(newVisible);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
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
    <section 
      ref={containerRef}
      className="relative bg-background py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Vertical connecting line - background */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent hidden lg:block" />
      
      {/* Animated progress line */}
      <div 
        className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-primary/0 via-primary to-primary/0 hidden lg:block transition-all duration-300"
        style={{ 
          height: `${scrollProgress * 100}%`,
          opacity: scrollProgress > 0.1 ? 1 : 0
        }}
      />
      
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
              {/* Connecting dot with glow */}
              <div className="absolute left-1/2 top-8 -translate-x-1/2 hidden lg:block z-10">
                <div 
                  className={`relative w-4 h-4 rounded-full bg-primary transition-all duration-700 ${
                    isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                  style={{
                    boxShadow: isVisible ? '0 0 20px hsl(var(--primary) / 0.6)' : 'none'
                  }}
                >
                  {isVisible && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" />
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse" />
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div
                className={`relative transition-all duration-1000 ease-out ${
                  isVisible
                    ? 'opacity-100 translate-x-0 translate-y-0 blur-0'
                    : `opacity-0 ${isLeft ? '-translate-x-16' : 'translate-x-16'} translate-y-12 blur-sm`
                } ${
                  isLeft 
                    ? 'lg:pr-[55%] text-left' 
                    : 'lg:pl-[55%] text-left lg:text-right'
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 200}ms` : '0ms'
                }}
              >
                {/* Enhanced motion lines */}
                <div className={`absolute top-12 ${isLeft ? '-right-8 lg:-right-20' : '-left-8 lg:-left-20'} hidden lg:block`}>
                  <div 
                    className={`h-px bg-gradient-to-r ${
                      isLeft ? 'from-primary/60 via-primary/30 to-transparent' : 'from-transparent via-primary/30 to-primary/60'
                    } transition-all duration-1000 ${
                      isVisible ? 'w-16 opacity-100' : 'w-0 opacity-0'
                    }`}
                    style={{ 
                      transformOrigin: isLeft ? 'left' : 'right',
                      transitionDelay: isVisible ? `${index * 200 + 400}ms` : '0ms'
                    }}
                  />
                </div>

                <h3 
                  className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight transition-all duration-700 ${
                    isVisible ? 'translate-y-0' : 'translate-y-4'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${index * 200 + 200}ms` : '0ms'
                  }}
                >
                  {section.title}
                </h3>
                <p 
                  className={`text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl transition-all duration-700 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${index * 200 + 400}ms` : '0ms'
                  }}
                >
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