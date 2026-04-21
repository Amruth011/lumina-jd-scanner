import { motion } from "framer-motion";
import { Ghost, ShieldX, TrendingDown, Star, Milestone, Sparkle } from "lucide-react";
import type { DecodeResult } from "@/types/jd";

interface BonusInsightsProps {
  insights?: DecodeResult["bonus_pulse"];
  salary?: DecodeResult["logistics"]["salary_range"];
}

export const BonusInsights = ({ insights, salary }: BonusInsightsProps) => {
  if (!insights && !salary) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-4">
        <div className="p-2 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20">
          <Star size={18} className="text-accent-emerald" />
        </div>
        <div>
          <h3 className="text-lg font-serif italic text-accent-emerald leading-none">Market Insights</h3>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-1 opacity-50">Market Position & Probability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ghost Job Detector */}
        <div className="glass-panel p-6 rounded-[2rem] border-white/5 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Ghost size={64} />
            </div>
            <div className="space-y-1">
                <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60">Ghost Job Detector</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display font-black">{insights?.ghost_job_probability ?? "??"}%</span>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Probability</span>
                </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${insights?.ghost_job_probability ?? 0}%` }}
                    className={`h-full ${insights?.ghost_job_probability && insights.ghost_job_probability > 40 ? 'bg-red-400' : 'bg-accent-emerald'}`}
                />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
                {insights?.ghost_job_probability && insights.ghost_job_probability > 40 
                    ? "Careful: This JD seems generic or aged. Higher likelihood of being a ghost posting." 
                    : "Safe: This role shows high specificity and active urgency."}
            </p>
        </div>

        {/* Salary Estimation */}
        <div className="glass-panel p-6 rounded-[2rem] border-white/5 space-y-4 bg-primary/[0.02]">
            <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60">Estimated Salary Range</span>
            {salary ? (
                <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-display font-black tracking-tighter">
                            {salary.currency === 'INR' ? '₹' : '$'}{salary.min.toLocaleString()} - {salary.max.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight italic">
                        {salary.note}
                    </p>
                </div>
            ) : (
                <div className="py-4">
                    <p className="text-sm font-serif italic text-muted-foreground">Opaque: No market data found for this specific combo.</p>
                </div>
            )}
        </div>

        {/* Career Growth */}
        <div className="glass-panel p-6 rounded-[2rem] border-white/5 space-y-4">
            <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60">Career Trajectory</span>
            <div className="space-y-2">
                {insights?.career_growth?.trajectory?.map((role, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                        <Milestone size={10} className="text-primary/40 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-display font-bold text-foreground/80 group-hover:text-foreground transition-all">
                            {role}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
