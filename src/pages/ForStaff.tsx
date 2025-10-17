import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/home/Navigation';
import { 
  ArrowRight,
  CheckSquare, 
  GraduationCap, 
  Calendar,
  Target,
  Award,
  BookOpen,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function ForStaff() {
  const navigate = useNavigate();

  const features = [
    {
      icon: CheckSquare,
      title: "Clear Daily Tasks",
      description: "Know exactly what to do each day, no guessing"
    },
    {
      icon: GraduationCap,
      title: "Built-in Training",
      description: "Access courses and certifications at your own pace"
    },
    {
      icon: Target,
      title: "Track Progress",
      description: "See your growth and achievements in real-time"
    },
    {
      icon: Calendar,
      title: "Smart Schedule",
      description: "View tasks in calendar format, never miss deadlines"
    },
    {
      icon: Award,
      title: "Earn Recognition",
      description: "Get badges and rewards for your accomplishments"
    },
    {
      icon: BookOpen,
      title: "Knowledge Library",
      description: "Access protocols and procedures anytime"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        {/* Floating shapes background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">For Dental Staff</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            Your Partner in{" "}
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Success
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Whether you're an assistant or front desk coordinator, DentaLeague helps 
            you excel with clear tasks, training, and support.
          </p>
          
          <Button
            size="lg"
            onClick={() => navigate('/signup/staff')}
            className="font-semibold"
          >
            Join Your Team
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:border-accent/50 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              {/* Floating cards visualization */}
              <div className="relative h-96">
                <div className="absolute top-0 right-0 w-64 bg-card border border-border rounded-xl p-6 shadow-lg animate-float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <CheckSquare className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Today's Tasks</p>
                      <p className="text-2xl font-bold text-foreground">5/7</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-accent flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-xs text-foreground flex-1">Sterilization check</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-accent flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-xs text-foreground flex-1">Patient chart prep</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-muted" />
                      <p className="text-xs text-muted-foreground flex-1">Inventory check</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-20 left-0 w-56 bg-card border border-border rounded-xl p-5 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground">In Progress</p>
                      <p className="text-sm font-semibold text-foreground">HIPAA Training</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-medium">75%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 right-12 w-60 bg-card border border-border rounded-xl p-5 shadow-lg animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">Achievement Unlocked!</p>
                      <p className="text-[10px] text-muted-foreground">5-Day Streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <div className="flex-1">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-4 rounded-full bg-accent" />
                        <div className="w-1.5 h-4 rounded-full bg-accent" />
                        <div className="w-1.5 h-4 rounded-full bg-accent" />
                        <div className="w-1.5 h-4 rounded-full bg-accent" />
                        <div className="w-1.5 h-4 rounded-full bg-accent" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-accent">+50 pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Start strong, stay strong
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                No confusion about what to do. DentaLeague gives you everything 
                you need to excel from day one.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "Onboard faster with structured guidance",
                  "Build valuable skills with training",
                  "Get recognized for your work",
                  "Track your career growth"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to excel in your role?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join dental professionals who are building their skills with DentaLeague.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup/staff')}
            className="font-semibold"
          >
            Join Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
