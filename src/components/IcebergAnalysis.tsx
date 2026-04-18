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
        <div className="glass-panel px-4 py-3 rounded-2xl border-accent-blue/20 bg-accent-blue/5 flex items-center gap-3">
            <Layers size={16} className="text-accent-blue/40" />
            <div className="flex flex-col">
                <span className="text-[12px] uppercase font-black tracking-widest text-accent-blue/60">Archetype</span>
                <span className="text-[14px] font-serif italic text-foreground leading-none">{archetype || 'Specialist'}</span>
            </div>
        </div>
      </div>

      <div className="relative glass-panel p-0 rounded-[2.5rem] border-white/5 overflow-hidden min-h-[400px]">
        {/* The Water Line */}
        <div className="absolute top-[42%] left-0 w-full h-[1px] bg-accent-blue/30 z-20">
            <div className="absolute right-6 -top-4 text-[12px] uppercase font-black tracking-widest text-accent-blue/80 bg-background/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-accent-blue/20 shadow-lg">
                The Water Line (Stated)
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 h-full absolute inset-0">
            {/* Above Water */}
            <div className="p-8 space-y-3 bg-accent-blue/[0.03] flex flex-col justify-start pt-12">
               <div className="flex items-center gap-3 mb-2">
                 <Zap size={18} className="text-accent-blue/60" />
                 <span className="text-[12px] uppercase font-black tracking-widest text-accent-blue/60">Surface Level</span>
               </div>
               {(reality.iceberg_above || []).map((item, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[14px] font-display font-bold text-foreground/80 shadow-sm hover:bg-white/5 transition-colors"
                   >
                       {item}
                   </motion.div>
               ))}
            </div>

            {/* Below Water */}
            <div className="p-8 space-y-3 bg-accent-blue/[0.08] flex flex-col justify-end pb-12">
               <div className="flex items-center gap-3 mb-2">
                 <AlertTriangle size={18} className="text-red-500/60" />
                 <span className="text-[12px] uppercase font-black tracking-widest text-red-500/60">Hidden Reality</span>
               </div>
               {(reality.iceberg_below || []).map((item, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="px-5 py-4 rounded-2xl bg-foreground/5 border border-foreground/10 text-[14px] font-display font-extrabold text-foreground italic shadow-sm backdrop-blur-md hover:bg-foreground/10 transition-all"
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
