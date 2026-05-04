"use client";

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import Hero3DCard from './Hero3DCard';
import { wordFadeIn } from '@/lib/animations';

export const Hero = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const headline = "The Career Intelligence Engine Built for the Top 0.1%";
  const words = headline.split(" ");

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#F9FAFB] overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
      {/* Background Particles */}
      {/* Background Particles - temporarily disabled for troubleshooting */}
      {/* <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { opacity: 0 },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" },
              resize: { enable: true },
            },
            modes: {
              grab: { distance: 140, links: { opacity: 0.5 } },
            },
          },
          particles: {
            color: { value: "#10B981" },
            links: {
              color: "#10B981",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: { default: "bounce" },
              random: false,
              speed: 1,
              straight: false,
            },
            number: { density: { enable: true }, value: 80 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      /> */}

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-10">
        {/* Signal Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-lumina-teal/20 text-[10px] font-display font-bold text-lumina-teal uppercase tracking-[0.2em] shadow-sm mb-4"
        >
          <div className="w-2 h-2 rounded-full bg-lumina-teal animate-pulse" />
          V3.0 Signal Live
        </motion.div>

        {/* Headline */}
        <h1 className="text-6xl md:text-[110px] font-serif font-bold text-lumina-navy leading-[0.95] tracking-tight max-w-4xl mx-auto">
          Land in the <span className="italic text-lumina-teal">top 0.1%</span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-lg md:text-2xl text-lumina-navy/60 font-body max-w-3xl mx-auto leading-relaxed"
        >
          Paste a job description. Upload your resume. Get your exact match score, skill gaps, and a winning playbook — in seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
        >
          <button className="px-12 py-5 bg-lumina-navy text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3 group">
            DEPLOY ENGINE 
            <span className="text-lumina-teal group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button className="px-12 py-5 bg-white border border-lumina-navy/10 text-lumina-navy font-bold rounded-full transition-all hover:bg-lumina-navy/5 shadow-sm">
            TRY WITH SAMPLE RESUME
          </button>
        </motion.div>

        {/* Social Proof Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="pt-10 space-y-8"
        >
          <div className="flex items-center justify-center -space-x-3 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-lumina-navy/10 flex items-center justify-center overflow-hidden">
                <div className={`w-full h-full bg-gradient-to-br ${i === 1 ? 'from-lumina-navy to-lumina-teal' : i === 2 ? 'from-lumina-teal to-lumina-navy' : 'from-blue-500 to-teal-400'}`} />
              </div>
            ))}
            <div className="pl-6 text-sm font-body font-bold text-lumina-navy">
              <span className="text-lumina-navy">1,240+ Scientists</span> <span className="text-lumina-navy/40 font-medium">already deployed</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[10px] font-display font-bold text-lumina-navy/30 tracking-[0.15em] uppercase">
            <div className="flex items-center gap-2">
              <span className="text-lumina-teal">✓</span> NO DATA SOLD
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lumina-teal">✓</span> ~25S RESULTS
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lumina-teal">✓</span> FREE TO START
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lumina-teal">✓</span> 0.1% CAREER OUTCOMES
            </div>
          </div>
        </motion.div>

        {/* 3D Dashboard Preview */}
        <div className="pt-20">
          <Hero3DCard />
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#1E2A3A]/30 text-[10px] font-display tracking-[0.2em] uppercase"
      >
        <span>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lumina-teal text-xl"
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
