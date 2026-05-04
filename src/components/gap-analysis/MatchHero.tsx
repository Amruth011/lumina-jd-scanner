import React from "react";
import { motion } from "framer-motion";
import { Target, Zap, ShieldCheck, AlertCircle } from "lucide-react";

interface MatchHeroProps {
  score: number;
  summary: string;
}

export const MatchHero = ({ score, summary }: MatchHeroProps) => {
  const getStatus = () => {
    if (score >= 90) return { label: "Elite Match", color: "text-[#10B981]", bg: "bg-[#10B981]/10" };
    if (score >= 75) return { label: "Strong Alignment", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { label: "Needs Optimization", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const status = getStatus();

  return (
    <div className="relative overflow-hidden bg-[#1E2A3A] rounded-[3rem] p-12 text-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/10 blur-[100px] -mr-48 -mt-48 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] -ml-32 -mb-32 rounded-full" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-6">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-white/5"
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
                transition={{ duration: 2, ease: "circOut" }}
                className="text-[#10B981]"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-serif font-bold">{score}%</span>
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/40">Compatibility</span>
            </div>
          </div>
          
          <div className={`px-4 py-1.5 rounded-full ${status.bg} ${status.color} text-[10px] font-display font-bold uppercase tracking-widest border border-current/20`}>
            {status.label}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#10B981]">
              <Target className="w-5 h-5" />
              <span className="text-xs font-display font-bold uppercase tracking-widest">Semantic Verdict</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
              {score >= 90 ? "You're in the top 1% of applicants for this role." : "Your profile shows strong potential with some critical gaps."}
            </h3>
            <p className="text-lg text-white/60 font-body leading-relaxed italic">
              "{summary}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[#10B981]">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-display font-bold uppercase tracking-widest">Advantage</span>
              </div>
              <p className="text-xs text-white/80 font-body">Strong technical stack alignment.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-display font-bold uppercase tracking-widest">Critical Gap</span>
              </div>
              <p className="text-xs text-white/80 font-body">Missing leadership metrics.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-display font-bold uppercase tracking-widest">ATS Status</span>
              </div>
              <p className="text-xs text-white/80 font-body">Safe for automatic screening.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
