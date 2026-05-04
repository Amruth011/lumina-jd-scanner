"use client";

import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "I applied to 40 jobs with a generic resume and got 0 callbacks. After Lumina, I got 3 interview calls in the first week. The JD Decoder is a cheat code.",
    name: "Alex Rivera",
    role: "Senior AI Engineer",
    company: "Scale AI"
  },
  {
    quote: "The Gap Analysis showed me exactly which skills I was missing for the role. I stopped guessing and started landing interviews at top-tier startups.",
    name: "Sarah Chen",
    role: "Machine Learning Lead",
    company: "Anthropic"
  },
  {
    quote: "Lumina decoded the JD and rewrote my resume bullets in 25 seconds. My recruiter said it was the strongest resume she'd seen in months.",
    name: "Marcus Thorne",
    role: "Fullstack Architect",
    company: "Vercel"
  },
  {
    quote: "The only tool that actually understands the technical depth required for Silicon Valley engineering roles. Zero fluff, pure intelligence.",
    name: "Elena Rodriguez",
    role: "Data Scientist",
    company: "OpenAI"
  }
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="bg-white py-32 overflow-hidden border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 mb-20 flex flex-col md:flex-row items-end justify-between gap-8">
        <div className="space-y-4">
          <span className="text-lumina-teal font-display font-bold text-xs uppercase tracking-[0.3em]">Success Stories</span>
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-lumina-navy">The <span className="italic text-lumina-teal">0.1% Speaks.</span></h2>
        </div>
        <p className="text-lumina-navy/40 font-body max-w-sm">
          Join 94,000+ elite engineers who stopped playing the numbers game and started winning.
        </p>
      </div>

      <div className="flex gap-8 px-6 md:px-[calc((100vw-1280px)/2)] overflow-x-auto no-scrollbar pb-12 cursor-grab active:cursor-grabbing">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10, rotateZ: 1 }}
            className="flex-shrink-0 w-80 md:w-[450px] bg-lumina-navy/5 backdrop-blur-xl border border-lumina-navy/10 rounded-[2.5rem] p-10 md:p-12 space-y-8 relative group transition-all hover:border-lumina-teal/30"
          >
            <div className="text-lumina-teal text-6xl font-serif opacity-20 absolute top-8 left-8 select-none">“</div>
            <p className="text-xl md:text-2xl font-serif italic text-lumina-navy/90 leading-relaxed relative z-10">
              {t.quote}
            </p>
            <div className="pt-4 border-t border-lumina-navy/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-lumina-teal/20 flex items-center justify-center font-bold text-lumina-teal">
                {t.name[0]}
              </div>
              <div>
                <p className="text-lumina-navy font-bold text-sm">{t.name}</p>
                <p className="text-lumina-navy/40 text-[10px] uppercase font-display tracking-widest">{t.role} @ {t.company}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
