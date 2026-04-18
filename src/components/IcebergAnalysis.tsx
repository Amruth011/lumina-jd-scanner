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
            <p className="text-xs uppercase font-black tracking-[0.2em] text-muted-foreground mt-1.5 opacity-60">Stated vs Hidden Realities</p>
          </div>
        </div>

        {/* Repositioned Archetype Badge (Header Integrated) */}
        <div className="glass-panel px-4 py-2 rounded-xl border-accent-blue/20 bg-accent-blue/5 flex items-center gap-2.5">
            <Layers size={14} className="text-accent-blue/60" />
            <div className="flex flex-col">
                <span className="text-[9px] uppercase font-black tracking-widest text-accent-blue opacity-50">Archetype</span>
                <span className="text-xs font-serif italic text-foreground leading-none">{archetype || 'Specialist'}</span>
            </div>
        </div>
      </div>

      <div className="relative glass-panel p-0 rounded-[3rem] border-white/5 overflow-hidden min-h-[440px]">
        {/* The Water Line */}
        <div className="absolute top-[40%] left-0 w-full h-[1px] bg-accent-blue/40 z-20">
            <div className="absolute right-6 -top-3.5 text-[10px] uppercase font-black tracking-widest text-accent-blue/80 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-accent-blue/20 shadow-sm">
                The Water Line (Stated)
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 h-full absolute inset-0">
            {/* Above Water */}
            <div className="p-10 space-y-4 bg-accent-blue/[0.03] flex flex-col justify-start pt-14">
               <div className="flex items-center gap-2.5 mb-2">
                 <Zap size={16} className="text-accent-blue" />
                 <span className="text-xs uppercase font-black tracking-widest text-accent-blue/70">Surface Requirements</span>
               </div>
               {(reality.iceberg_above || []).map((item, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="px-5 py-3.5 rounded-2xl bg-white/60 border border-white/20 text-[13px] font-display font-bold text-foreground/80 shadow-sm"
                   >
                       {item}
                   </motion.div>
               ))}
            </div>

            {/* Below Water */}
            <div className="p-10 space-y-4 bg-accent-blue/[0.06] flex flex-col justify-end pb-14">
               <div className="flex items-center gap-2.5 mb-2">
                 <AlertTriangle size={16} className="text-red-400" />
                 <span className="text-xs uppercase font-black tracking-widest text-red-400/70">Hidden Realities</span>
               </div>
               {(reality.iceberg_below || []).map((item, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.5 + i * 0.1 }}
                     className="px-5 py-3.5 rounded-2xl bg-black/10 border border-white/10 text-[13px] font-display font-extrabold text-foreground italic shadow-xl backdrop-blur-sm"
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
