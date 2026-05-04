import React from "react";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Search, BarChart3, Edit3, Globe } from "lucide-react";

export const ProductPreview = () => {
  const keywords = ["React", "TypeScript", "Node.js", "ATS Optimization", "Leadership"];

  return (
    <section className="bg-[#F4F5F7] py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <p className="font-display text-[14px] font-bold text-[#1E2A3A]/40 uppercase tracking-[0.15em]">
            See Lumina in action
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-6xl mx-auto rounded-[2rem] border border-[#1E2A3A]/10 bg-white shadow-[0_50px_100px_-20px_rgba(16,185,129,0.15)] overflow-hidden"
        >
          {/* Dashboard Header Mock */}
          <div className="h-16 border-b border-[#1E2A3A]/5 bg-white/50 backdrop-blur-md flex items-center px-8 justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="px-4 py-1 rounded-full bg-[#1E2A3A]/5 text-[11px] font-mono text-[#1E2A3A]/40">
              lumina.app/dashboard/decoder
            </div>
            <div className="w-12 h-8 rounded-lg bg-[#1E2A3A]/5" />
          </div>

          <div className="flex h-[600px]">
            {/* Sidebar Mock */}
            <div className="w-64 border-r border-[#1E2A3A]/5 p-6 space-y-8 hidden md:block">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#10B981]/10 text-[#10B981]">
                  <Search className="w-5 h-5" />
                  <span className="font-display font-bold text-sm">JD Decoder</span>
                  <Check className="w-4 h-4 ml-auto" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl text-[#1E2A3A]/60">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-display font-bold text-sm">Gap Analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl text-[#1E2A3A]/60">
                  <Edit3 className="w-5 h-5" />
                  <span className="font-display font-bold text-sm">Resume Tailor</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl text-[#1E2A3A]/60">
                  <Globe className="w-5 h-5" />
                  <span className="font-display font-bold text-sm">Market Insights</span>
                </div>
              </div>
            </div>

            {/* Main Content Mock */}
            <div className="flex-1 p-10 space-y-10 overflow-y-auto">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-3xl font-serif font-bold text-[#1E2A3A]">Senior React Engineer</h3>
                  <p className="text-[#1E2A3A]/40 font-body">Meta · Menlo Park, CA (Remote)</p>
                </div>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-[#1E2A3A]/5"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="364.4"
                      initial={{ strokeDashoffset: 364.4 }}
                      whileInView={{ strokeDashoffset: 364.4 * (1 - 0.87) }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                      className="text-[#10B981]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-serif font-bold text-[#10B981]">87%</span>
                    <span className="text-[9px] font-display font-bold text-[#1E2A3A]/40 uppercase tracking-widest">Match Score</span>
                  </div>
                </div>
              </div>

              {/* Keywords Staggered Entrance */}
              <div className="space-y-4">
                <p className="text-[11px] font-display font-bold text-[#1E2A3A]/40 uppercase tracking-[0.2em]">Primary ATS Signals</p>
                <div className="flex flex-wrap gap-3">
                  {keywords.map((kw, i) => (
                    <motion.span
                      key={kw}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                      className="px-4 py-2 rounded-full bg-[#10B981]/5 border border-[#10B981]/10 text-[#10B981] font-display font-bold text-xs"
                    >
                      {kw}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Requirement Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Must Have", icon: <Shield className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/10" },
                  { label: "Nice to Have", icon: <Zap className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" },
                  { label: "Implied", icon: <Globe className="w-4 h-4" />, color: "text-[#10B981]", bg: "bg-[#10B981]/5", border: "border-[#10B981]/10" }
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 + i * 0.1, duration: 0.5 }}
                    className={`p-5 rounded-2xl border ${card.border} ${card.bg} space-y-3`}
                  >
                    <div className={`flex items-center gap-2 ${card.color}`}>
                      {card.icon}
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider">{card.label}</span>
                    </div>
                    <div className="h-2 w-full bg-black/5 rounded-full" />
                    <div className="h-2 w-2/3 bg-black/5 rounded-full" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
