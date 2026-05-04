"use client";

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import Hero3DCard from './Hero3DCard';
import { wordFadeIn } from '@/lib/animations';

const MagneticButton = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.15, y: y * 0.15 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

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
        <h1 className="text-6xl md:text-[110px] font-serif italic font-bold text-lumina-navy leading-[0.95] tracking-tight max-w-5xl mx-auto">
          Land in the <span className="text-lumina-teal">top 0.1%</span>
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
          className="flex flex-col items-center gap-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/dashboard">
              <MagneticButton>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-9 py-4 bg-[#10B981] text-[#1E2A3A] font-semibold font-body rounded-full text-lg shadow-[0_20px_50px_rgba(16,185,129,0.2)] transition-all flex items-center gap-2 group"
                >
                  Analyze My Resume Free <span className="group-hover:translate-x-1 transition-transform">→</span>
                </motion.button>
              </MagneticButton>
            </Link>
            <button className="px-9 py-4 border-1.5 border-[#10B981] text-[#10B981] font-semibold font-body rounded-full text-lg flex items-center gap-2 hover:bg-[#10B981]/5 transition-all">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch 90s Demo
            </button>
          </div>

          {/* Social Proof Microtext */}
          <div className="flex flex-col items-center gap-4">
            <p className="font-display text-[11px] md:text-[13px] text-[#1E2A3A]/40 flex flex-col md:flex-row items-center gap-2 md:gap-3">
              <span className="whitespace-nowrap">94,000+ resumes analyzed</span>
              <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-[#10B981] animate-logo-pulse" />
              <span className="whitespace-nowrap">3.2× avg interview rate</span>
              <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-[#10B981] animate-logo-pulse" />
              <span className="whitespace-nowrap">Used at Google, Meta, Amazon</span>
            </p>
          </div>
        </motion.div>

        {/* Dashboard Preview space removed for cleaner look */}
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
