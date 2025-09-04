import { AnimatedLogo } from '@/components/ui/animated-logo';

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Overview", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Docs", href: "#" },
        { name: "Changelog", href: "#" }
      ]
    },
    {
      title: "Company", 
      links: [
        { name: "About", href: "#" },
        { name: "Contact", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Terms", href: "#" },
        { name: "Privacy", href: "#" },
        { name: "BAA Info", href: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <AnimatedLogo size={24} animated={false} className="text-primary" />
              <span className="text-base font-semibold bg-gradient-to-r from-blue-800 to-blue-900 bg-clip-text text-transparent">
                DentaLeague
              </span>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground leading-[1.125rem]">
              <div className="font-medium text-foreground">HIPAA-aware, security-first</div>
              <div>Modern dental practice management</div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => {
                        if (link.href.startsWith('#')) {
                          document.getElementById(link.href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 leading-[1.125rem]"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-xs text-muted-foreground leading-[1.125rem]">
            © {new Date().getFullYear()} DentaLeague. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}