"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const FinalCTA = () => {
  return (
    <section className="relative bg-lumina-navy py-32 md:py-48 px-6 overflow-hidden">
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-lumina-teal/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-lumina-teal/10 rounded-full blur-[100px]" 
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
        <h2 className="text-6xl md:text-[100px] font-serif font-bold text-white leading-tight tracking-tight">
          Your Next Offer <br /> <span className="italic text-lumina-teal">Starts Here.</span>
        </h2>
        
        <p className="text-xl md:text-2xl text-white/60 font-body max-w-2xl mx-auto leading-relaxed">
          Join 94,000+ strategists who stopped guessing and started winning. The intelligence engine is ready.
        </p>

        <div className="pt-8">
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-12 py-6 bg-lumina-teal text-lumina-navy font-bold text-lg rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all overflow-hidden"
            >
              {/* Shimmer sweep */}
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-shimmer" />
              <span className="relative z-10">Land in the Top 0.1% →</span>
            </motion.button>
          </Link>
        </div>

        <div className="pt-12 flex items-center justify-center gap-8 text-[10px] font-display font-bold uppercase tracking-[0.4em] text-white/20">
          <span>Secure Process</span>
          <div className="w-1.5 h-1.5 rounded-full bg-lumina-teal/40" />
          <span>LLAMA-3.3 Intelligence</span>
          <div className="w-1.5 h-1.5 rounded-full bg-lumina-teal/40" />
          <span>ATS Certified</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
