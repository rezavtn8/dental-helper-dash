import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export function HeroSection() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-x-hidden overflow-y-visible bg-background py-10 sm:py-16 lg:py-24 px-4"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto text-center relative z-10 max-w-6xl overflow-x-hidden">
        {/* Large Animated Logo */}
        <div 
          className={`mb-6 sm:mb-8 flex flex-col items-center gap-0 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <AnimatedLogo size={80} className="sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] mx-auto" />
          <div className="text-center -mt-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">DentaLeague</h2>
          </div>
        </div>

        {/* Headline */}
        <h1 
          className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 sm:mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent max-w-4xl mx-auto transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          Onboard. Train. Track.
          <br />
          <span className="font-handwritten bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            All in One Place.
          </span>
        </h1>

        {/* Subtext */}
        <p 
          className={`text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          Whether it's a new assistant, front desk hire, or floating staff, Dentaleague makes sure they know exactly
          what to do — from day 1 to day 100.
        </p>

        {/* CTA Buttons */}
        <div 
          className={`flex flex-col sm:flex-row gap-3 justify-center items-center max-w-2xl mx-auto transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <Button
            onClick={() => navigate("/signin")}
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/signup/owner")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Owner Sign Up
          </Button>
          <Button
            onClick={() => navigate("/signup/staff")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Staff Sign Up
          </Button>
        </div>
      </div>
    </section>
  );
}
