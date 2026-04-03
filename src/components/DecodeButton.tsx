import { motion } from "framer-motion";
import { Loader2, Zap, CheckCircle2 } from "lucide-react";

interface DecodeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  isDecoded?: boolean;
}

export const DecodeButton = ({ onClick, isLoading, disabled, isDecoded }: DecodeButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative rounded-2xl px-10 py-4 font-display font-semibold text-lg
        ${isDecoded
          ? "bg-emerald-600 text-white shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700"
          : "bg-zinc-900 text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:bg-zinc-800 dark:bg-transparent dark:text-foreground dark:glass-strong dark:shadow-sm dark:hover:bg-foreground/5"
        }
        transition-all disabled:opacity-40 disabled:cursor-not-allowed
        overflow-hidden
      `}
    >
      {/* Shimmer effect */}
      {!disabled && !isLoading && !isDecoded && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      )}
      
      {/* Pulse ring when loading */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary-foreground/30"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      <span className="relative z-10 flex items-center gap-3">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isDecoded ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <CheckCircle2 className="w-5 h-5" />
          </motion.span>
        ) : (
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Zap className="w-5 h-5" />
          </motion.span>
        )}
        {isLoading ? "Decoding..." : isDecoded ? "Decoded ✓" : "Decode JD"}
      </span>
    </motion.button>
  );
};
