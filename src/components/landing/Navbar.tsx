"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../../styles/tokens';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-4 bg-white/70 backdrop-blur-md border-b border-lumina-teal/20' : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-1">
          <span className="text-2xl font-serif font-bold text-lumina-navy">Lumina</span>
          <div className="w-2 h-2 rounded-full bg-lumina-teal shadow-[0_0_8px_#10B981]" />
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it Works', 'Pricing', 'Testimonials'].map((link) => (
            <a 
              key={link} 
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-lumina-navy/70 hover:text-lumina-teal transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 bg-lumina-teal text-lumina-navy font-bold rounded-full text-sm transition-all"
        >
          Start Free
        </motion.button>
      </div>
    </nav>
  );
};

export default Navbar;
