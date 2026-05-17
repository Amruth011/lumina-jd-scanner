import React from "react";
import { motion } from "framer-motion";
import { Heart, Trophy, Shield, Activity, Users, Zap } from "lucide-react";
import type { CompanyDeepDive } from "@/types/jd";

interface CultureRadarProps {
  radar?: CompanyDeepDive["culture_radar"];
}

/**
 * CultureRadar presents a granular break-down of company work environment,
 * innovation index, and organizational archetypes.
 */
export const CultureRadar = ({ radar }: CultureRadarProps) => {
  if (!radar) return null;

  const metrics = [
    { label: "Innovation Pulse", value: radar.innovation, icon: Zap, color: "text-accent-blue", bg: "bg-accent-blue/10" },
    { label: "Stability Index", value: radar.stability, icon: Shield, color: "text-accent-emerald", bg: "bg-accent-emerald/10" },
    { label: "Collaboration", value: radar.collaboration, icon: Users, color: "text-accent-purple", bg: "bg-accent-purple/10" },
    { label: "Work-Life Balance", value: radar.work_life_balance, icon: Heart, color: "text-accent-gold", bg: "bg-accent-gold/10" },
    { label: "Results Velocity", value: radar.results_driven, icon: Trophy, color: "text-accent-red", bg: "bg-accent-red/10" },
  ];

  return (
    <div className="glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded-[2.5rem] border-white/20 space-y-6 relative overflow-hidden group">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
          <Activity size={20} />
        </div>
        <div>
          <h3 className="text-2xl font-serif italic text-foreground">Culture & Retention Radar</h3>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50 mt-1">Organizational Archetype Scan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {metrics.map((m, i) => (
          <div key={i} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${m.bg} ${m.color}`}>
                  <m.icon size={12} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{m.label}</span>
              </div>
              <span className={`text-[11px] font-black ${m.color}`}>{m.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${m.value}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full bg-current ${m.color}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
           <p className="text-[11px] text-muted-foreground leading-relaxed italic">
            <span className="text-primary font-black uppercase text-[9px] tracking-widest not-italic mr-2">Retention Signal:</span>
            {radar.stability > 70 ? "This role demonstrates high long-term stability and institutional maturity." : "JD language suggests a high-velocity, high-impact environment with immediate results demand."}
           </p>
        </div>
      </div>
    </div>
  );
};
