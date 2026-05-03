"use client";

import React from 'react';

const logos = [
  "Google", "Amazon", "McKinsey", "Deloitte", "Meta", "OpenAI",
  "Google", "Amazon", "McKinsey", "Deloitte", "Meta", "OpenAI" // Double for seamless loop
];

export const SocialProofBar = () => {
  return (
    <section className="bg-lumina-navy py-12 overflow-hidden border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-sm font-body text-white/40 tracking-wider">
          Trusted by professionals at <span className="text-lumina-teal">top-tier companies</span>
        </p>
      </div>

      <div className="flex relative">
        <div className="flex animate-marquee whitespace-nowrap gap-16 md:gap-32 items-center">
          {logos.map((logo, i) => (
            <span 
              key={i} 
              className="text-2xl md:text-4xl font-serif font-black text-white/20 hover:text-white/40 transition-colors cursor-default"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
