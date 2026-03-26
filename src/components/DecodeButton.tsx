import { motion } from "framer-motion";
import { Scan, Loader2 } from "lucide-react";

interface DecodeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const DecodeButton = ({ onClick, isLoading, disabled }: DecodeButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        glass-strong rounded-2xl px-10 py-4 font-display font-semibold text-lg
        text-primary-foreground bg-primary/90 backdrop-blur-xl
        border border-primary/30 
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-300
        ${isLoading ? "animate-pulse-glow" : "dark:hover:shadow-[0_0_30px_hsl(210_100%_55%/0.4)]"}
      `}
    >
      <span className="flex items-center gap-3">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Scan className="w-5 h-5" />
        )}
        {isLoading ? "Decoding..." : "Decode JD"}
      </span>
    </motion.button>
  );
};
