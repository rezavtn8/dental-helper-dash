import { useEffect, useRef, useState } from 'react';
import { 
  CheckCircle, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Clock, 
  Award,
  Trophy,
  Target,
  Flame,
  Star,
  Users,
  Activity,
  Zap
} from 'lucide-react';

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
      
      // Trigger section visibility based on scroll position - adjusted for compact layout
      const newVisible = new Set<number>();
      if (progress > 0.05) newVisible.add(0);
      if (progress > 0.25) newVisible.add(1);
      if (progress > 0.45) newVisible.add(2);
      
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
        { type: 'course-progress', title: 'HIPAA Compliance', progress: 75, level: 'Intermediate', delay: 0 },
        { type: 'quiz', title: 'Patient Communication', questions: '8/10', passing: 80, delay: 200 },
        { type: 'certificate', title: 'Infection Control', date: 'Dec 2024', delay: 400 },
        { type: 'achievement', title: 'Learning Streak', value: '5 Days', points: 50, delay: 600 },
      ]
    },
    {
      title: 'Track',
      description: 'Run your clinic with precision. Use ready-to-go daily, weekly, and monthly task templates tailored to your practice—or create your own recurring workflows. Track who\'s done what, when, and how well, all in one clean dashboard.',
      align: 'right' as const,
      floatingCards: [
        { type: 'live-task', title: 'Morning Equipment Check', priority: 'high', status: 'completed', assignee: 'Sarah', delay: 0 },
        { type: 'circular-progress', progress: 92, label: 'Team Progress', delay: 200 },
        { type: 'template', title: 'Weekly Sterilization', tasks: 8, category: 'Compliance', delay: 400 },
        { type: 'assignment', count: 3, text: 'tasks assigned', avatar: true, delay: 600 },
      ]
    },
    {
      title: 'Analyze',
      description: 'See performance at a glance. Dentaleague automatically compiles team analytics, completion rates, and compliance reports so you can identify gaps, reward progress, and keep your operations running at peak efficiency.',
      align: 'left' as const,
      floatingCards: [
        { type: 'completion-rate', value: 92, trend: 'up', label: 'Team Completion', delay: 0 },
        { type: 'performance-chart', data: [40, 60, 75, 90], delay: 200 },
        { type: 'top-performer', name: 'Hafsa', score: 98, delay: 400 },
        { type: 'live-metrics', count: 15, label: 'Tasks Completed', time: '2.3 days avg', delay: 600 },
      ]
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative bg-background py-10 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
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
              className="relative mb-16 sm:mb-24 lg:mb-32 last:mb-0"
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
                    className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground tracking-tight transition-all ${
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
                    className={`text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-full px-4 lg:px-0 lg:max-w-xl transition-all break-words whitespace-normal overflow-hidden ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{
                      transitionDuration: `${animationDuration}ms`,
                      transitionDelay: isVisible ? `${Math.min(index * 200 + 400, animationDuration * 0.6)}ms` : '0ms',
                      hyphens: 'auto',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word'
                    }}
                  >
                    {section.description}
                  </p>
                </div>

                {/* Floating Visual Elements */}
                <div 
                  className={`relative ${isLeft ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  {/* Mobile Layout - Floating cards with tile movement */}
                  <div className="lg:hidden relative h-[500px] py-6">
                    {section.floatingCards.map((card, cardIndex) => {
                      const cardProgress = Math.max(0, Math.min(1, (scrollProgress - (0.05 + index * 0.20)) / 0.20));
                      const shouldShow = cardProgress > (cardIndex * 0.15);
                      
                      // Mobile-optimized scattered positions
                      const mobilePositions = [
                        { top: 10, left: 10, scale: 0.95 },
                        { top: 120, left: 160, scale: 1 },
                        { top: 240, left: 20, scale: 0.9 },
                        { top: 360, left: 140, scale: 0.95 },
                      ];
                      
                      const position = mobilePositions[cardIndex] || mobilePositions[0];
                      
                      return (
                        <div
                          key={cardIndex}
                          className={`absolute transition-all duration-700 ease-out w-[240px] ${
                            shouldShow ? 'opacity-100' : 'opacity-0 translate-y-12'
                          }`}
                          style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                            transitionDelay: `${shouldShow ? cardIndex * 150 : 0}ms`,
                            animation: shouldShow 
                              ? `floatMobile ${4 + cardIndex * 0.3}s ease-in-out ${cardIndex * 0.2}s infinite, 
                                 slideHorizontal ${6 + cardIndex * 0.5}s ease-in-out ${cardIndex * 0.3}s infinite,
                                 tiltCard ${7 + cardIndex * 0.4}s ease-in-out ${cardIndex * 0.4}s infinite` 
                              : 'none',
                            transformOrigin: 'center center',
                            zIndex: Math.floor(position.scale * 10)
                          }}
                        >
                          {renderFloatingCard(card, true)}
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Layout - Original scattered cards */}
                  <div className="hidden lg:block relative h-[400px]">
                    <div className="relative h-full">
                      {section.floatingCards.map((card, cardIndex) => {
                        const cardProgress = Math.max(0, Math.min(1, (scrollProgress - (0.05 + index * 0.20)) / 0.20));
                        const shouldShow = cardProgress > (cardIndex * 0.25);
                        
                        const positions = [
                          { top: 20, left: 40, scale: 1 },
                          { top: 100, left: 280, scale: 0.95 },
                          { top: 220, left: 10, scale: 1.05 },
                          { top: 320, left: 250, scale: 0.9 },
                        ];
                        
                        const position = positions[cardIndex] || positions[0];
                        
                        return (
                          <div
                            key={cardIndex}
                            className={`absolute transition-all duration-700 ease-out ${
                              shouldShow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                            style={{
                              top: `${position.top}px`,
                              left: isLeft ? `${position.left}px` : 'auto',
                              right: isLeft ? 'auto' : `${position.left}px`,
                              transitionDelay: `${shouldShow ? cardIndex * 300 : 0}ms`,
                              animation: shouldShow ? `float ${3 + cardIndex * 0.5}s ease-in-out infinite` : 'none',
                              animationDelay: `${cardIndex * 0.3}s`,
                              transform: `scale(${position.scale})`,
                              zIndex: Math.floor(position.scale * 10)
                            }}
                          >
                            {renderFloatingCard(card, false)}
                          </div>
                        );
                      })}
                    </div>
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
        
        @keyframes floatMobile {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes slideHorizontal {
          0%, 100% {
            transform: translateX(0px);
          }
          25% {
            transform: translateX(25px);
          }
          75% {
            transform: translateX(-15px);
          }
        }
        
        @keyframes tiltCard {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(2deg) scale(1.02);
          }
          50% {
            transform: rotate(0deg) scale(1);
          }
          75% {
            transform: rotate(-2deg) scale(0.98);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 4px 30px rgba(59, 130, 246, 0.5);
          }
        }
        
        @keyframes progress-fill {
          from {
            stroke-dashoffset: 200;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scroll-smooth {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </section>
  );
}

function renderFloatingCard(card: any, isMobile: boolean = false) {
  const cardClasses = isMobile ? "w-full" : "min-w-[260px]";
  
  // TRAIN SECTION CARDS
  if (card.type === 'course-progress') {
    return (
      <div className={`bg-gradient-to-br from-learning-quiz/10 to-learning-primary/10 border border-learning-quiz/30 rounded-xl p-4 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow ${cardClasses}`}>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-learning-quiz flex-shrink-0" />
          <span className="text-sm font-semibold text-foreground break-words overflow-hidden">{card.title}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{card.progress}% Complete</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-learning-quiz/20 text-learning-quiz">{card.level}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-learning-quiz to-learning-primary rounded-full transition-all duration-1000"
              style={{ width: `${card.progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }
  
  if (card.type === 'quiz') {
    return (
      <div className={`bg-card border-2 border-learning-primary/40 rounded-xl p-4 backdrop-blur-sm shadow-xl ${isMobile ? 'w-full' : 'min-w-[240px]'} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-learning-primary/10 rounded-bl-full" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-learning-primary flex items-center gap-1">
              <Zap className="w-3 h-3" />
              ACTIVE QUIZ
            </span>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-bold text-foreground mb-2 break-words overflow-hidden">{card.title}</h4>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-learning-primary">{card.questions}</span>
            <span className="text-xs text-muted-foreground">Pass: {card.passing}%</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (card.type === 'certificate') {
    return (
      <div className={`bg-gradient-to-br from-learning-achievement/20 to-amber-500/10 border-2 border-learning-achievement/50 rounded-xl p-4 backdrop-blur-sm shadow-2xl ${isMobile ? 'w-full' : 'min-w-[220px]'} relative`}>
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 bg-learning-achievement/20 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 text-learning-achievement" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-learning-achievement">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold">CERTIFIED</span>
          </div>
          <h4 className="text-sm font-bold text-foreground break-words overflow-hidden">{card.title}</h4>
          <p className="text-xs text-muted-foreground">{card.date}</p>
        </div>
      </div>
    );
  }
  
  if (card.type === 'achievement') {
    return (
      <div className={`bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-full px-5 py-3 backdrop-blur-sm shadow-xl flex items-center gap-3 ${isMobile ? 'w-full justify-center' : 'min-w-[200px]'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 animate-pulse" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-orange-600">{card.title}</p>
            <p className="text-lg font-bold text-foreground">{card.value}</p>
          </div>
          <span className="absolute -top-1 -right-1 text-xs font-bold text-learning-achievement">+{card.points}</span>
        </div>
      </div>
    );
  }
  
  // TRACK SECTION CARDS
  if (card.type === 'live-task') {
    const priorityColors = {
      high: 'border-red-500/40 bg-red-500/5',
      medium: 'border-orange-500/40 bg-orange-500/5',
      low: 'border-blue-500/40 bg-blue-500/5'
    };
    
    return (
      <div className={`${priorityColors[card.priority as keyof typeof priorityColors]} border-2 rounded-xl p-4 backdrop-blur-sm shadow-xl ${isMobile ? 'w-full' : 'min-w-[280px]'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${card.status === 'completed' ? 'bg-learning-success' : 'bg-orange-500'}`} />
              <span className="text-xs font-semibold text-muted-foreground uppercase">{card.status}</span>
            </div>
          <h4 className="text-sm font-bold text-foreground break-words overflow-hidden">{card.title}</h4>
          </div>
          <CheckCircle className="w-5 h-5 text-learning-success" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{card.assignee[0]}</span>
          </div>
          <span className="text-xs text-muted-foreground">{card.assignee}</span>
        </div>
      </div>
    );
  }
  
  if (card.type === 'circular-progress') {
    const percentage = card.progress;
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className={`bg-card border border-border rounded-2xl p-6 backdrop-blur-sm shadow-xl ${isMobile ? 'w-full' : ''}`}>
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28">
            <svg className="transform -rotate-90 w-28 h-28">
              <circle
                cx="56"
                cy="56"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted/30"
              />
              <circle
                cx="56"
                cy="56"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="text-primary transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-foreground">{percentage}%</span>
              <Activity className="w-4 h-4 text-primary mt-1" />
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground mt-3">{card.label}</span>
        </div>
      </div>
    );
  }
  
  if (card.type === 'template') {
    return (
      <div className={`bg-card border border-primary/30 rounded-xl p-4 backdrop-blur-sm shadow-xl ${isMobile ? 'w-full' : 'min-w-[240px]'} hover:border-primary/50 transition-colors`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-foreground mb-1 break-words overflow-hidden">{card.title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{card.tasks} tasks</span>
              <span className="text-xs text-muted-foreground">{card.category}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (card.type === 'assignment') {
    return (
      <div className={`bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-full px-5 py-3 backdrop-blur-sm shadow-lg flex items-center gap-3 ${isMobile ? 'w-full justify-center' : 'min-w-[180px]'}`}>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 border-2 border-background flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{card.count}</p>
          <p className="text-xs text-muted-foreground">{card.text}</p>
        </div>
      </div>
    );
  }
  
  // ANALYZE SECTION CARDS
  if (card.type === 'completion-rate') {
    return (
      <div className={`bg-gradient-to-br from-learning-success/10 to-emerald-500/10 border-2 border-learning-success/40 rounded-2xl p-5 backdrop-blur-sm shadow-2xl ${isMobile ? 'w-full' : 'min-w-[220px]'}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-learning-success mb-1">{card.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{card.value}%</span>
              <TrendingUp className="w-5 h-5 text-learning-success" />
            </div>
          </div>
        </div>
        <div className="flex gap-1 h-1">
          <div className="flex-1 bg-learning-success/30 rounded-full overflow-hidden">
            <div className="h-full bg-learning-success w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  
  if (card.type === 'performance-chart') {
    return (
      <div className={`bg-card border border-border rounded-xl p-4 backdrop-blur-sm shadow-xl ${isMobile ? 'w-full' : 'min-w-[200px]'}`}>
        <div className="flex items-end justify-between gap-2 h-20 mb-2">
          {card.data.map((value: number, i: number) => (
            <div 
              key={i}
              className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t-lg transition-all duration-1000 hover:from-primary/80"
              style={{ 
                height: `${value}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground">Performance Trend</span>
        </div>
      </div>
    );
  }
  
  if (card.type === 'top-performer') {
    return (
      <div className={`bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-2 border-amber-500/40 rounded-2xl p-4 backdrop-blur-sm shadow-2xl ${isMobile ? 'w-full' : 'min-w-[220px]'} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full" />
        <div className="absolute top-2 right-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold text-amber-600 uppercase">Top Performer</span>
          </div>
          <h4 className="text-lg font-bold text-foreground mb-1 break-words overflow-hidden">{card.name}</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" style={{ width: `${card.score}%` }} />
            </div>
            <span className="text-sm font-bold text-amber-600">{card.score}</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (card.type === 'live-metrics') {
    return (
      <div className={`bg-card border border-border rounded-xl p-4 backdrop-blur-sm shadow-xl ${isMobile ? 'w-full' : 'min-w-[220px]'}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase">Live</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground mb-1">{card.count}</p>
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{card.time}</span>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}