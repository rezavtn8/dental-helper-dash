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

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (href: string) => {
    const sectionId = href.replace('#', '');
    return activeSection === sectionId;
  };

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md border-b border-border/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <AnimatedLogo size={28} animated={false} className="text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-900 bg-clip-text text-transparent">
                DentaLeague
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">dental teamwork, simplified</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center bg-muted/50 rounded-full p-1 mr-6">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => item.href.startsWith('#') && scrollToSection(item.href.slice(1))}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="text-sm font-medium"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                variant="default"
                className="rounded-full h-9 px-6 font-medium bg-primary hover:bg-primary/90"
              >
                Start Free Trial
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg">
            <div className="container mx-auto py-4">
              <div className="space-y-3">
                 {navItems.map((item) => (
                   <button
                     key={item.name}
                     onClick={() => item.href.startsWith('#') && scrollToSection(item.href.slice(1))}
                     className={`block w-full text-left py-3 px-4 text-base font-medium transition-colors duration-200 rounded-lg ${
                       isActive(item.href)
                         ? 'bg-primary/10 text-primary border border-primary/20'
                         : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                     }`}
                   >
                     {item.name}
                   </button>
                 ))}
                <div className="pt-3 space-y-3">
                  <Button 
                    variant="ghost"
                    onClick={() => navigate('/auth')}
                    className="w-full text-base font-medium"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    variant="default"
                    className="w-full rounded-full h-11 text-base font-medium"
                  >
                    Start Free Trial
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}