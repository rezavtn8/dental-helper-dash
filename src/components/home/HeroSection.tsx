import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();
  
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-surface to-background py-20 lg:py-32">
      {/* Floating shapes background */}
      <div className="floating-shapes">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>
      
      {/* Enhanced animated background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(217_91%_85%_/_0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(217_91%_75%_/_0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(217_91%_90%_/_0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,hsl(217_91%_90%_/_0.05)_50%,transparent_51%)] bg-[length:30px_30px] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_49%,hsl(217_91%_85%_/_0.03)_50%,transparent_51%)] bg-[length:40px_40px]" />
      </div>

      <div className="container mx-auto text-center relative z-10">
        {/* Large Animated Logo */}
        <div className="mb-8">
          <AnimatedLogo size={120} />
        </div>
        
        {/* Headline */}
        <h1 className="text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-semibold mb-6 leading-[3.5rem] md:leading-[4rem] lg:leading-[4.5rem] bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Dental teamwork,
          <br />
          <span className="font-handwritten bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">simplified.</span>
        </h1>
        
        {/* Subtext */}
        <p className="text-[1rem] text-muted-foreground mb-8 max-w-2xl mx-auto leading-[1.5rem]">
          Structured daily tasks, gentle reminders, and clear tools that support assistants and owners alike.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <Button 
            onClick={() => navigate('/auth')}
            variant="gradient"
            size="lg" 
            className="text-base font-medium px-8 py-3 h-auto"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button 
            onClick={() => scrollToSection('features')}
            variant="gradient-outline"
            size="lg" 
            className="text-base font-medium px-8 py-3 h-auto"
          >
            Watch Demo
            <Play className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}