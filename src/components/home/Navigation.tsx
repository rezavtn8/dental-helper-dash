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
      const sections = ['platform', 'for-owners', 'for-staff', 'pricing'];
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
    {
      name: 'Platform',
      href: '#platform',
      description: 'See what DentaLeague can do'
    },
    {
      name: 'For Owners',
      href: '#for-owners',
      description: 'Train and manage your team'
    },
    {
      name: 'For Staff',
      href: '#for-staff',
      description: 'Learn and grow your skills'
    },
    {
      name: 'Pricing',
      href: '/pricing',
      description: 'Simple, transparent pricing'
    }
  ];
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
                  className={`text-sm font-medium transition-all duration-200 relative group ${
                    isActive(item.href) 
                      ? 'text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${
                    isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/signin')} 
                size="sm"
                className="font-medium"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/signup/owner')} 
                size="sm"
                className="font-medium"
              >
                Get Started
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
          <div className="md:hidden border-t border-border py-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map(item => (
                <button 
                  key={item.name} 
                  onClick={() => handleNavClick(item.href)} 
                  className={`text-left py-3 px-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href) 
                      ? 'bg-primary/10 text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                </button>
              ))}
              <div className="pt-3 mt-3 border-t border-border flex flex-col gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/signin')} 
                  className="w-full justify-start font-medium"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/signup/owner')} 
                  size="sm"
                  className="w-full font-medium"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>;
}