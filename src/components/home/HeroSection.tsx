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
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-surface to-background py-12 sm:py-16 lg:py-24 xl:py-32 px-4">
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

      <div className="container mx-auto text-center relative z-10 max-w-6xl">
        {/* Large Animated Logo */}
        <div className="mb-6 sm:mb-8 flex flex-col items-center space-y-3 sm:space-y-4">
          <AnimatedLogo size={80} className="sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px]" />
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">DentaLeague</h2>
          </div>
        </div>
        
        {/* Headline */}
        <h1 className="text-[1.75rem] sm:text-[2rem] md:text-[2.4rem] lg:text-[2.8rem] xl:text-[3.2rem] font-semibold mb-4 sm:mb-6 leading-[2rem] sm:leading-[2.4rem] md:leading-[2.8rem] lg:leading-[3.2rem] xl:leading-[3.6rem] bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent px-4">
          Onboard. Train. Manage.
          <br />
          <span className="font-handwritten bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">All in One Place.</span>
        </h1>
        
        {/* Subtext */}
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl lg:max-w-3xl mx-auto leading-[1.4rem] sm:leading-[1.5rem] lg:leading-[1.6rem] px-4">
          Whether it's a new assistant, front desk hire, or floating staff, Dentaleague makes sure they know exactly what to do — from day 1 to day 100.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center px-4">
          <Button 
            onClick={() => navigate('/auth')}
            variant="clean"
            size="lg" 
            className="w-full sm:w-auto text-sm sm:text-base font-semibold px-6 sm:px-8 lg:px-10 py-3 sm:py-4 h-auto"
          >
            Launch Your Clinic Hub
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button 
            onClick={() => scrollToSection('features')}
            variant="clean-outline"
            size="lg" 
            className="w-full sm:w-auto text-sm sm:text-base font-medium px-6 sm:px-8 lg:px-10 py-3 sm:py-4 h-auto"
          >
            Watch Demo
            <Play className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}