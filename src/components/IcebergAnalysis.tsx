import { motion } from "framer-motion";
import { Snowflake, AlertTriangle, Layers, Zap } from "lucide-react";
import type { RoleReality } from "@/types/jd";

interface IcebergAnalysisProps {
  reality?: RoleReality;
}

export const IcebergAnalysis = ({ reality }: IcebergAnalysisProps) => {
  if (!reality) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-4">
        <div className="p-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
          <Snowflake size={18} className="text-accent-blue" />
        </div>
        <div>
          <h3 className="text-lg font-serif italic text-foreground leading-none">The Reality Iceberg</h3>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-1 opacity-50">Stated vs Hidden Realities</p>
        </div>
      </div>

      <div className="relative glass-panel p-0 rounded-[2.5rem] border-white/5 overflow-hidden min-h-[400px]">
        {/* The Water Line */}
        <div className="absolute top-[40%] left-0 w-full h-[1px] bg-accent-blue/30 z-20">
            <div className="absolute right-4 -top-3 text-[8px] uppercase font-black tracking-widest text-accent-blue/60 bg-background px-2 py-0.5 rounded-full border border-accent-blue/20">
                The Water Line (Stated Reqs)
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 h-full absolute inset-0">
            {/* Above Water */}
            <div className="p-8 space-y-4 bg-accent-blue/[0.02] flex flex-col justify-start pt-12">
               <div className="flex items-center gap-2 mb-2">
                 <Zap size={14} className="text-accent-blue" />
                 <span className="text-[10px] uppercase font-black tracking-widest text-accent-blue">Above the Surface</span>
               </div>
               {reality.iceberg_above.map((item, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.1 }}
                     className="px-4 py-3 rounded-2xl bg-white/40 border border-white/10 text-xs font-display font-medium text-foreground/80"
                   >
                       {item}
                   </motion.div>
               ))}
            </div>

            {/* Below Water */}
            <div className="p-8 space-y-4 bg-accent-blue/[0.05] flex flex-col justify-end pb-12">
               <div className="flex items-center gap-2 mb-2">
                 <AlertTriangle size={14} className="text-red-400" />
                 <span className="text-[10px] uppercase font-black tracking-widest text-red-400">Hidden Realities</span>
               </div>
               {reality.iceberg_below.map((item, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, scale: 1.1 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.5 + i * 0.1 }}
                     className="px-4 py-3 rounded-2xl bg-black/20 border border-white/5 text-xs font-display font-bold text-foreground italic shadow-xl"
                   >
                       {item}
                   </motion.div>
               ))}
            </div>
        </div>

        {/* Archetype Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="glass-panel px-6 py-3 rounded-2xl border-accent-blue/40 bg-accent-blue/10 backdrop-blur-xl shadow-2xl flex items-center gap-3">
                <Layers size={16} className="text-accent-blue" />
                <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-black tracking-widest text-accent-blue opacity-70">Role Archetype</span>
                    <span className="text-sm font-serif italic text-foreground leading-none">{reality.archetype}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
