import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export function Navigation() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      // Update active section based on scroll position
      const sections = ['features', 'how-it-works', 'testimonials', 'pricing'];
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navItems = [{
    name: 'Features',
    href: '#features'
  }, {
    name: 'How It Works',
    href: '#how-it-works'
  }, {
    name: 'Testimonials',
    href: '#testimonials'
  }, {
    name: 'Pricing',
    href: '#pricing'
  }];
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setIsMobileMenuOpen(false);
    }
  };
  const isActive = (href: string) => {
    const sectionId = href.replace('#', '');
    return activeSection === sectionId;
  };
  return <nav className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/50' : 'bg-transparent'}`}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <AnimatedLogo size={28} animated={false} className="text-primary" />
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                DentaLeague
              </span>
              
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center bg-slate-50/80 backdrop-blur-sm rounded-full p-1.5 mr-6 border border-slate-200/60">
              {navItems.map(item => <button key={item.name} onClick={() => item.href.startsWith('#') && scrollToSection(item.href.slice(1))} className={`relative px-4 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 whitespace-nowrap ${isActive(item.href) ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50 border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}>
                  {item.name}
                </button>)}
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/signin')} 
                className="text-base font-semibold text-slate-700 hover:text-slate-900 px-5 py-2.5"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/signup/owner')} 
                variant="default" 
                size="default" 
                className="rounded-full h-10 px-5 font-semibold shadow-md"
              >
                Owner Sign Up
              </Button>
              <Button 
                onClick={() => navigate('/signup/staff')} 
                variant="outline" 
                size="default" 
                className="rounded-full h-10 px-5 font-semibold"
              >
                Staff Sign Up
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-xl rounded-b-2xl">
            <div className="container mx-auto py-6">
              <div className="space-y-3">
                 {navItems.map(item => <button key={item.name} onClick={() => item.href.startsWith('#') && scrollToSection(item.href.slice(1))} className={`block w-full text-left py-3 px-4 text-base font-semibold transition-colors duration-200 rounded-xl ${isActive(item.href) ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'}`}>
                     {item.name}
                   </button>)}
                <div className="pt-4 space-y-3">
                  <Button 
                    variant="default" 
                    onClick={() => navigate('/signin')} 
                    className="w-full text-base font-semibold h-12"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/signup/owner')} 
                    variant="default" 
                    size="lg" 
                    className="w-full rounded-xl h-12 text-base font-semibold"
                  >
                    Owner Sign Up
                  </Button>
                  <Button 
                    onClick={() => navigate('/signup/staff')} 
                    variant="outline" 
                    size="lg" 
                    className="w-full rounded-xl h-12 text-base font-semibold"
                  >
                    Staff Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>}
      </div>
    </nav>;
}