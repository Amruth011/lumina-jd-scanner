import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Zap } from "lucide-react";

interface ATSScoreWidgetProps {
  score: number;
  previousScore?: number | null;
}

export const ATSScoreWidget = ({ score, previousScore }: ATSScoreWidgetProps) => {
  const improvement = previousScore ? score - previousScore : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-[2.5rem] border border-[#1E2A3A]/5 shadow-[0_40px_100px_-20px_rgba(16,185,129,0.15)] flex flex-col items-center text-center space-y-6"
    >
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-[#1E2A3A]/5"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray="552.9"
            initial={{ strokeDashoffset: 552.9 }}
            animate={{ strokeDashoffset: 552.9 * (1 - score / 100) }}
            transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
            className="text-[#10B981]"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-6xl font-serif font-bold text-[#1E2A3A]"
          >
            {score}%
          </motion.span>
          <span className="text-[10px] font-display font-bold text-[#1E2A3A]/40 uppercase tracking-[0.2em]">Match Quality</span>
        </div>

        {/* Outer Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-[#10B981]/10 blur-3xl -z-10 animate-pulse" />
      </div>

      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between px-4 py-3 bg-[#10B981]/5 rounded-2xl border border-[#10B981]/10">
          <div className="flex items-center gap-2 text-[#10B981]">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px] font-display font-bold uppercase tracking-widest">ATS Compatibility</span>
          </div>
          <span className="text-sm font-display font-bold text-[#1E2A3A]">
            {score > 85 ? "Elite" : score > 70 ? "Strong" : "Requires Polish"}
          </span>
        </div>

        {improvement > 0 && (
          <div className="flex items-center gap-2 text-[#10B981] justify-center">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-body font-bold">+{improvement}% improvement from previous scan</span>
          </div>
        )}
      </div>

      <p className="text-xs text-[#1E2A3A]/40 font-body leading-relaxed max-w-[200px]">
        This score reflects keywords, formatting, and semantic alignment with the JD.
      </p>
    </motion.div>
  );
};
