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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative group rounded-full px-8 py-3.5 font-display font-semibold text-base
        ${isDecoded
          ? "bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white"
          : "bg-foreground text-background dark:bg-primary dark:text-primary-foreground"
        }
        transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
        overflow-hidden
      `}
    >
      {/* Subtle shimmer */}
      {!disabled && !isLoading && !isDecoded && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent"
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
        />
      )}

      {/* Loading ring */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-full border border-background/20"
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <span className="relative z-10 flex items-center gap-2.5">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isDecoded ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
            <CheckCircle2 className="w-4 h-4" />
          </motion.span>
        ) : (
          <Zap className="w-4 h-4" />
        )}
        {isLoading ? "Analyzing..." : isDecoded ? "Decoded" : "Decode JD"}
        {!isLoading && !isDecoded && (
          <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        )}
      </span>
    </motion.button>
  );
};
