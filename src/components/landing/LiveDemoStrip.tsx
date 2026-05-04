"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const skills = ["RAG", "Vector DBs", "LLM Fine-tuning", "FastAPI", "Next.js", "Redis"];

export const LiveDemoStrip = () => {
  const [displayText, setDisplayText] = useState("");
  const fullText = "Seeking a Senior AI Engineer to build scalable RAG architectures using Llama-3 and Pinecone...";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-lumina-bg py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-lumina-navy text-center">See It In <span className="text-lumina-teal">10 Seconds.</span></h2>
        
        <div className="bg-lumina-navy rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Input */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-white/20 font-mono ml-2">decoder_input.sh</span>
            </div>
            <div className="bg-white/5 border border-lumina-teal/30 rounded-2xl p-6 h-64 font-mono text-sm text-white/80 focus-within:border-lumina-teal transition-all">
              <p className="leading-relaxed whitespace-pre-wrap">
                {displayText}
                <span className="w-2 h-4 bg-lumina-teal inline-block ml-1 animate-pulse" />
              </p>
            </div>
            <p className="text-white/40 text-xs italic">↑ Paste any job description to decode hidden intent.</p>
          </div>

          {/* Right: Output */}
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8">
                <div className="relative w-24 h-24 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                      <motion.circle 
                        cx="48" cy="48" r="40" stroke="#10B981" strokeWidth="6" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 40}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: (1 - 0.94) * 2 * Math.PI * 40 }}
                        transition={{ duration: 2, delay: 2 }}
                      />
                   </svg>
                   <span className="absolute text-2xl font-display font-bold text-lumina-teal">94</span>
                </div>
                <p className="text-center text-[10px] text-white/40 font-display mt-2 uppercase tracking-widest">Match Score</p>
             </div>

             <div className="space-y-6">
                <div>
                   <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-4">Skills Required</p>
                   <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <motion.span 
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="px-3 py-1 bg-lumina-teal text-lumina-navy rounded-full text-xs font-bold"
                        >
                          {skill}
                        </motion.span>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">ATS Keywords Identified</p>
                   <div className="space-y-2">
                      {["RAG Architecture", "Performance Optimization", "Pythonic Scales"].map((keyword, i) => (
                        <motion.div 
                          key={i}
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 2 + i * 0.5, duration: 1 }}
                          className="h-6 bg-lumina-teal/20 rounded border-l-2 border-lumina-teal flex items-center px-3"
                        >
                          <span className="text-[10px] text-lumina-teal font-mono uppercase">{keyword}</span>
                        </motion.div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link to="/dashboard">
            <button className="px-10 py-5 bg-lumina-teal text-lumina-navy font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_30_rgba(16,185,129,0.3)]">
              Get your full analysis free →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LiveDemoStrip;
