"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { tokens } from '@/styles/tokens';
import { LuminaLogo } from '../LuminaLogo';

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
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95%] max-w-5xl mx-auto rounded-full ${
      isScrolled ? 'py-2 bg-white/70 backdrop-blur-md border border-lumina-teal/20 shadow-lg' : 'py-3 bg-white/10 backdrop-blur-sm border border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <LuminaLogo size={120} />
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
        <Link to="/dashboard">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-lumina-teal text-lumina-navy font-bold rounded-full text-sm transition-all"
          >
            Start Free
          </motion.button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
