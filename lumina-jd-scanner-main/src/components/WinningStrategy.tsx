import { motion } from "framer-motion";
import { Trophy, Zap, ArrowRight } from "lucide-react";
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
      {/* Animated gradient border accent */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{ backgroundSize: "200% 200%" }}
      />

      <div className="flex items-center gap-2 mb-5">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="p-2 rounded-lg bg-primary/10"
        >
          <Trophy className="w-5 h-5 text-primary" />
        </motion.div>
        <h3 className="font-display font-semibold text-lg text-foreground">
          Top 0.1% Winning Strategy
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.4, type: "spring", stiffness: 200 }}
            whileHover={{ y: -4, boxShadow: "0 8px 25px hsl(210 100% 52% / 0.1)" }}
            className="glass rounded-xl p-4 flex flex-col gap-2 cursor-default transition-colors hover:bg-primary/3 group"
          >
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 15 }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              >
                <span className="text-primary font-bold text-sm">{i + 1}</span>
              </motion.div>
              <h4 className="text-sm font-semibold text-foreground">
                {step.title}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-primary/60 group-hover:text-primary transition-colors mt-auto">
              <ArrowRight className="w-3 h-3" />
              <span>Action item</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
