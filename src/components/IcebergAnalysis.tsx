import { motion } from "framer-motion";
import { Snowflake, AlertTriangle, Layers, Zap } from "lucide-react";
import type { RoleReality } from "@/types/jd";

interface IcebergAnalysisProps {
  reality?: RoleReality;
  archetype?: string;
}

export const IcebergAnalysis = ({ reality, archetype }: IcebergAnalysisProps) => {
  if (!reality) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-accent-blue/10 border border-accent-blue/20">
            <Snowflake size={20} className="text-accent-blue" />
          </div>
          <div>
            <h3 className="text-xl font-serif italic text-foreground leading-none">The Reality Iceberg</h3>
            <p className="text-[12px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-1.5 opacity-70">Stated vs Hidden Realities</p>
          </div>
        </div>

        {/* Repositioned Archetype Badge (Header Integrated) */}
        <div className="glass-panel px-5 py-3 rounded-2xl border-accent-blue/20 bg-accent-blue/5 flex items-center gap-3 min-w-[160px] whitespace-nowrap shadow-sm">
            <Layers size={16} className="text-accent-blue/40" />
            <div className="flex flex-col">
                <span className="text-[12px] uppercase font-black tracking-widest text-accent-blue/60 leading-tight">Archetype</span>
                <span className="text-[14px] font-serif italic text-foreground leading-none">{archetype || 'Specialist'}</span>
            </div>
        </div>
      </div>

      <div className="relative glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/5 flex flex-col min-h-[550px] gap-12 overflow-hidden">
        {/* Above Water */}
        <div className="space-y-6 z-10 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={18} className="text-accent-blue/60" />
            <span className="text-[12px] uppercase font-black tracking-widest text-accent-blue/60">Surface Level</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(reality.iceberg_above || []).map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-[14px] font-display font-bold text-foreground/80 shadow-sm hover:bg-white/5 transition-all hover:scale-[1.01]"
                transition={{ delay: i * 0.1 }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        {/* The Water Line */}
        <div className="relative w-full z-20 py-10 flex items-center justify-end">
          <div className="absolute left-0 right-0 h-[1.5px] bg-accent-blue/20" />
          <div className="relative text-[11px] uppercase font-black tracking-[0.2em] text-accent-blue bg-background/90 backdrop-blur-xl px-6 py-2 rounded-full border border-accent-blue/30 shadow-[0_8px_32px_rgba(var(--accent-blue-rgb),0.15)] z-30">
            The Water Line (Stated)
          </div>
        </div>

        {/* Below Water */}
        <div className="space-y-6 z-10 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={18} className="text-red-500/60" />
            <span className="text-[12px] uppercase font-black tracking-widest text-red-500/60">Hidden Reality</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(reality.iceberg_below || []).map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-5 rounded-2xl bg-foreground/5 border border-foreground/10 text-[14px] font-display font-extrabold text-foreground italic shadow-sm backdrop-blur-md hover:bg-foreground/10 transition-all hover:scale-[1.01]"
                transition={{ delay: 0.5 + (i * 0.1) }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
