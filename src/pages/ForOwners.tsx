import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { 
  ArrowLeft, 
  ArrowRight,
  BarChart3, 
  Users, 
  Calendar,
  ClipboardCheck,
  TrendingUp,
  FileText,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function ForOwners() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Team Management",
      description: "Add unlimited team members, assign roles, and manage permissions all in one place."
    },
    {
      icon: ClipboardCheck,
      title: "Task Templates",
      description: "Create custom task templates or use our pre-built ones for daily, weekly, and monthly workflows."
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track completion rates, identify bottlenecks, and measure team productivity with detailed insights."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automatically assign recurring tasks and get notified when things fall behind schedule."
    },
    {
      icon: FileText,
      title: "Compliance Reports",
      description: "Generate audit-ready reports for HIPAA, OSHA, and other regulatory requirements instantly."
    },
    {
      icon: Shield,
      title: "Training Tracking",
      description: "Monitor staff certifications, course completions, and identify knowledge gaps across your team."
    }
  ];

  const benefits = [
    "Reduce onboarding time from weeks to days",
    "Eliminate missed tasks and compliance gaps",
    "Increase team accountability and transparency",
    "Save 10+ hours per week on administrative work",
    "Scale your practice without scaling headaches",
    "Make data-driven decisions with real-time insights"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <AnimatedLogo size={24} animated={false} className="text-primary" />
              <span className="text-lg font-bold text-foreground">DentaLeague</span>
            </button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Run Your Practice Like a{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pro
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              DentaLeague gives dental practice owners complete visibility and control over operations, 
              team performance, and compliance—all from one intuitive dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/signup/owner')}
                className="font-semibold"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/pricing')}
                className="font-semibold"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Lead
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for dental practice owners and managers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Transform How You Manage Your Practice
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Stop juggling spreadsheets, checklists, and multiple apps. DentaLeague brings 
                everything together so you can focus on growing your practice and delivering 
                exceptional patient care.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/signup/owner')}
                className="font-semibold"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                What You'll Achieve
              </h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join forward-thinking dental practice owners who are streamlining operations 
            and building high-performing teams with DentaLeague.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/signup/owner')}
              className="font-semibold"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/signin')}
              className="font-semibold"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
