"use client";

import React, { useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';
import { motion } from 'framer-motion';
import { tokens } from '@/styles/tokens';
import { Search, BarChart3, Edit3, Globe } from 'lucide-react';

const features = [
  {
    title: 'JD Decoder',
    description: 'Uncover hidden metrics and keywords that recruiters actually care about. Our engine extracts the 0.1% signals from any job posting.',
    icon: <Search className="w-8 h-8 text-lumina-teal" />,
  },
  {
    title: 'Gap Analysis',
    description: 'Real-time diagnostics comparing your profile against role requirements. Hard numbers, not vague advice.',
    icon: <BarChart3 className="w-8 h-8 text-lumina-teal" />,
  },
  {
    title: 'Resume Tailor',
    description: 'Precision-engineered rewrites for every bullet point. Optimized for both machine logic and human psychology.',
    icon: <Edit3 className="w-8 h-8 text-lumina-teal" />,
  },
  {
    title: 'Market Insights',
    description: 'Strategic calibration using live industry intelligence. Know your worth and your competition.',
    icon: <Globe className="w-8 h-8 text-lumina-teal" />,
  }
];

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard = ({ feature, index }: { feature: Feature, index: number }) => {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tiltRef.current;
    if (el) {
      VanillaTilt.init(el, {
        max: 8,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
      });
    }
    return () => {
      if (el && (el as { vanillaTilt?: { destroy: () => void } }).vanillaTilt) {
        (el as { vanillaTilt?: { destroy: () => void } }).vanillaTilt!.destroy();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      ref={tiltRef}
      className="group relative bg-white border border-border/10 border-t-4 border-t-lumina-teal rounded-[2.5rem] p-10 shadow-sm hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-6 h-full"
    >
      <div className="w-16 h-16 rounded-2xl bg-lumina-teal/10 flex items-center justify-center">
        {feature.icon}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl md:text-3xl font-display font-bold text-lumina-navy tracking-tight">{feature.title}</h3>
        <p className="text-lumina-navy/60 font-body leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

export const FeaturesGrid = () => {
  return (
    <section id="features" className="bg-background py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <span className="text-lumina-teal font-display font-bold text-xs uppercase tracking-[0.3em]">Total Intelligence Ecosystem</span>
          <h2 className="text-5xl md:text-7xl font-serif italic font-bold text-lumina-navy">Everything you need to <span className="text-lumina-teal">beat the system.</span></h2>
          <p className="text-lg md:text-xl text-lumina-navy/60 font-body">Not just keyword stuffing — real, strategic career intelligence built for the most ambitious engineers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
