"use client";

import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const StatCard = ({ value, suffix, label, prefix = "" }: { value: number, suffix: string, label: string, prefix?: string }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-lumina-teal/5 flex flex-col gap-2"
    >
      <div className="text-5xl md:text-6xl font-serif font-bold text-lumina-teal">
        {inView ? (
          <>
            {prefix}
            <CountUp end={value} duration={2.5} />
            {suffix}
          </>
        ) : "0"}
      </div>
      <p className="text-sm font-display font-bold text-lumina-navy uppercase tracking-widest">{label}</p>
    </motion.div>
  );
};

export const ProblemSection = () => {
  return (
    <section className="bg-lumina-bg py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column: Stats */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-lumina-navy leading-tight mb-8">
              The ATS Black Hole <br /> <span className="italic text-lumina-teal">Is Real.</span>
            </h2>
          </div>
          <StatCard value={75} suffix="%" label="resumes never seen by humans" />
          <StatCard value={6} suffix=" seconds" label="avg recruiter scan time" />
          <StatCard value={3} suffix="× harder" label="without ATS optimization" />
          <div className="bg-lumina-teal p-8 rounded-[2.5rem] flex items-center justify-center text-center">
            <p className="text-lumina-navy font-bold text-lg font-body">Don't leave your career to a machine's flip of a coin.</p>
          </div>
        </div>

        {/* Right Column: Copy */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-2xl md:text-3xl font-body font-medium text-lumina-navy leading-relaxed">
              You spent 3 hours on that resume. It took 3 seconds for the ATS to reject it. 
            </p>
            <p className="text-lg md:text-xl text-lumina-navy/60 leading-relaxed italic">
              Not because you're unqualified — because your resume didn't speak the machine's language. 
            </p>
            <div className="h-px w-20 bg-lumina-teal" />
            <p className="text-3xl md:text-4xl font-serif font-bold text-lumina-navy">
              Lumina does.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
