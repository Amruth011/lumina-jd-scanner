import { motion } from "framer-motion";
import { Trophy, ArrowRight, Zap } from "lucide-react";
import type { WinningStep } from "@/types/jd";

interface WinningStrategyProps {
  steps: WinningStep[];
}

export const WinningStrategy = ({ steps }: WinningStrategyProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="premium-card rounded-[3rem] p-10 lg:p-14 relative overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-white/20"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-blue/0 via-accent-blue/40 to-accent-blue/0" />

      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16">
        <div className="w-16 h-16 rounded-[2rem] bg-accent-blue/5 flex items-center justify-center border border-accent-blue/10 shadow-inner">
          <Trophy className="w-7 h-7 text-accent-blue" />
        </div>
        <div>
          <h3 className="font-serif italic text-4xl text-foreground tracking-tight">
            Winning Strategy
          </h3>
          <p className="text-[10px] uppercase font-black tracking-[0.4em] text-accent-blue/60 mt-2">Elite Strategic Directives & Execution Protocols</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative glass-panel rounded-[2.5rem] p-8 flex flex-col gap-6 cursor-default transition-all duration-700 hover:shadow-2xl hover:shadow-accent-blue/5 hover:border-accent-blue/20"
          >
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center text-[11px] font-black text-foreground/20 group-hover:text-accent-blue group-hover:bg-accent-blue/10 transition-all border border-transparent group-hover:border-accent-blue/20">
                {i + 1}
              </span>
              <h4 className="text-[17px] font-bold text-foreground tracking-tight group-hover:text-accent-blue transition-colors">
                {step.title}
              </h4>
            </div>
            <p className="text-[14px] text-muted-foreground/80 leading-relaxed font-medium">
              {step.description}
            </p>
            <div className="flex items-center gap-2.5 text-[9px] font-black text-muted-foreground/30 mt-auto uppercase tracking-[0.2em] group-hover:text-accent-blue/40 transition-colors">
              <Zap className="w-3 h-3" />
              Operational Protocol
            </div>
            
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
              <ArrowRight className="w-5 h-5 text-accent-blue/30" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
