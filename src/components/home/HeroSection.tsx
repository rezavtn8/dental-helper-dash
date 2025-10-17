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
      className="relative overflow-hidden bg-background py-10 sm:py-16 lg:py-24 px-4"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto text-center relative z-10 max-w-6xl">
        {/* Large Animated Logo */}
        <div 
          className={`mb-3 sm:mb-6 flex flex-col items-center gap-0.5 sm:gap-1 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <AnimatedLogo size={50} className="sm:w-[80px] sm:h-[80px] lg:w-[100px] lg:h-[100px]" />
          <div className="text-center">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">DentaLeague</h2>
          </div>
        </div>

        {/* Headline */}
        <h1 
          className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold mb-3 sm:mb-5 leading-tight sm:leading-normal bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent px-2 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          Onboard. Train. Track.
          <br />
          <span className="font-handwritten bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
            All in One Place.
          </span>
        </h1>

        {/* Subtext */}
        <p 
          className={`text-xs sm:text-sm lg:text-base text-muted-foreground mb-4 sm:mb-6 max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-2 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          Whether it's a new assistant, front desk hire, or floating staff, Dentaleague makes sure they know exactly
          what to do — from day 1 to day 100.
        </p>

        {/* CTA Buttons */}
        <div 
          className={`flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center px-2 max-w-2xl mx-auto transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <Button
            onClick={() => navigate("/signin")}
            variant="clean"
            size="sm"
            className="w-full sm:w-auto text-sm sm:text-base font-semibold px-6 sm:px-8 py-2.5 sm:py-3 h-auto"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/signup/owner")}
            variant="clean-outline"
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm font-medium px-5 sm:px-6 py-2.5 sm:py-3 h-auto"
          >
            Owner Sign Up
          </Button>
          <Button
            onClick={() => navigate("/signup/staff")}
            variant="clean-outline"
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm font-medium px-5 sm:px-6 py-2.5 sm:py-3 h-auto"
          >
            Staff Sign Up
          </Button>
        </div>
      </div>
    </section>
  );
}
