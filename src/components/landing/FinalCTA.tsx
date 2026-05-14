"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export const FinalCTA = () => {
  return (
    <section className="relative bg-background py-32 md:py-44 px-6 overflow-hidden border-t border-border/8">
      {/* Subtle teal ambient orbs on white bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-lumina-teal/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-lumina-teal/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-lumina-teal/4 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lumina-teal/10 border border-lumina-teal/20 text-[10px] font-display font-bold text-lumina-teal uppercase tracking-[0.2em]"
        >
          <Sparkles className="w-3 h-3" />
          Intelligence Engine Ready
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-[100px] font-serif font-bold text-lumina-navy leading-tight tracking-tight"
        >
          Your Next Offer <br />
          <span className="italic text-lumina-teal">Starts Here.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-lumina-navy/50 font-body max-w-2xl mx-auto leading-relaxed"
        >
          Join 94,000+ strategists who stopped guessing and started winning.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-12 py-5 bg-lumina-teal text-white font-bold text-lg rounded-full shadow-[0_20px_50px_rgba(16,185,129,0.25)] transition-all overflow-hidden"
            >
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shimmer" />
              <span className="relative z-10 flex items-center gap-2">
                Land in the Top 0.1% <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>
        </motion.div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-4 md:gap-10 text-[10px] font-display font-bold uppercase tracking-[0.2em] md:tracking-[0.35em] text-lumina-navy/25">
          <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Secure Process</span>
          <div className="hidden md:block w-1 h-1 rounded-full bg-lumina-teal/40" />
          <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> Llama-3.3 Intelligence</span>
          <div className="hidden md:block w-1 h-1 rounded-full bg-lumina-teal/40" />
          <span>ATS Certified</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
