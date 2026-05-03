"use client";

import React, { useEffect, useState } from 'react';

export const ResumeTailorAnim = () => {
  const [score, setScore] = useState(42);

  useEffect(() => {
    const current = 42;
    const target = 94;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const val = Math.floor(current + progress * (target - current));
      setScore(val);
      if (progress < 1) requestAnimationFrame(animate);
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white/5 rounded-lg border border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full scale-50" />
      <div className="text-6xl font-serif text-emerald-500 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
        {score}
      </div>
      <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 mt-2 relative z-10">
        ATS Score
      </div>
    </div>
  );
};

export default ResumeTailorAnim;
