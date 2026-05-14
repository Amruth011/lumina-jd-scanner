import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { LuminaLogo } from "../LuminaLogo";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features",     href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing",      href: "#pricing" },
    { name: "Sign In",      href: "/auth" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 w-full pointer-events-none">
      <div
        className={`h-[52px] rounded-full max-w-5xl mx-auto px-2 flex items-center justify-between pointer-events-auto relative overflow-hidden transition-all duration-300 ${
          isScrolled
            ? "shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
            : "shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
        }`}
      >
        {/* White pill backdrop — matches GlobalNavbar exactly */}
        <div className="absolute inset-0 rounded-full bg-white border border-border/10 -z-10" />

        {/* Logo */}
        <Link to="/" className="flex items-center pl-4 group transition-transform hover:scale-105">
          <LuminaLogo size={120} className="object-contain" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-border/10 shadow-inner">
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.name}
                href={link.href}
                className="px-5 py-2 rounded-full text-[12px] font-display font-bold text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 whitespace-nowrap"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className="px-5 py-2 rounded-full text-[12px] font-display font-bold text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 whitespace-nowrap"
              >
                {link.name}
              </Link>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block pr-1">
          <Link to="/auth">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative rounded-full px-7 py-2.5 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest transition-all overflow-hidden shadow-sm"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Get Started <ArrowRight className="w-3 h-3" />
              </span>
              <div className="absolute inset-0 bg-lumina-teal-dark translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden mr-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-white pointer-events-auto md:hidden"
          >
            <div className="flex flex-col h-full p-8 pt-24 gap-6">
              {navLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-serif font-bold text-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                )
              )}
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full text-center text-lg"
              >
                Get Started →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
