import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Product', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Docs', href: '#' },
    { name: 'Contact', href: '#' }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
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
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-900 bg-clip-text text-transparent">
              DentaLeague
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => item.href.startsWith('#') && scrollToSection(item.href.slice(1))}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm px-2 py-1"
              >
                {item.name}
              </button>
            ))}
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
                className="rounded-full h-9 px-6 font-medium"
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
                    className="block w-full text-left py-3 px-4 text-base font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors duration-200 rounded-lg"
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