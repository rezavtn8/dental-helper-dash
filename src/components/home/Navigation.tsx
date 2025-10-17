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
    name: 'For Owners',
    href: '#for-owners'
  }, {
    name: 'For Staff',
    href: '#for-staff'
  }, {
    name: 'Pricing',
    href: '/pricing'
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
  
  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      scrollToSection(href.slice(1));
    } else {
      navigate(href);
      setIsMobileMenuOpen(false);
    }
  };
  const isActive = (href: string) => {
    const sectionId = href.replace('#', '');
    return activeSection === sectionId;
  };
  return <nav className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-background/50'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <AnimatedLogo size={24} animated={false} className="text-primary" />
            <span className="text-base sm:text-lg font-bold text-foreground">DentaLeague</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navItems.map(item => (
                <button 
                  key={item.name} 
                  onClick={() => handleNavClick(item.href)} 
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href) 
                      ? 'text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="default" 
                onClick={() => navigate('/signin')} 
                size="sm"
                className="font-medium"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/signup/owner')} 
                variant="secondary"
                size="sm"
                className="font-medium"
              >
                Owner Sign Up
              </Button>
              <Button 
                onClick={() => navigate('/signup/staff')} 
                variant="secondary"
                size="sm"
                className="font-medium"
              >
                Staff Sign Up
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" 
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <button 
                  key={item.name} 
                  onClick={() => handleNavClick(item.href)} 
                  className={`text-left py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href) 
                      ? 'bg-muted text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Button 
                  variant="default" 
                  onClick={() => navigate('/signin')} 
                  size="sm"
                  className="w-full font-medium"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/signup/owner')} 
                  variant="secondary"
                  size="sm"
                  className="w-full font-medium"
                >
                  Owner Sign Up
                </Button>
                <Button 
                  onClick={() => navigate('/signup/staff')} 
                  variant="secondary"
                  size="sm"
                  className="w-full font-medium"
                >
                  Staff Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>;
}