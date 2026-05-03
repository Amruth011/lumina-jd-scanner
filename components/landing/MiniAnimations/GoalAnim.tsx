"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const GoalAnim = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white/5 rounded-lg border border-white/10 overflow-hidden relative">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.5 }}
        className="text-6xl mb-4 relative z-10"
      >
        🏆
      </motion.div>
      <div className="bg-emerald-500 text-slate-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10">
        TOP 0.1%
      </div>
      <div className="font-serif text-xl text-white relative z-10 text-center">
        Interview Cracked
      </div>
      
      {/* Sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1.5, 0],
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
          style={{ top: '50%', left: '50%' }}
        />
      ))}
    </div>
  );
};

export default GoalAnim;
