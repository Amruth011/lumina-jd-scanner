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
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative rounded-2xl px-10 py-4 font-display font-semibold text-lg
        ${isDecoded
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          : "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40"
        }
        transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
        overflow-hidden
      `}
    >
      {/* Shimmer effect */}
      {!disabled && !isLoading && !isDecoded && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
        />
      )}
      
      {/* Pulse ring when loading */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-white/30"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
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
