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

  const features = [
    {
      icon: Users,
      title: "Team Management",
      description: "Manage team members, assign roles, and track performance",
      stat: "25-30% annual turnover without proper systems"
    },
    {
      icon: ClipboardCheck,
      title: "Task Templates",
      description: "Pre-built workflows for daily, weekly, and monthly operations",
      stat: "40% of tasks forgotten without tracking"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Real-time insights into team productivity and compliance",
      stat: "20-30% efficiency gain with structured systems"
    },
    {
      icon: Calendar,
      title: "Scheduling",
      description: "Automated task assignment and deadline tracking",
      stat: "#1 owner complaint: tasks not followed through"
    },
    {
      icon: FileText,
      title: "Compliance Reports",
      description: "Audit-ready documentation at your fingertips",
      stat: "40% error reduction with proper training"
    },
    {
      icon: TrendingUp,
      title: "Training Tracking",
      description: "Monitor certifications and skill development",
      stat: "50% faster proficiency with structured programs"
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

      {/* Stats Hero Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              The State of Dental Practice Management
            </h2>
            <p className="text-muted-foreground text-lg">
              Industry data reveals significant challenges facing dental practices today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: "68%",
                label: "of dental offices have no structured onboarding",
                icon: AlertCircle,
                color: "text-orange-500",
                source: "DentalPost 2023"
              },
              {
                number: "$5K-$10K",
                label: "cost per staff replacement",
                icon: DollarSign,
                color: "text-red-500",
                source: "DentalPost 2023"
              },
              {
                number: "40%",
                label: "of daily tasks delayed without tracking",
                icon: Clock,
                color: "text-amber-500",
                source: "AAOSH 2023"
              },
              {
                number: "1 in 3",
                label: "employees quit within first year",
                icon: UserX,
                color: "text-rose-500",
                source: "DentalPost 2023"
              }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                  <div className="relative">
                    <IconComponent className={`w-8 h-8 ${stat.color} mb-4`} />
                    <div className="mb-3">
                      <div className={`text-4xl sm:text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2`}>
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
          </div>
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
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {feature.description}
                    </p>
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-xs text-primary font-medium">
                        {feature.stat}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Real Cost Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">The Hidden Costs</span>
              </div>
              
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Manual Management is Expensive
              </h2>
              
              <div className="space-y-6 mb-8">
                <div className="bg-card border border-red-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Staff Turnover</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        25-30% annual turnover costs $5,000-$10,000 per replacement
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Source: DentalPost 2023 Report
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-amber-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-2">
                    <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Lost Productivity</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        40% of tasks delayed or forgotten without structured systems
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Source: AAOSH Practice Management Report 2023
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-orange-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">No Onboarding Structure</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        68% of dental offices provide no formal onboarding beyond shadowing
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Source: DentalPost 2023 Survey
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6">
                <h4 className="font-semibold text-foreground mb-3">Estimated Annual Cost</h4>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex justify-between">
                    <span>Staff replacement (2 per year)</span>
                    <span className="font-semibold text-foreground">$15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lost productivity (10 hrs/week)</span>
                    <span className="font-semibold text-foreground">$26,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance gaps & errors</span>
                    <span className="font-semibold text-foreground">$8,000</span>
                  </div>
                  <div className="h-px bg-border my-3" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-foreground">Total Hidden Cost</span>
                    <span className="font-bold text-red-500">$49,000+</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Comparison cards */}
              <div className="relative h-[500px]">
                <div className="absolute top-0 left-0 w-full bg-card border-2 border-green-500/30 rounded-xl p-6 shadow-xl animate-float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">With DentaLeague</p>
                      <p className="text-2xl font-bold text-green-500">50%</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">Faster Role Proficiency</p>
                  <p className="text-xs text-muted-foreground">
                    Structured onboarding reduces training time from weeks to days
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">Source: ADA & HR for Health 2024</p>
                  </div>
                </div>

                <div className="absolute top-40 right-0 w-64 bg-card border-2 border-primary/30 rounded-xl p-6 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Team Efficiency</p>
                      <p className="text-2xl font-bold text-primary">20-30%</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">Higher Productivity</p>
                  <p className="text-xs text-muted-foreground">
                    Structured task systems eliminate delays and backlogs
                  </p>
                </div>

                <div className="absolute bottom-0 left-8 w-60 bg-card border-2 border-accent/30 rounded-xl p-6 shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Staff Retention</p>
                      <p className="text-2xl font-bold text-accent">2×</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">Lower Turnover</p>
                  <p className="text-xs text-muted-foreground">
                    Weekly check-ins and clarity reduce turnover by 50%
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">Source: HR for Health 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proven Results Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Proven Results</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Real Impact on Your Practice
            </h2>
            <p className="text-muted-foreground text-lg">
              Data-backed improvements from practices using structured management systems
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                number: "50%",
                label: "Faster Role Proficiency",
                description: "Structured onboarding programs accelerate training",
                source: "ADA & HR for Health 2024"
              },
              {
                icon: TrendingUp,
                number: "20-30%",
                label: "Higher Team Efficiency",
                description: "Task tracking eliminates delays and backlogs",
                source: "Practice Booster 2023"
              },
              {
                icon: Users,
                number: "2×",
                label: "Better Retention",
                description: "Weekly check-ins dramatically lower turnover",
                source: "HR for Health 2024"
              },
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
