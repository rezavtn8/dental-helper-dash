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

      {/* The Cost of Manual Management - Split Screen */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          {/* LEFT SIDE - The Problem (Dark) */}
          <div className="relative bg-gradient-to-br from-red-950 to-orange-950 dark:from-red-950/80 dark:to-orange-950/80 py-16 px-8 lg:px-12 flex flex-col justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.1),transparent_50%)]" />
            
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
                <AlertCircle className="w-4 h-4 text-red-300" />
                <span className="text-xs font-medium text-red-200">The Problem</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Manual Management is Costing You
              </h2>

              {/* Key Problem Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold text-red-400 mb-1">68%</div>
                  <div className="text-xs text-red-200">No structured onboarding</div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-400 mb-1">$5K-$10K</div>
                  <div className="text-xs text-orange-200">Per staff replacement</div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold text-amber-400 mb-1">40%</div>
                  <div className="text-xs text-amber-200">Tasks delayed daily</div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold text-rose-400 mb-1">1 in 3</div>
                  <div className="text-xs text-rose-200">Quit within first year</div>
                </div>
              </div>

              {/* Annual Cost Breakdown */}
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-red-200 mb-4">Annual Hidden Costs</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>Staff replacement (2/year)</span>
                    <span className="font-semibold text-white">$15,000</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Lost productivity (10 hrs/wk)</span>
                    <span className="font-semibold text-white">$26,000</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Compliance gaps & errors</span>
                    <span className="font-semibold text-white">$8,000</span>
                  </div>
                  <div className="h-px bg-white/20 my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">Total Cost</span>
                    <span className="text-4xl font-bold text-red-400">$49K+</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/60 mt-4">
                Sources: DentalPost 2023, AAOSH 2023
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - The Solution (Light/Bright) */}
          <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 py-16 px-8 lg:px-12 flex flex-col justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_50%)]" />
            
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">With DentaLeague</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Save $49K+ Annually
              </h2>

              <div className="space-y-4 mb-8">
                <div className="bg-white dark:bg-white/5 border border-green-200 dark:border-green-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">50%</span>
                        <span className="text-sm font-semibold text-foreground">Faster Training</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Structured onboarding reduces training time from weeks to days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-green-200 dark:border-green-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">20-30%</span>
                        <span className="text-sm font-semibold text-foreground">More Efficient</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Task tracking eliminates delays and backlogs
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-green-200 dark:border-green-500/20 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">2×</span>
                        <span className="text-sm font-semibold text-foreground">Better Retention</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Weekly check-ins reduce turnover by 50%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI Highlight */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-600/90 dark:to-emerald-600/90 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Your Annual Savings</span>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="text-4xl font-bold mb-1">$49,000+</div>
                <p className="text-xs text-green-100">
                  Average savings from improved efficiency, retention, and compliance
                </p>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Sources: ADA, HR for Health 2024
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How DentaLeague Solves This */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">The Solution</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How DentaLeague Solves This
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three core features that transform practice operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Structured Onboarding
              </h3>
              <p className="text-muted-foreground mb-4">
                Pre-built training programs and task templates get new hires productive in days, not weeks.
              </p>
              <div className="text-sm font-semibold text-primary">
                → 50% faster proficiency
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Task Tracking System
              </h3>
              <p className="text-muted-foreground mb-4">
                Automated assignment, deadlines, and follow-ups ensure nothing falls through the cracks.
              </p>
              <div className="text-sm font-semibold text-primary">
                → 20-30% productivity boost
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Compliance & Analytics
              </h3>
              <p className="text-muted-foreground mb-4">
                Real-time visibility into certifications, performance, and operational metrics.
              </p>
              <div className="text-sm font-semibold text-primary">
                → 40% fewer errors
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proven Results Section - Simplified */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Award className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Proven Results</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Real Impact, Real Data
            </h2>
            <p className="text-muted-foreground text-lg">
              Industry-backed improvements from structured management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-primary mb-1">50%</div>
                  <h3 className="font-semibold text-foreground mb-2">Faster Role Proficiency</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Structured onboarding accelerates training time
                  </p>
                  <p className="text-xs text-muted-foreground">Source: ADA & HR for Health 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-primary mb-1">20-30%</div>
                  <h3 className="font-semibold text-foreground mb-2">Higher Team Efficiency</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Task tracking eliminates delays and backlogs
                  </p>
                  <p className="text-xs text-muted-foreground">Source: Practice Booster 2023</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-primary mb-1">2×</div>
                  <h3 className="font-semibold text-foreground mb-2">Better Staff Retention</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Weekly check-ins lower turnover by 50%
                  </p>
                  <p className="text-xs text-muted-foreground">Source: HR for Health 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-primary mb-1">40%</div>
                  <h3 className="font-semibold text-foreground mb-2">Fewer Errors</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ongoing training reduces mistakes
                  </p>
                  <p className="text-xs text-muted-foreground">Source: All-Star Dental Academy 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA with ROI Focus */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1),transparent_70%)]" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Ready to Transform Your Practice?</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Save $49,000+ Annually
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join practice owners eliminating hidden costs through structured management, automated workflows, and data-driven insights
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
