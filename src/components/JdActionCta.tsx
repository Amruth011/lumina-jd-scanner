import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Mail } from "lucide-react";

interface JdActionCtaProps {
  onCheckResume: () => void;
  onGenerateResume: () => void;
  onGenerateCoverLetter: () => void;
}

export const JdActionCta = ({ onCheckResume, onGenerateResume, onGenerateCoverLetter }: JdActionCtaProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full rounded-[3.5rem] overflow-hidden group"
    >
      {/* ── Background Logic ── */}
      <div className="absolute inset-0 bg-lumina-teal" />
      
      {/* ── Subtle Texture ── */}
      <div className="absolute inset-0 bg-black/5" />

      <div className="relative z-10 px-6 py-10 md:py-16 flex flex-col items-center text-center space-y-8">
        <div className="space-y-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/20"
          >
            <Sparkles size={12} className="text-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Strategic Next Step</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-serif italic text-white tracking-tight leading-tight">
            Ready to Dominate this Role?
          </h2>
          
          <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed px-4">
            Check your semantic match score or generate a world-class tailored resume in seconds.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCheckResume}
            className="group flex items-center gap-4 px-10 py-4 rounded-full bg-white text-lumina-teal text-[12px] font-black uppercase tracking-widest shadow-2xl transition-all"
          >
            Check Your Resume 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerateResume}
            className="group flex items-center gap-4 px-10 py-4 rounded-full bg-lumina-teal border-2 border-white text-white text-[12px] font-black uppercase tracking-widest hover:bg-white hover:text-lumina-teal transition-all"
          >
            Tailor My Resume
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerateCoverLetter}
            className="group flex items-center gap-4 px-10 py-4 rounded-full bg-slate-950 border-2 border-white/10 text-white text-[12px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
          >
            Synthesize Cover Letter
            <Mail size={16} className="group-hover:scale-110 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
