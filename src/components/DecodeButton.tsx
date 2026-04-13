import { motion } from "framer-motion";
import { Loader2, Zap, CheckCircle2, ArrowRight } from "lucide-react";

interface DecodeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  isDecoded?: boolean;
}

export const DecodeButton = ({ onClick, isLoading, disabled, isDecoded }: DecodeButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative group rounded-2xl px-12 py-5 font-display font-bold text-base tracking-tight
        ${isDecoded
          ? "bg-accent-emerald text-white shadow-xl shadow-accent-emerald/20 border border-accent-emerald/30"
          : "bg-foreground text-background dark:bg-primary dark:text-primary-foreground liquid-glass-refraction premium-button-glow"
        }
        transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed
        overflow-hidden
      `}
    >
      {/* Liquid Water Layer */}
      <div className="liquid-water-layer" />
      
      {/* Specular highlight top-edge overlay */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/30 z-20 pointer-events-none" />

      {/* Shimmer sweep */}
      {!disabled && !isLoading && !isDecoded && (
        <div className="shimmer-sweep" />
      )}

      {/* Loading ring */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-background/20 z-0"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <span className="relative z-10 flex items-center justify-center gap-3">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isDecoded ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <CheckCircle2 className="w-5 h-5" />
          </motion.span>
        ) : (
          <Zap className="w-5 h-5 fill-current" />
        )}
        <span className="drop-shadow-md">
          {isLoading ? "Analyzing..." : isDecoded ? "Decoded" : "Decode Job Description"}
        </span>
        {!isLoading && !isDecoded && (
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[0.16,1,0.3,1]" />
        )}
      </span>
    </motion.button>
  );
};
