import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = ["Home", "About", "Academics", "Admissions", "Faculty", "Gallery", "News", "Contact"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 glass-strong">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-gradient-gold">Aethelgard</span>
            <span className="text-sm font-body text-text-muted hidden sm:inline">Academy</span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-body text-text-muted hover:text-gold transition-colors duration-300"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden lg:block btn-gold text-sm py-2 px-6">Login</button>
            <button
              className="lg:hidden text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            <button
              className="absolute top-6 right-6 text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <X size={28} />
            </button>
            <div className="flex flex-col items-center gap-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-2xl font-display text-foreground hover:text-gold transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </motion.a>
              ))}
              <button className="btn-gold mt-4">Login</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
