import React from "react";
import { motion } from "framer-motion";
import { Scale, Users, TrendingUp, Info, Activity } from "lucide-react";
import type { DecodeResult } from "@/types/jd";

interface BiasDetectorProps {
  bias?: DecodeResult["deep_dive"]["bias_analysis"];
}

export const BiasDetector = ({ bias }: BiasDetectorProps) => {
  if (!bias) return null;

  const getGenderDescription = (meter: string) => {
    switch (meter) {
      case 'masculine': return "JD significantly favors high-agency, competitive linguistic patterns commonly associated with masculine outreach.";
      case 'feminine': return "JD leans heavily into collaborative, nurturing, and relationship-centric terminology.";
      default: return "Language is remarkably balanced, using neutral agency to minimize exclusionary friction.";
    }
  };

  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-serif italic text-foreground">Bias & Inclusivity</h3>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50 mt-1">Linguistic Equity Scan</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-display font-black tracking-tighter text-accent-blue">{bias.inclusivity_score}%</span>
          <span className="text-[10px] block uppercase font-black tracking-widest text-muted-foreground opacity-40">Equity Index</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gender Decoder */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-muted-foreground/60" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground/70">Gender Decoder</span>
          </div>
          
          <div className="space-y-6 pt-2">
            <div className="relative h-2 w-full bg-white/5 rounded-full p-0.5 border border-white/5">
                {/* Scale Markers */}
                <div className="absolute inset-0 flex justify-between px-2 -top-5 opacity-30 text-[8px] font-black uppercase tracking-tighter">
                   <span>Masculine</span>
                   <span>Neutral</span>
                   <span>Feminine</span>
                </div>
                {/* Indicator */}
                <motion.div 
                    initial={{ left: "50%" }}
                    animate={{ 
                        left: bias.gender_meter === 'masculine' ? "10%" : bias.gender_meter === 'feminine' ? "90%" : "50%" 
                    }}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-accent-blue shadow-[0_0_15px_rgba(var(--accent-blue-rgb),0.5)] z-20"
                />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-muted-foreground/10 via-accent-blue/40 to-muted-foreground/10" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                {getGenderDescription(bias.gender_meter)}
            </p>
          </div>
        </div>

        {/* Age/Experience Targeting */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-muted-foreground/60" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground/70">Demographic Pulse</span>
          </div>

          <div className="space-y-6 pt-2">
            <div className="flex items-end justify-between gap-1 h-12 px-2">
                {[10, 30, 60, 85, 95, 80, 50, 20].map((h, i) => (
                    <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className={`w-full rounded-t-sm ${i === Math.floor(bias.age_bias_graph / 12.5) ? 'bg-accent-blue border border-accent-blue/30' : 'bg-white/5'}`}
                    />
                ))}
            </div>
            <div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest">
                <span>Entry Level</span>
                <span>Seasoned Expert</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                {bias.age_bias_graph > 70 
                    ? "JD structure prioritizes institutional knowledge and legacy management over experimental speed."
                    : bias.age_bias_graph < 30
                    ? "Heavy focus on fresh frameworks and high-output 'hustle' language commonly targeting early-career profiles."
                    : "JD is balanced, emphasizing both core stability and modern execution paths."}
            </p>
          </div>
        </div>
      </div>

      {/* Tone Map Tokens */}
      <div className="pt-4 border-t border-white/5">
        <div className="flex flex-wrap gap-2">
          {bias.tonal_map.map((t, i) => (
            <div key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 group hover:border-accent-blue/30 transition-all">
                <Activity size={10} className="text-accent-blue/40 group-hover:text-accent-blue transition-colors" />
                <span className="text-[9px] font-black uppercase text-muted-foreground/60 group-hover:text-foreground/80 tracking-widest">{t.category}:</span>
                <span className="text-[10px] font-bold text-foreground/90">{t.tone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
