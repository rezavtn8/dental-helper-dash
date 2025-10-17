import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/home/Navigation';
import { 
  ArrowRight,
  BarChart3, 
  Users, 
  Calendar,
  ClipboardCheck,
  TrendingUp,
  FileText,
  CheckCircle
} from 'lucide-react';

export default function ForOwners() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Team Management",
      description: "Manage team members, assign roles, and track performance"
    },
    {
      icon: ClipboardCheck,
      title: "Task Templates",
      description: "Pre-built workflows for daily, weekly, and monthly operations"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Real-time insights into team productivity and compliance"
    },
    {
      icon: Calendar,
      title: "Scheduling",
      description: "Automated task assignment and deadline tracking"
    },
    {
      icon: FileText,
      title: "Compliance Reports",
      description: "Audit-ready documentation at your fingertips"
    },
    {
      icon: TrendingUp,
      title: "Training Tracking",
      description: "Monitor certifications and skill development"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        {/* Floating shapes background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">For Practice Owners</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            Run Your Practice with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Confidence
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Complete visibility and control over operations, team performance, 
            and compliance—all from one intuitive dashboard.
          </p>
          
          <Button
            size="lg"
            onClick={() => navigate('/signup/owner')}
            className="font-semibold"
          >
            Get Started
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
                  className="group relative bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-primary" />
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
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Everything you need to lead effectively
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Stop juggling spreadsheets and multiple apps. DentaLeague brings 
                everything together so you can focus on what matters.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "Reduce onboarding time from weeks to days",
                  "Save 10+ hours per week on admin work",
                  "Eliminate compliance gaps",
                  "Make data-driven decisions"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Floating cards visualization */}
              <div className="relative h-96">
                <div className="absolute top-0 left-0 w-64 bg-card border border-border rounded-xl p-6 shadow-lg animate-float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded w-20 mb-2" />
                      <div className="h-2 bg-muted rounded w-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded" />
                    <div className="h-2 bg-muted rounded w-4/5" />
                  </div>
                </div>

                <div className="absolute top-20 right-0 w-56 bg-card border border-border rounded-xl p-5 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded w-16 mb-2" />
                      <div className="h-2 bg-muted rounded w-12" />
                    </div>
                  </div>
                  <div className="h-16 bg-gradient-to-t from-primary/10 to-transparent rounded" />
                </div>

                <div className="absolute bottom-0 left-12 w-60 bg-card border border-border rounded-xl p-5 shadow-lg animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded w-24 mb-2" />
                      <div className="h-2 bg-primary/20 rounded w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to streamline your practice?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join dental practice owners who are building high-performing teams.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup/owner')}
            className="font-semibold"
          >
            Get Started
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
