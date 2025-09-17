import { AnimatedLogo } from '@/components/ui/animated-logo';

export function ModernFooter() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'How it Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Security', href: '#security' }
      ]
    },
    {
      title: 'Company', 
      links: [
        { name: 'About', href: '#about' },
        { name: 'Blog', href: '#blog' },
        { name: 'Careers', href: '#careers' },
        { name: 'Contact', href: '#contact' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#help' },
        { name: 'API Docs', href: '#docs' },
        { name: 'Status', href: '#status' },
        { name: 'Roadmap', href: '#roadmap' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
        { name: 'HIPAA Compliance', href: '#hipaa' },
        { name: 'Cookie Policy', href: '#cookies' }
      ]
    }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id.replace('#', ''));
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-background border-t border-border/50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <AnimatedLogo size={48} />
              <div>
                <div className="font-display text-xl font-bold">DentaLeague</div>
                <div className="text-sm text-muted-foreground">Dental teamwork, simplified</div>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Empowering dental practices with intelligent task management, seamless team collaboration, and beautiful interfaces that just work.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                HIPAA Compliant
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="text-sm text-muted-foreground">
                SOC 2 Type II
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="text-sm text-muted-foreground">
                99.9% Uptime
              </div>
            </div>
          </div>

          {/* Footer links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-display font-semibold">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DentaLeague. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Made with ❤️ for dental teams</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}