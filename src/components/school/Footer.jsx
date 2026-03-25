const quickLinks = [
  { title: "Quick Links", links: ["About Us", "Academics", "Admissions", "Faculty"] },
  { title: "Resources", links: ["Student Portal", "Parent Portal", "Library", "Calendar"] },
  { title: "Connect", links: ["Contact Us", "Careers", "Alumni", "Donate"] },
];

const Footer = () => {
  return (
    <footer className="bg-surface/60 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-display font-bold text-gradient-gold mb-4">Aethelgard Academy</h3>
            <p className="text-text-muted font-body text-sm mb-6 max-w-xs">
              Shaping tomorrow's leaders through excellence, innovation, and integrity since 1998.
            </p>
            <div className="flex gap-3">
              {["𝕏", "f", "in", "▶"].map((icon, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-muted hover:text-gold hover:border-gold/30 transition-all text-sm font-bold"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {quickLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-text-muted font-body text-sm hover:text-gold transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Your email for newsletter"
              className="bg-transparent border border-border/50 rounded-lg px-4 py-2 text-foreground font-body text-sm focus:outline-none focus:border-gold flex-1 sm:w-64"
            />
            <button className="btn-gold py-2 px-6 text-sm">Subscribe</button>
          </div>
        </div>
      </div>

      <div className="border-t border-border/20 py-4 text-center">
        <p className="text-text-muted font-body text-xs">
          © 2026 Aethelgard Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
