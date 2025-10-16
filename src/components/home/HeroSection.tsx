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
      className="relative overflow-hidden bg-background py-20 sm:py-24 lg:py-32 px-4"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto text-center relative z-10 max-w-6xl">
        {/* Large Animated Logo */}
        <div 
          className={`mb-6 sm:mb-8 flex flex-col items-center space-y-1 sm:space-y-2 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <AnimatedLogo size={80} className="sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px]" />
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">DentaLeague</h2>
          </div>
        </div>

        {/* Headline */}
        <h1 
          className={`text-[1.75rem] sm:text-[2rem] md:text-[2.4rem] lg:text-[2.8rem] xl:text-[3.2rem] font-semibold mb-4 sm:mb-6 leading-[2rem] sm:leading-[2.4rem] md:leading-[2.8rem] lg:leading-[3.2rem] xl:leading-[3.6rem] bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent px-4 transition-all duration-1000 ease-out ${
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
          className={`text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl lg:max-w-3xl mx-auto leading-[1.4rem] sm:leading-[1.5rem] lg:leading-[1.6rem] px-4 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          Whether it's a new assistant, front desk hire, or floating staff, Dentaleague makes sure they know exactly
          what to do — from day 1 to day 100.
        </p>

        {/* CTA Buttons */}
        <div 
          className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 max-w-2xl mx-auto transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <Button
            onClick={() => navigate("/signin")}
            variant="clean"
            size="lg"
            className="w-full sm:w-auto text-base sm:text-lg font-bold px-8 sm:px-10 lg:px-12 py-4 sm:py-5 h-auto"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/signup/owner")}
            variant="clean-outline"
            size="lg"
            className="w-full sm:w-auto text-sm sm:text-base font-semibold px-6 sm:px-8 py-3 sm:py-4 h-auto"
          >
            Owner Sign Up
          </Button>
          <Button
            onClick={() => navigate("/signup/staff")}
            variant="clean-outline"
            size="lg"
            className="w-full sm:w-auto text-sm sm:text-base font-semibold px-6 sm:px-8 py-3 sm:py-4 h-auto"
          >
            Staff Sign Up
          </Button>
        </div>
      </div>
    </section>
  );
}
