import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface TimelineEntry {
  time: string;
  task: string;
  description: string;
}

interface LuminaTimelineProps {
  data: TimelineEntry[];
}

export const LuminaTimeline = ({ data }: LuminaTimelineProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="relative pl-8 space-y-12">
      {/* Central Line */}
      <div className="absolute left-[3px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary/40 via-primary/10 to-transparent" />

      {(data || []).map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Node */}
          <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] z-10" />
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-black tracking-[0.2em] text-primary flex items-center gap-2 uppercase">
                <Clock size={12} />
                {item.time}
              </span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            
            <div className="glass-panel p-8 rounded-[2rem] border-white/5 group hover:border-primary/20 transition-all duration-700 bg-gradient-to-br from-white/[0.02] to-transparent">
               <h4 className="text-[17px] font-display font-bold text-foreground mb-3 group-hover:translate-x-1 transition-transform">
                  {item.task}
               </h4>
               <p className="text-[14px] font-medium text-muted-foreground leading-relaxed">
                  {item.description}
               </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
