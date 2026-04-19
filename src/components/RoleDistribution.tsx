import { motion } from "framer-motion";
import { PieChart, Clock } from "lucide-react";
import type { TimeAllocation } from "@/types/jd";

interface RoleDistributionProps {
  distribution?: TimeAllocation[];
}

export const RoleDistribution = ({ distribution }: RoleDistributionProps) => {
  if (!distribution || distribution.length === 0) return null;

  const colors = [
    "bg-accent-emerald", 
    "bg-primary", 
    "bg-accent-blue", 
    "bg-accent-amber",
    "bg-muted-foreground/40",
    "bg-muted"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-4">
        <div className="p-2 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20">
          <Clock size={18} className="text-accent-emerald" />
        </div>
        <div>
          <h3 className="text-lg font-serif italic text-foreground leading-none">Role Distribution</h3>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-1 opacity-50">Estimating Your Future Week</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
        <div className="h-6 w-full flex rounded-full overflow-hidden bg-white/5 p-1 mb-8">
          {distribution.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ width: 0 }}
              animate={{ width: `${item.percent}%` }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 1.2, ease: "easeOut" }}
              className={`${colors[idx % colors.length]} h-full rounded-full border-r border-black/10 transition-all`}
              title={`${item.task}: ${item.percent}%`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
          {distribution.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start group">
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-display font-black leading-none">{item.percent}%</span>
                    <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Target</span>
                  </div>
                  <p className="text-xs font-display font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.task}
                  </p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
