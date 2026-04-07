import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";
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
      {/* Top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-foreground/5 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-foreground/60" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-base text-foreground">
            Winning Strategy
          </h3>
          <p className="text-[11px] text-muted-foreground/60">Top 0.1% application tactics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
            className="group glass rounded-xl p-5 flex flex-col gap-3 cursor-default transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center text-xs font-mono font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <h4 className="text-sm font-semibold text-foreground leading-tight">
                {step.title}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-auto uppercase tracking-wider font-semibold">
              <ArrowRight className="w-3 h-3" />
              Action item
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
