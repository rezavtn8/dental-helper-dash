import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { ChevronRight } from 'lucide-react';

export function HeroSection() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="container mx-auto py-16 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      {/* Background Pattern - Reduced contrast by 25% */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
        backgroundSize: '15px 15px',
      }}></div>
      <div className="absolute inset-0 opacity-22" style={{
        backgroundImage: `radial-gradient(circle at 8px 12px, rgba(37, 99, 235, 0.22) 1px, transparent 0)`,
        backgroundSize: '22px 22px',
      }}></div>
      <div className="absolute inset-0 opacity-19" style={{
        backgroundImage: `radial-gradient(circle at 5px 3px, rgba(29, 78, 216, 0.3) 2px, transparent 0)`,
        backgroundSize: '18px 18px',
      }}></div>
      <div className="absolute inset-0 opacity-11" style={{
        backgroundImage: `radial-gradient(ellipse 3px 1px at 12px 8px, rgba(59, 130, 246, 0.38) 0px, transparent 2px)`,
        backgroundSize: '35px 35px',
      }}></div>

      <div className="text-center max-w-4xl mx-auto relative z-10">
        {/* Large Animated Logo */}
        <div className="mb-8">
          <AnimatedLogo size={120} />
        </div>
        
        {/* Headline - Updated copy and typography */}
        <h1 className="text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-semibold mb-6 text-blue-900 tracking-tight leading-[3.5rem] md:leading-[4rem] lg:leading-[4.5rem]">
          Dental teamwork,
          <br />
          <span className="text-blue-600">simplified.</span>
        </h1>
        
        {/* Subtext - Updated copy */}
        <p className="text-xl text-blue-700 mb-8 max-w-2xl mx-auto leading-relaxed">
          Structured daily tasks, gentle reminders, and clear tools that support assistants and owners alike.
        </p>

        {/* CTA Buttons - Updated copy and styling */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            size="lg" 
            onClick={() => scrollToSection('auth-section')}
            className="rounded-full h-12 px-8 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Start your clinic
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          
          <Button 
            size="lg" 
            variant="ghost" 
            onClick={() => scrollToSection('features')}
            className="rounded-full h-12 px-8 text-base font-medium text-blue-700 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200"
          >
            See how it works
          </Button>
        </div>
      </div>
    </section>
  );
}