import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ModernNavigation() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['hero', 'features', 'how-it-works', 'testimonials', 'pricing'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Impact', href: '#impact' },
    { name: 'Pricing', href: '#pricing' }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id.replace('#', ''));
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass-nav py-4' 
        : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <AnimatedLogo size={40} />
            <div className="font-display font-bold text-lg">DentaLeague</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === item.href.replace('#', '') 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-sm font-medium"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
            >
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 pb-6 border-t border-border/20">
            <div className="flex flex-col gap-4 pt-6">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className={`text-left font-medium transition-colors hover:text-primary ${
                    activeSection === item.href.replace('#', '') 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              <div className="flex flex-col gap-3 pt-4 border-t border-border/20">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth')}
                  className="justify-start"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}