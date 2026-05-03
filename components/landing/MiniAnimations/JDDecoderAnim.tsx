"use client";

import React, { useState, useEffect } from 'react';

const words = ["React", "TypeScript", "ATS-optimized", "Leadership", "Node.js"];

export const JDDecoderAnim = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % words.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col justify-center gap-2 font-mono text-xs p-4 bg-white/5 rounded-lg border border-white/10">
      {words.map((word, i) => (
        <div 
          key={i} 
          className={`px-2 py-1 rounded transition-colors duration-200 ${
            i === activeIndex ? 'bg-emerald-500 text-slate-900' : 'bg-transparent text-white/40'
          }`}
        >
          {word}
        </div>
      ))}
    </div>
  );
};

export default JDDecoderAnim;
