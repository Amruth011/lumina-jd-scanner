"use client";

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import Hero3DCard from './Hero3DCard';
import { wordFadeIn } from '../../lib/animations';

export const Hero = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const headline = "The Career Intelligence Engine Built for the Top 0.1%";
  const words = headline.split(" ");

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-[#0D1520] overflow-hidden pt-20">
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
        {/* Headline */}
        <h1 className="text-5xl md:text-[96px] font-serif font-bold text-white leading-[1.1] tracking-tight max-w-5xl mx-auto">
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordFadeIn}
              initial="hidden"
              animate="visible"
              custom={i}
              className="inline-block mr-[0.2em]"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-lg md:text-2xl text-white/60 font-body max-w-2xl mx-auto leading-relaxed"
        >
          Decode any job description in seconds. Identify every gap. Build the resume that wins.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
        >
          <button className="px-10 py-5 bg-lumina-teal text-lumina-navy font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            Analyze My Resume Free →
          </button>
          <button className="px-10 py-5 border border-lumina-teal text-lumina-teal font-bold rounded-full transition-all hover:bg-lumina-teal/10 flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center rounded-full border border-current text-[10px]">▶</span>
            Watch 90s Demo
          </button>
        </motion.div>

        {/* Social Proof Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="pt-12 flex flex-wrap justify-center items-center gap-4 text-xs font-display text-white/40 tracking-widest uppercase"
        >
          <span>94,000 resumes analyzed</span>
          <div className="w-1.5 h-1.5 rounded-full bg-lumina-teal animate-pulse" />
          <span>3.2× avg interview rate</span>
          <div className="w-1.5 h-1.5 rounded-full bg-lumina-teal animate-pulse" />
          <span>Used by engineers at Google, Meta, Amazon</span>
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
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-[10px] font-display tracking-[0.2em] uppercase"
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
