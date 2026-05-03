"use client";

import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const stats = [
  { value: 94000, suffix: "+", label: "Resumes Analyzed" },
  { value: 3.2, suffix: "×", label: "Higher Interview Rate", decimals: 1 },
  { value: 4, suffix: " min", label: "Avg Time to Optimize" },
  { value: 1, suffix: "", prefix: "#", label: "Rated ATS Tool" }
];

export const StatsSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  return (
    <section ref={ref} className="bg-lumina-teal py-24 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
        {stats.map((stat, i) => (
          <div key={i} className="text-center space-y-2 lg:border-r last:border-0 border-lumina-navy/10 px-4">
            <div className="text-5xl md:text-8xl font-serif font-bold text-lumina-navy">
              {inView ? (
                <>
                  {stat.prefix}
                  <CountUp end={stat.value} decimals={stat.decimals || 0} duration={3} />
                  {stat.suffix}
                </>
              ) : "0"}
            </div>
            <p className="text-xs md:text-sm font-body font-bold text-lumina-navy/60 uppercase tracking-widest">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
