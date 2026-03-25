import { motion } from "framer-motion";
import { Trophy, Zap } from "lucide-react";
import type { WinningStep } from "@/types/jd";

interface WinningStrategyProps {
  steps: WinningStep[];
}

export const WinningStrategy = ({ steps }: WinningStrategyProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-strong rounded-2xl p-6 glow-border relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />

      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-primary/10 shadow-[0_0_16px_hsl(var(--primary)/0.25)]">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-lg text-foreground">
          Top 0.1% Winning Strategy
        </h3>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-0.5">
                {step.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
