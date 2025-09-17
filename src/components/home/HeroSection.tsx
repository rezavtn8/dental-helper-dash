import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export function HeroSection() {
  const navigate = useNavigate();
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50/80 py-24 lg:py-32">
      {/* Modern geometric background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(215_15%_95%),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(210_20%_92%),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,hsl(215_10%_96%)_50%,transparent_51%)] bg-[length:40px_40px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-400/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto text-center relative z-10">
        {/* Large Animated Logo */}
        <div className="mb-8 flex flex-col items-center space-y-4">
          <AnimatedLogo size={180} />
            <div className="text-center space-y-2">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">DentaLeague</h2>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-medium">dental teamwork, simplified</p>
            </div>
        </div>
        
        {/* Headline */}
        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
          Dental teamwork,
          <br />
          <span className="font-serif italic bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">simplified.</span>
        </h1>
        
        {/* Subtext */}
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
          Structured daily tasks, gentle reminders, and clear tools that support assistants and owners alike.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <Button onClick={() => navigate('/auth')} variant="minimal" size="xl" className="font-display">
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
          <Button onClick={() => scrollToSection('features')} variant="outline" size="xl" className="font-display">
            Watch Demo
            <Play className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </section>;
}