import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/home/Navigation';
import { ArrowRight, Users, TrendingUp, CheckCircle, AlertCircle, DollarSign, Clock, UserX, Target, Award, Zap, ShieldCheck, Sparkles } from 'lucide-react';

export default function ForStaff() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 px-4 overflow-hidden">
        {/* Floating shapes background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{
            animationDelay: '2s'
          }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent/3 rounded-full blur-3xl animate-float" style={{
            animationDelay: '4s'
          }} />
        </div>
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">For Dental Staff</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            Excel in Your Role with{" "}
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Clarity & Support
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Clear tasks, structured training, and real recognition—everything you need 
            to thrive from day one.
          </p>
          
          <Button size="lg" onClick={() => navigate('/signup/staff')} className="font-semibold">
            Join Your Team
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Key Challenges Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-lg">
              Industry data reveals significant challenges facing dental staff today
            </p>
          </div>

          {/* 4 Challenge Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                number: "68%",
                label: "of dental offices have no structured onboarding",
                icon: AlertCircle,
                bgColor: "bg-card",
                borderColor: "border-border",
                iconBg: "bg-muted",
                iconColor: "text-orange-600 dark:text-orange-400",
                source: "DentalPost 2023"
              },
              {
                number: "$5K-$10K",
                label: "cost per staff replacement",
                icon: DollarSign,
                bgColor: "bg-card",
                borderColor: "border-border",
                iconBg: "bg-muted",
                iconColor: "text-red-600 dark:text-red-400",
                source: "DentalPost 2023"
              },
              {
                number: "40%",
                label: "of daily tasks delayed without tracking",
                icon: Clock,
                bgColor: "bg-card",
                borderColor: "border-border",
                iconBg: "bg-muted",
                iconColor: "text-amber-600 dark:text-amber-400",
                source: "AAOSH 2023"
              },
              {
                number: "1 in 3",
                label: "employees quit within first year",
                icon: UserX,
                bgColor: "bg-card",
                borderColor: "border-border",
                iconBg: "bg-muted",
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
          </div>

          {/* Impact Card - Lack of Support */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-card border-2 border-border rounded-3xl p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:border-accent/20">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent rounded-3xl opacity-50" />
              
              <div className="relative">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      The Impact of Unclear Expectations
                    </h3>
                    <p className="text-muted-foreground">
                      What happens when staff don't have clear guidance and support
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Key Issues */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
                      Common Challenges
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="bg-muted/30 rounded-xl p-4 border border-border">
                        <div className="flex items-start gap-3 mb-2">
                          <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground mb-1">No Structured Onboarding</h5>
                            <p className="text-sm text-muted-foreground">
                              68% of offices rely only on shadowing, leading to confusion and mistakes
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Source: DentalPost 2023
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-4 border border-border">
                        <div className="flex items-start gap-3 mb-2">
                          <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground mb-1">Task Management Issues</h5>
                            <p className="text-sm text-muted-foreground">
                              The #1 complaint from owners: staff not following through on delegated tasks
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Source: Dental Economics 2024
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-4 border border-border">
                        <div className="flex items-start gap-3 mb-2">
                          <UserX className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground mb-1">High Turnover</h5>
                            <p className="text-sm text-muted-foreground">
                              1 in 3 employees quit within first year due to lack of clarity or feedback
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Source: DentalPost 2023
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Stats */}
                  <div>
                    <div className="bg-muted/40 rounded-2xl p-8 border-2 border-border mb-6">
                      <p className="text-sm text-muted-foreground uppercase tracking-wide mb-3">
                        Staff Turnover Rate
                      </p>
                      <div className="text-6xl md:text-7xl font-bold text-accent mb-2 leading-none">
                        25-30<span className="text-4xl">%</span>
                      </div>
                      <p className="text-sm text-foreground font-medium">
                        annually for front-office staff
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">40%</span> of tasks delayed without tracking
                        </p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                        <DollarSign className="w-5 h-5 text-accent flex-shrink-0" />
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">$5K-$10K</span> to replace each team member
                        </p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                        <Clock className="w-5 h-5 text-accent flex-shrink-0" />
                        <p className="text-sm text-foreground">
                          Weeks of <span className="font-semibold">lost productivity</span> during transitions
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Benefits Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Thrive with Clear Structure & Support
            </h2>
            <p className="text-muted-foreground text-lg">
              Data-backed improvements from structured guidance and training
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-accent/5 via-background to-accent/10 border-2 border-accent/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-accent/40">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-accent" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent mb-2">
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

            <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-2 border-primary/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent mb-2">
                20-30%
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Higher Team Efficiency
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
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Real Benefits for Your Career
            </h2>
            <p className="text-muted-foreground text-lg">
              Additional benefits from structured training and task management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                number: "40%",
                label: "Error Reduction",
                description: "Ongoing training cuts clinical and administrative errors",
                source: "All-Star Dental Academy 2024"
              },
              {
                icon: Award,
                number: "35%",
                label: "Higher Patient Satisfaction",
                description: "Better training helps you deliver superior care",
                source: "All-Star Dental Academy 2024"
              },
              {
                icon: Target,
                number: "Less",
                label: "Task Confusion",
                description: "Clear daily tasks mean you know exactly what to do",
                source: "Practice Management Studies"
              }
            ].map((result, index) => {
              const IconComponent = result.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-accent/50 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent mb-1">
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
      <section className="py-12 px-4 bg-gradient-to-br from-accent/5 via-background to-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Start Strong, Stay Strong</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Excel from Day One
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join dental professionals who are <span className="font-bold text-foreground">thriving with clear guidance</span>, 
            structured training, and real recognition for their work.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              "Clear daily tasks",
              "Structured onboarding",
              "Continuous learning",
              "Career growth tracking"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          
          <Button size="lg" onClick={() => navigate('/signup/staff')} className="font-semibold text-lg px-8">
            Join Your Team
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
