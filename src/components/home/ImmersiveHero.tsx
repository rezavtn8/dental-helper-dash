import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ImmersiveHero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient opacity-60" />
      
      {/* Floating UI elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-ui absolute top-20 left-10 glass-card p-4 rounded-2xl max-w-xs">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium text-sm">Task Completed</p>
              <p className="text-xs text-muted-foreground">Room cleanup finished</p>
            </div>
          </div>
        </div>
        
        <div className="floating-ui absolute top-40 right-20 glass-card p-4 rounded-2xl max-w-sm">
          <div className="space-y-2">
            <p className="font-medium text-sm">Today's Tasks</p>
            <div className="space-y-1">
              {['Sterilize instruments', 'Update patient records', 'Schedule follow-ups'].map((task, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-ui absolute bottom-40 left-20 glass-card p-3 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">98%</p>
            <p className="text-xs text-muted-foreground">Task completion</p>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 py-20 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo and brand */}
          <div className="mb-12 space-y-4">
            <AnimatedLogo size={120} />
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight">DentaLeague</h2>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
                dental teamwork, simplified
              </p>
            </div>
          </div>
          
          {/* Main headline */}
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
            <span className="glow-text">Seamless</span>
            <br />
            <span className="text-foreground">dental workflows</span>
          </h1>
          
          {/* Subtext */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Crystal-clear tasks, intelligent automation, and beautiful interfaces that make dental teams more efficient than ever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-medium shadow-2xl"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg font-medium glass-card border-border/50"
            >
              Watch Demo
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>HIPAA compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}