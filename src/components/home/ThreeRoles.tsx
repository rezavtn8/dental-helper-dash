import { useEffect, useRef, useState } from 'react';
import { CheckCircle, TrendingUp, BarChart3, Calendar, Clock, Award } from 'lucide-react';

export function ThreeRoles() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(700);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(Date.now());
  const lastProgress = useRef<number>(0);

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
      
      // Calculate scroll velocity
      const now = Date.now();
      const timeDelta = now - lastScrollTime.current;
      const progressDelta = Math.abs(progress - lastProgress.current);
      const velocity = timeDelta > 0 ? progressDelta / timeDelta : 0;
      
      // Adjust animation duration based on velocity
      // Higher velocity = shorter duration (faster animations)
      // velocity > 0.001 is fast scrolling
      const baseDuration = 700;
      const minDuration = 150;
      const duration = velocity > 0.001 
        ? Math.max(minDuration, baseDuration * (1 - Math.min(velocity * 500, 0.8)))
        : baseDuration;
      
      setAnimationDuration(duration);
      setScrollProgress(progress);
      
      lastScrollTime.current = now;
      lastProgress.current = progress;
      
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
      floatingCards: [
        { text: 'HIPAA Course', icon: CheckCircle, complete: true, delay: 0 },
        { text: 'Patient Communication', icon: null, complete: false, delay: 200 },
        { text: 'Insurance Billing 101', icon: null, complete: false, delay: 400 },
        { text: 'Marketing Basics', icon: null, complete: false, delay: 600 },
      ]
    },
    {
      title: 'Track',
      description: 'Run your clinic with precision. Use ready-to-go daily, weekly, and monthly task templates tailored to your practice—or create your own recurring workflows. Track who\'s done what, when, and how well, all in one clean dashboard.',
      align: 'right' as const,
      floatingCards: [
        { text: 'Daily Sterilization Log', icon: CheckCircle, complete: true, delay: 0, type: 'task' },
        { text: '92%', icon: null, complete: false, delay: 200, type: 'progress' },
        { text: 'Weekly Cleaning Template', icon: Calendar, complete: false, delay: 400, type: 'template' },
        { text: '8 tasks today', icon: Clock, complete: false, delay: 600, type: 'count' },
      ]
    },
    {
      title: 'Analyze',
      description: 'See performance at a glance. Dentaleague automatically compiles team analytics, completion rates, and compliance reports so you can identify gaps, reward progress, and keep your operations running at peak efficiency.',
      align: 'left' as const,
      floatingCards: [
        { text: 'Team Completion: 92%', icon: TrendingUp, complete: false, delay: 0, type: 'stat' },
        { text: 'Performance', icon: BarChart3, complete: false, delay: 200, type: 'chart' },
        { text: 'Top Performer: Hafsa', icon: Award, complete: false, delay: 400, type: 'badge' },
      ]
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
                  className={`relative w-4 h-4 rounded-full bg-primary transition-all ${
                    isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                  style={{
                    boxShadow: isVisible ? '0 0 20px hsl(var(--primary) / 0.6)' : 'none',
                    transitionDuration: `${animationDuration}ms`
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

              {/* Content Container */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Text Content */}
                <div
                  className={`relative transition-all ease-out ${
                    isVisible
                      ? 'opacity-100 translate-x-0 translate-y-0 blur-0'
                      : `opacity-0 ${isLeft ? '-translate-x-16' : 'translate-x-16'} translate-y-12 blur-sm`
                  } ${isLeft ? 'lg:order-1' : 'lg:order-2'}`}
                  style={{
                    transitionDuration: `${animationDuration}ms`,
                    transitionDelay: isVisible ? `${Math.min(index * 200, animationDuration * 0.3)}ms` : '0ms'
                  }}
                >
                {/* Enhanced motion lines */}
                <div className={`absolute top-12 ${isLeft ? '-right-8 lg:-right-20' : '-left-8 lg:-left-20'} hidden lg:block`}>
                  <div 
                    className={`h-px bg-gradient-to-r ${
                      isLeft ? 'from-primary/60 via-primary/30 to-transparent' : 'from-transparent via-primary/30 to-primary/60'
                    } transition-all ${
                      isVisible ? 'w-16 opacity-100' : 'w-0 opacity-0'
                    }`}
                    style={{ 
                      transformOrigin: isLeft ? 'left' : 'right',
                      transitionDuration: `${animationDuration}ms`,
                      transitionDelay: isVisible ? `${Math.min(index * 200 + 400, animationDuration * 0.6)}ms` : '0ms'
                    }}
                  />
                </div>

                  <h3 
                    className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight transition-all ${
                      isVisible ? 'translate-y-0' : 'translate-y-4'
                    }`}
                    style={{
                      transitionDuration: `${animationDuration}ms`,
                      transitionDelay: isVisible ? `${Math.min(index * 200 + 200, animationDuration * 0.3)}ms` : '0ms'
                    }}
                  >
                    {section.title}
                  </h3>
                  <p 
                    className={`text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl transition-all ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{
                      transitionDuration: `${animationDuration}ms`,
                      transitionDelay: isVisible ? `${Math.min(index * 200 + 400, animationDuration * 0.6)}ms` : '0ms'
                    }}
                  >
                    {section.description}
                  </p>
                </div>

                {/* Floating Visual Elements */}
                <div 
                  className={`relative h-[400px] hidden lg:block ${isLeft ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  <div className="relative h-full">
                    {section.floatingCards.map((card, cardIndex) => {
                      const cardProgress = Math.max(0, Math.min(1, (scrollProgress - (0.1 + index * 0.25)) / 0.25));
                      const shouldShow = cardProgress > (cardIndex * 0.2);
                      
                      // Scattered positioning patterns
                      const positions = [
                        { top: 20, left: 40, right: 'auto' },
                        { top: 110, left: 120, right: 'auto' },
                        { top: 200, left: 20, right: 'auto' },
                        { top: 300, left: 100, right: 'auto' },
                      ];
                      
                      const position = positions[cardIndex] || positions[0];
                      
                      return (
                        <div
                          key={cardIndex}
                          className={`absolute transition-all duration-1000 ease-out ${
                            shouldShow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                          }`}
                          style={{
                            top: `${position.top}px`,
                            left: isLeft ? `${position.left}px` : 'auto',
                            right: isLeft ? 'auto' : `${position.left}px`,
                            transitionDelay: `${card.delay}ms`,
                            animation: shouldShow ? `float ${3 + cardIndex * 0.5}s ease-in-out infinite` : 'none',
                            animationDelay: `${cardIndex * 0.3}s`
                          }}
                        >
                          {renderFloatingCard(card, section.title)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </section>
  );
}

function renderFloatingCard(card: any, sectionTitle: string) {
  const Icon = card.icon;
  
  // Training cards - varied pill and card styles
  if (sectionTitle === 'Train') {
    if (card.complete) {
      return (
        <div className="bg-primary/10 border border-primary/30 rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-sm shadow-lg">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{card.text}</span>
        </div>
      );
    }
    return (
      <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm">
        <span className="text-sm font-medium text-foreground">{card.text}</span>
      </div>
    );
  }
  
  // Track cards - varied dashboard-style widgets
  if (sectionTitle === 'Track') {
    if (card.type === 'task') {
      return (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex items-center gap-2 backdrop-blur-sm shadow-lg min-w-[240px]">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">{card.text}</span>
        </div>
      );
    }
    if (card.type === 'progress') {
      return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-center">
            <div className="relative w-20 h-20">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-muted"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.92)}`}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">{card.text}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (card.type === 'template') {
      return (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 flex items-center gap-2 backdrop-blur-sm shadow-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{card.text}</span>
        </div>
      );
    }
    if (card.type === 'count') {
      return (
        <div className="bg-card border border-border rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-sm shadow-lg">
          <Clock className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-semibold text-foreground">{card.text}</span>
        </div>
      );
    }
  }
  
  // Analyze cards - varied analytics styles
  if (sectionTitle === 'Analyze') {
    if (card.type === 'stat') {
      return (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl px-5 py-4 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <span className="text-lg font-bold text-green-700 block">{card.text}</span>
            </div>
          </div>
        </div>
      );
    }
    if (card.type === 'chart') {
      return (
        <div className="bg-card border border-border rounded-lg p-4 backdrop-blur-sm shadow-lg">
          <div className="flex items-end gap-1 h-16">
            <div className="w-3 bg-primary/40 rounded-t" style={{ height: '40%' }}></div>
            <div className="w-3 bg-primary/50 rounded-t" style={{ height: '60%' }}></div>
            <div className="w-3 bg-primary/70 rounded-t" style={{ height: '75%' }}></div>
            <div className="w-3 bg-primary rounded-t" style={{ height: '90%' }}></div>
          </div>
          <span className="text-xs font-medium text-muted-foreground mt-2 block">{card.text}</span>
        </div>
      );
    }
    if (card.type === 'badge') {
      return (
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-sm shadow-lg">
          <Award className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-semibold text-amber-700">{card.text}</span>
        </div>
      );
    }
  }
  
  // Default card
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm">
      {Icon && <Icon className="w-5 h-5 text-primary mb-1" />}
      <span className="text-sm font-medium text-foreground">{card.text}</span>
    </div>
  );
}