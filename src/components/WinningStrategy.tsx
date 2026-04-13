import { motion } from "framer-motion";
import { Trophy, ArrowRight, Zap } from "lucide-react";
import type { WinningStep } from "@/types/jd";

interface WinningStrategyProps {
  steps: WinningStep[];
}

export const WinningStrategy = ({ steps }: WinningStrategyProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="premium-card rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      <div className="flex items-center gap-4 mb-10">
        <div className="w-11 h-11 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/10 shadow-sm shadow-accent-blue/5">
          <Trophy className="w-5 h-5 text-accent-blue" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg md:text-xl text-foreground tracking-tight">
            Winning Strategy
          </h3>
          <p className="text-[11px] text-muted-foreground/70 font-medium uppercase tracking-[0.15em]">Executive Level Tactics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
            className="group relative glass rounded-2xl p-6 flex flex-col gap-4 cursor-default transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent-blue/5 border-border/40"
          >
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground/40 group-hover:text-accent-blue group-hover:bg-accent-blue/10 transition-all border border-transparent group-hover:border-accent-blue/20">
                0{i + 1}
              </span>
              <h4 className="text-[13px] font-bold text-foreground/90 leading-tight tracking-tight pr-4">
                {step.title}
              </h4>
            </div>
            <p className="text-[11.5px] text-muted-foreground/70 font-medium leading-[1.6]">
              {step.description}
            </p>
            <div className="flex items-center gap-2 text-[8px] text-muted-foreground/60 transition-colors mt-auto uppercase tracking-[0.2em] font-bold">
              <Zap className="w-3 h-3" />
              Strategic Directive
            </div>
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 text-accent-blue/40" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
