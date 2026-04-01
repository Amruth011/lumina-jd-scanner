import { motion } from "framer-motion";
import { Scan, Loader2, Zap } from "lucide-react";

interface DecodeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const DecodeButton = ({ onClick, isLoading, disabled }: DecodeButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: "0 8px 20px hsl(var(--foreground) / 0.08)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative rounded-2xl px-10 py-4 font-display font-semibold text-lg
        text-primary-foreground bg-primary
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-300 overflow-hidden
        ${isLoading ? "" : "hover:shadow-xl"}
      `}
    >
      {/* Shimmer effect */}
      {!disabled && !isLoading && (
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
        ) : (
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Zap className="w-5 h-5" />
          </motion.span>
        )}
        {isLoading ? "Decoding..." : "Decode JD"}
      </span>
    </motion.button>
  );
};
