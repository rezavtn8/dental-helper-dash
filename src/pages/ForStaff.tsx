import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckSquare, 
  GraduationCap, 
  Calendar,
  Target,
  Award,
  BookOpen,
  Sparkles,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function ForStaff() {
  const navigate = useNavigate();

  const features = [
    {
      icon: CheckSquare,
      title: "Clear Daily Tasks",
      description: "Know exactly what needs to be done each day. No more guessing or asking around."
    },
    {
      icon: GraduationCap,
      title: "Built-in Training",
      description: "Access courses, quizzes, and certifications right in the app. Learn at your own pace."
    },
    {
      icon: Target,
      title: "Track Your Progress",
      description: "See your completion rates, achievements, and how you're growing in your role."
    },
    {
      icon: Calendar,
      title: "Smart Schedule View",
      description: "View your assigned tasks in a calendar format. Stay organized and never miss a deadline."
    },
    {
      icon: Award,
      title: "Earn Recognition",
      description: "Get badges and achievements as you complete tasks and training. Your hard work matters."
    },
    {
      icon: BookOpen,
      title: "Knowledge Library",
      description: "Access protocols, procedures, and clinic-specific documentation whenever you need it."
    }
  ];

  const benefits = [
    "Onboard faster and feel confident from day one",
    "Always know what's expected of you",
    "Build valuable skills with structured training",
    "Get recognized for your contributions",
    "Communicate clearly with your team",
    "Grow your career with tracked progress"
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
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Partner in{" "}
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Success
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Whether you're a dental assistant, front desk coordinator, or part of the clinical team, 
              DentaLeague helps you excel in your role with clarity, training, and support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/signup/staff')}
                className="font-semibold"
              >
                Join Your Team
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
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Thrive
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tools designed to help you succeed, grow, and feel confident in your role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-accent/50"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-accent" />
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
            <div className="order-2 lg:order-1 bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-8 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                How You'll Benefit
              </h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 lg:order-2">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Start Strong, Stay Strong
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                No more confusion about what to do or where to find information. DentaLeague 
                gives you everything you need to perform at your best, from your first day 
                through your entire career.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/signup/staff')}
                className="font-semibold"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial-style Section */}
      <section className="py-16 sm:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Built for Your Success
              </div>
            </div>
            <blockquote className="text-xl sm:text-2xl text-foreground font-medium mb-6 leading-relaxed">
              "DentaLeague made me feel like a pro from day one. Everything I needed to know 
              was right there—no more feeling lost or overwhelmed."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">JD</span>
              </div>
              <div>
                <div className="font-semibold text-foreground">Jessica D.</div>
                <div className="text-sm text-muted-foreground">Dental Assistant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of dental professionals who are building their skills and 
            advancing their careers with DentaLeague.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/signup/staff')}
              className="font-semibold"
            >
              Join Now
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
