import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { LuminaLogo } from "../LuminaLogo";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Sign In", href: "/auth" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-md border-b border-[#10B981]/30 py-3"
          : "bg-white/5 backdrop-blur-sm py-3 md:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <LuminaLogo size={120} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-logo-pulse" />
        </Link>

        {/* Center: Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[14px] font-body font-medium text-[#1E2A3A]/70 hover:text-[#10B981] transition-all duration-300"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right: CTA */}
        <div className="hidden md:block">
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-[#10B981] text-[#1E2A3A] font-bold rounded-full text-sm flex items-center gap-2 transition-all shadow-lg"
            >
              Start Free <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[#1E2A3A]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-0 left-0 bottom-0 z-40 bg-white md:hidden"
          >
            <div className="flex flex-col h-full p-8 pt-24 gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif font-bold text-[#1E2A3A]"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 px-8 py-4 bg-[#10B981] text-[#1E2A3A] font-bold rounded-full text-center text-lg"
              >
                Start Free →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
