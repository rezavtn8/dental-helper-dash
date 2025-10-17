import { useEffect, useRef, useState } from 'react';
import { 
  Target,
  Zap,
  Award,
  Trophy,
  Flame,
  CheckCircle,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';

export function ThreeRoles() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      sectionRefs.current.forEach((ref, index) => {
        if (!ref) return;
        
        const rect = ref.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Trigger when section is 20% into viewport
        if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
          setVisibleSections(prev => new Set(prev).add(index));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      title: 'Train',
      description: 'Equip your team with structured, clinic-specific learning. From HIPAA and infection control to patient communication, marketing, and insurance skills—Dentaleague turns everyday staff training into engaging, trackable progress.',
    },
    {
      title: 'Track',
      description: 'Run your clinic with precision. Use ready-to-go daily, weekly, and monthly task templates tailored to your practice—or create your own recurring workflows. Track who\'s done what, when, and how well, all in one clean dashboard.',
    },
    {
      title: 'Analyze',
      description: 'See performance at a glance. Dentaleague automatically compiles team analytics, completion rates, and compliance reports so you can identify gaps, reward progress, and keep your operations running at peak efficiency.',
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative bg-background py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Vertical connecting line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden lg:block -translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto">
        {sections.map((section, index) => {
          const isVisible = visibleSections.has(index);
          const textOnLeft = index % 2 === 0; // Train & Analyze: text left, Track: text right
          
          return (
            <div
              key={index}
              ref={(el) => (sectionRefs.current[index] = el)}
              className="relative mb-32 last:mb-0"
            >
              {/* Connecting dot */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 hidden lg:block z-10">
                <div 
                  className={`w-3 h-3 rounded-full bg-foreground transition-all duration-500 ${
                    isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                />
              </div>

              {/* Content Container */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start pt-8 lg:pt-0">
                {/* Text Content */}
                <div
                  className={`transition-all duration-700 ease-out ${
                    isVisible
                      ? 'opacity-100 translate-x-0'
                      : textOnLeft ? 'opacity-0 -translate-x-12' : 'opacity-0 translate-x-12'
                  } ${textOnLeft ? 'lg:order-1' : 'lg:order-2'}`}
                >
                  <h3 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-foreground">
                    {section.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                    {section.description}
                  </p>
                </div>

                {/* Floating Cards */}
                <div 
                  className={`relative min-h-[400px] transition-all duration-700 ease-out ${
                    isVisible
                      ? 'opacity-100 translate-x-0'
                      : textOnLeft ? 'opacity-0 translate-x-12' : 'opacity-0 -translate-x-12'
                  } ${textOnLeft ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  {index === 0 && <TrainCards isVisible={isVisible} />}
                  {index === 1 && <TrackCards isVisible={isVisible} />}
                  {index === 2 && <AnalyzeCards isVisible={isVisible} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TrainCards({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="relative h-full">
      {/* HIPAA Compliance Card */}
      <div 
        className={`absolute top-0 left-0 w-64 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '100ms' }}
      >
        <div className="bg-card border border-learning-quiz/30 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-learning-quiz/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-learning-quiz" />
            </div>
            <span className="text-sm font-semibold text-foreground">HIPAA Compliance</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">75% Complete</span>
              <span className="px-2 py-1 rounded-full bg-learning-quiz/10 text-learning-quiz font-medium">
                Intermediate
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-learning-quiz rounded-full transition-all duration-1000"
                style={{ width: '75%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Quiz Card */}
      <div 
        className={`absolute top-24 right-0 w-72 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="bg-card border-2 border-foreground/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-learning-primary" />
              <span className="text-xs font-bold text-learning-primary">ACTIVE QUIZ</span>
            </div>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <h4 className="text-base font-bold text-foreground mb-3">Patient Communication</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-learning-primary">8/10</span>
            <span className="text-sm text-muted-foreground">Pass: 80%</span>
          </div>
        </div>
      </div>

      {/* Certificate Card */}
      <div 
        className={`absolute top-56 left-4 w-56 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '300ms' }}
      >
        <div className="bg-gradient-to-br from-learning-achievement/10 to-amber-500/5 border-2 border-learning-achievement/30 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-learning-achievement" />
            <span className="text-xs font-bold text-learning-achievement">CERTIFIED</span>
          </div>
          <h4 className="text-sm font-bold text-foreground mb-1">Infection Control</h4>
          <p className="text-xs text-muted-foreground">Dec 2024</p>
        </div>
      </div>

      {/* Learning Streak Badge */}
      <div 
        className={`absolute bottom-0 right-8 w-48 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '400ms' }}
      >
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-600">Learning Streak</p>
                <p className="text-sm font-semibold text-foreground">5 Days</p>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-600">+50</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackCards({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="relative h-full">
      {/* Task Card */}
      <div 
        className={`absolute top-0 left-0 w-72 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '100ms' }}
      >
        <div className="bg-card border border-border rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              completed
            </span>
          </div>
          <h4 className="text-base font-bold text-foreground mb-3">Morning Equipment Check</h4>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              S
            </div>
            <span className="text-sm text-muted-foreground">Sarah</span>
          </div>
        </div>
      </div>

      {/* Circular Progress */}
      <div 
        className={`absolute top-24 right-0 w-48 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.92)}`}
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">92%</span>
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Team Progress</span>
          </div>
        </div>
      </div>

      {/* Template Card */}
      <div 
        className={`absolute top-56 left-8 w-64 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '300ms' }}
      >
        <div className="bg-card border border-border rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <h4 className="text-base font-bold text-foreground mb-3">Weekly Sterilization</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">8 tasks</span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Compliance
            </span>
          </div>
        </div>
      </div>

      {/* Assignment Badge */}
      <div 
        className={`absolute bottom-0 right-4 w-52 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '400ms' }}
      >
        <div className="bg-card border border-border rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
              3
            </div>
            <span className="text-sm font-medium text-foreground">tasks assigned</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyzeCards({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="relative h-full">
      {/* Team Completion Card */}
      <div 
        className={`absolute top-0 left-0 w-56 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '100ms' }}
      >
        <div className="bg-card border border-border rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-sm text-muted-foreground mb-2">Team Completion</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">92%</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div 
        className={`absolute top-24 right-0 w-64 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        <div className="bg-card border border-border rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-sm font-medium text-muted-foreground mb-4">Performance Trend</p>
          <div className="flex items-end gap-2 h-24">
            {[40, 60, 75, 90].map((height, i) => (
              <div 
                key={i}
                className="flex-1 bg-primary rounded-t transition-all duration-1000"
                style={{ 
                  height: `${height}%`,
                  transitionDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top Performer Card */}
      <div 
        className={`absolute top-56 left-4 w-60 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '300ms' }}
      >
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Top Performer</p>
              <h4 className="text-lg font-bold text-foreground">Hafsa</h4>
            </div>
            <div className="ml-auto text-3xl font-bold text-primary">98</div>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div 
        className={`absolute bottom-0 right-8 w-56 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '400ms' }}
      >
        <div className="bg-card border border-border rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-600">Live</span>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">15</div>
          <p className="text-sm text-muted-foreground mb-2">Tasks Completed</p>
          <p className="text-xs text-muted-foreground">2.3 days avg</p>
        </div>
      </div>
    </div>
  );
}
