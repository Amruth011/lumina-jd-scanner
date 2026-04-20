import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface JdActionCtaProps {
  onCheckResume: () => void;
  onGenerateResume: () => void;
}

export const JdActionCta = ({ onCheckResume, onGenerateResume }: JdActionCtaProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full rounded-[3.5rem] overflow-hidden group"
    >
      {/* ── Background Logic ── */}
      <div className="absolute inset-0 bg-[#3b82f6] transition-transform duration-1000 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/50 via-transparent to-blue-400/30" />
      
      {/* ── Animated Orbs ── */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[140%] bg-white/10 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[140%] bg-blue-400/20 blur-[100px] rounded-full" />

      <div className="relative z-10 px-6 py-6 md:py-10 flex flex-col items-center text-center space-y-6">
        <div className="space-y-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md"
          >
            <Sparkles size={12} className="text-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Next Strategic Step</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-serif italic text-white tracking-tight leading-tight">
            Found a Role That Looks Good?
          </h2>
          
          <p className="text-white/90 text-[12px] md:text-sm max-w-xl mx-auto font-medium leading-relaxed px-4">
            Check if your professional profile matches these requirements or jump straight to generating a high-impact tailored resume.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCheckResume}
            className="group flex items-center gap-4 px-8 py-3 rounded-full bg-white text-blue-600 text-[11px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] transition-all"
          >
            Check Your Resume 
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGenerateResume}
            className="group flex items-center gap-4 px-8 py-3 rounded-full bg-white/10 border border-white/30 text-white text-[11px] font-black uppercase tracking-widest backdrop-blur-md hover:bg-white/20 transition-all"
          >
            Generate Your Resume 
            <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
