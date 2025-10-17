import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/home/Navigation';
import { 
  ArrowRight,
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Clock,
  UserX,
  Target,
  Award,
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function ForOwners() {
  const navigate = useNavigate();

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

      {/* Key Challenges Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              The State of Dental Practice Management
            </h2>
            <p className="text-muted-foreground text-lg">
              Industry data reveals significant challenges facing dental practices today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                number: "68%",
                label: "of dental offices have no structured onboarding",
                icon: AlertCircle,
                bgColor: "bg-orange-50 dark:bg-orange-950/20",
                borderColor: "border-orange-200 dark:border-orange-900/30",
                iconBg: "bg-orange-100 dark:bg-orange-900/30",
                iconColor: "text-orange-600 dark:text-orange-400",
                source: "DentalPost 2023"
              },
              {
                number: "$5K-$10K",
                label: "cost per staff replacement",
                icon: DollarSign,
                bgColor: "bg-red-50 dark:bg-red-950/20",
                borderColor: "border-red-200 dark:border-red-900/30",
                iconBg: "bg-red-100 dark:bg-red-900/30",
                iconColor: "text-red-600 dark:text-red-400",
                source: "DentalPost 2023"
              },
              {
                number: "40%",
                label: "of daily tasks delayed without tracking",
                icon: Clock,
                bgColor: "bg-amber-50 dark:bg-amber-950/20",
                borderColor: "border-amber-200 dark:border-amber-900/30",
                iconBg: "bg-amber-100 dark:bg-amber-900/30",
                iconColor: "text-amber-600 dark:text-amber-400",
                source: "AAOSH 2023"
              },
              {
                number: "1 in 3",
                label: "employees quit within first year",
                icon: UserX,
                bgColor: "bg-rose-50 dark:bg-rose-950/20",
                borderColor: "border-rose-200 dark:border-rose-900/30",
                iconBg: "bg-rose-100 dark:bg-rose-900/30",
                iconColor: "text-rose-600 dark:text-rose-400",
                source: "DentalPost 2023"
              }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className={`group relative ${stat.bgColor} border-2 ${stat.borderColor} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
                      <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                        {stat.number}
                      </div>
                      <p className="text-sm text-foreground font-medium leading-snug">
                        {stat.label}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Source: {stat.source}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Total Cost Card - Standout Design */}
            <div className="md:col-span-2 lg:col-span-1 relative bg-gradient-to-br from-destructive/10 via-destructive/5 to-background border-2 border-destructive/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-destructive/50">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent rounded-2xl opacity-50" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-destructive" />
                </div>
                <div className="mb-3">
                  <div className="text-5xl sm:text-6xl font-bold text-destructive mb-2 leading-none">
                    $49K+
                  </div>
                  <p className="text-sm text-foreground font-semibold leading-snug">
                    Total Annual Cost of Manual Management
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground mt-4 pt-4 border-t border-destructive/20">
                  <div className="flex justify-between">
                    <span>Staff turnover</span>
                    <span className="font-medium text-foreground">$15K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lost productivity</span>
                    <span className="font-medium text-foreground">$26K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errors & gaps</span>
                    <span className="font-medium text-foreground">$8K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">With DentaLeague</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Transform Your Practice Operations
            </h2>
            <p className="text-muted-foreground text-lg">
              Data-backed improvements from structured management systems
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-2 border-primary/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2">
                50%
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Faster Role Proficiency
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Structured onboarding reduces training time from weeks to days
              </p>
              <p className="text-xs text-muted-foreground">
                Source: ADA & HR for Health 2024
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent/5 via-background to-accent/10 border-2 border-accent/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-accent/40">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2">
                20-30%
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Higher Productivity
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Task tracking systems eliminate delays and backlogs
              </p>
              <p className="text-xs text-muted-foreground">
                Source: Practice Booster 2023
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/5 via-background to-green-500/10 border-2 border-green-500/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-green-500/40">
              <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                2×
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Better Retention
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Weekly check-ins dramatically reduce staff turnover
              </p>
              <p className="text-xs text-muted-foreground">
                Source: HR for Health 2024
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proven Results Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Proven Results</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Real Impact on Your Practice
            </h2>
            <p className="text-muted-foreground text-lg">
              Additional benefits from practices using structured management systems
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                number: "40%",
                label: "Error Reduction",
                description: "Ongoing training cuts clinical and admin errors",
                source: "All-Star Dental Academy 2024"
              },
              {
                icon: Award,
                number: "35%",
                label: "Patient Satisfaction Increase",
                description: "Better-trained teams deliver superior care",
                source: "All-Star Dental Academy 2024"
              },
              {
                icon: Target,
                number: "10+",
                label: "Hours Saved Weekly",
                description: "Automation reduces administrative burden",
                source: "Practice Management Studies"
              }
            ].map((result, index) => {
              const IconComponent = result.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-1">
                        {result.number}
                      </div>
                      <h3 className="text-base font-semibold text-foreground">
                        {result.label}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {result.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Source: {result.source}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data-Driven CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Solve the #1 Owner Complaint</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Stop Losing Money to Inefficiency
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join practice owners saving an average of <span className="font-bold text-foreground">$49,000+ annually</span> by 
            eliminating the hidden costs of manual management.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              "Save 10+ hours/week",
              "Cut turnover by 50%",
              "40% fewer errors",
              "2× faster onboarding"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          
          <Button
            size="lg"
            onClick={() => navigate('/signup/owner')}
            className="font-semibold text-lg px-8"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Based on industry research from DentalPost, ADA, and HR for Health
          </p>
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
