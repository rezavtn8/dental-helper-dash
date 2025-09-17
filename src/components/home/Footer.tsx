import { AnimatedLogo } from '@/components/ui/animated-logo';
export function Footer() {
  const footerSections = [{
    title: "Product",
    links: [{
      name: "Overview",
      href: "#features"
    }, {
      name: "Pricing",
      href: "#pricing"
    }, {
      name: "Docs",
      href: "#"
    }, {
      name: "Changelog",
      href: "#"
    }]
  }, {
    title: "Company",
    links: [{
      name: "About",
      href: "#"
    }, {
      name: "Contact",
      href: "#"
    }]
  }, {
    title: "Legal",
    links: [{
      name: "Terms",
      href: "#"
    }, {
      name: "Privacy",
      href: "#"
    }, {
      name: "BAA Info",
      href: "#"
    }]
  }];
  return <footer className="bg-slate-50/50 border-t border-slate-200/60">
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <AnimatedLogo size={28} animated={false} className="text-blue-600" />
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  DentaLeague
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">dental teamwork, simplified</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
              <p>Modern dental practice management made simple and efficient.</p>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map(section => <div key={section.title} className="space-y-4">
              <h4 className="font-display text-sm font-bold text-slate-900">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map(link => <li key={link.name}>
                    <button onClick={() => {
                if (link.href.startsWith('#')) {
                  document.getElementById(link.href.slice(1))?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }
              }} className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium">
                      {link.name}
                    </button>
                  </li>)}
              </ul>
            </div>)}
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-200 mt-12 pt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} DentaLeague. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
}