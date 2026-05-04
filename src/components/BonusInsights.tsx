import { motion } from "framer-motion";
import { Ghost, ShieldX, TrendingDown, Star, Milestone, Sparkle, Target, Zap } from "lucide-react";
import type { DecodeResult } from "@/types/jd";
import { SkillsPayMore } from "./market-insights/SkillsPayMore";

interface SkillImpact {
  skill: string;
  impact: number;
  demand: "High" | "Medium" | "Low";
  trend: "Rising" | "Stable" | "Falling";
}

interface BonusInsightsProps {
  insights?: DecodeResult["bonus_pulse"];
  salary?: DecodeResult["logistics"]["salary_range"];
  skills?: SkillImpact[]; // For SkillsPayMore
}

export const BonusInsights = ({ insights, salary, skills }: BonusInsightsProps) => {
  if (!insights && !salary) return null;

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-3 px-4">
        <div className="p-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
          <Star size={18} className="text-[#10B981]" />
        </div>
        <div>
          <h3 className="text-lg font-serif italic text-[#10B981] leading-none">Market Intelligence</h3>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#1E2A3A]/40 mt-1">Forensic Market Positioning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ghost Job Detector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 rounded-[3rem] border-[#1E2A3A]/5 bg-white/40 shadow-sm space-y-6 relative overflow-hidden group hover:bg-white/60 transition-all"
        >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Ghost size={80} />
            </div>
            <div className="space-y-1 relative z-10">
                <span className="text-[9px] uppercase font-black tracking-widest text-[#1E2A3A]/40">Ghost Job Detector</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-black text-[#1E2A3A]">{insights?.ghost_job_probability ?? "??"}%</span>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#1E2A3A]/40">Risk Index</span>
                </div>
            </div>
            <div className="h-1.5 w-full bg-[#1E2A3A]/5 rounded-full overflow-hidden relative z-10">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${insights?.ghost_job_probability ?? 0}%` }}
                    className={`h-full ${insights?.ghost_job_probability && insights.ghost_job_probability > 40 ? 'bg-orange-400' : 'bg-[#10B981]'}`}
                />
            </div>
            <p className="text-[11px] text-[#1E2A3A]/60 leading-relaxed font-medium relative z-10">
                {insights?.ghost_job_probability && insights.ghost_job_probability > 40 
                    ? "Protocol Warning: High probability of administrative reposting or talent pooling." 
                    : "Signal Verified: Role shows specific technical urgency and active hiring intent."}
            </p>
        </motion.div>

        {/* Salary Estimation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8 rounded-[3rem] border-[#1E2A3A]/5 bg-white shadow-lg shadow-[#10B981]/5 space-y-6 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <Target size={80} className="text-[#10B981]" />
            </div>
            <span className="text-[9px] uppercase font-black tracking-widest text-[#1E2A3A]/40 relative z-10">Projected Valuation</span>
            {salary ? (
                <div className="space-y-4 relative z-10">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-black tracking-tight text-[#1E2A3A]">
                            {salary.currency === 'INR' ? '₹' : '$'}{salary.min.toLocaleString()} - {salary.max.toLocaleString()}
                        </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#10B981]/5 border border-[#10B981]/10">
                        <p className="text-[10px] text-[#10B981] leading-relaxed font-bold uppercase tracking-wider">
                            {salary.note || "Market-calibrated range for domain & location."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="py-4 relative z-10">
                    <p className="text-sm font-serif italic text-[#1E2A3A]/40">Valuation Opaque: Insufficient market signal for high-fidelity projection.</p>
                </div>
            )}
        </motion.div>

        {/* Career Growth */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-8 rounded-[3rem] border-[#1E2A3A]/5 bg-white/40 shadow-sm space-y-6 relative overflow-hidden group hover:bg-white/60 transition-all"
        >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Milestone size={80} />
            </div>
            <span className="text-[9px] uppercase font-black tracking-widest text-[#1E2A3A]/40 relative z-10">Strategic Trajectory</span>
            <div className="space-y-3 relative z-10">
                {insights?.career_growth?.trajectory?.map((role, i) => (
                    <div key={i} className="flex items-center gap-3 group/item">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]/20 group-hover/item:bg-[#10B981] transition-colors" />
                        <span className="text-xs font-display font-bold text-[#1E2A3A]/80 group-hover/item:text-[#1E2A3A] transition-all">
                            {role}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
      </div>

      {/* Skills that Pay More */}
      <SkillsPayMore skills={skills} />
    </div>
  );
};
