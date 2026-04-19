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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative group rounded-2xl px-12 py-5 font-display font-bold text-base tracking-tight
        ${isDecoded
          ? "bg-accent-emerald text-white border border-accent-emerald/30"
          : "bg-primary text-primary-foreground border border-black/10"
        }
        transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed
        overflow-hidden
      `}
    >
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
        <span>
          {isLoading ? "Analyzing..." : isDecoded ? "Decoded" : "Decode Job Description"}
        </span>
        {!isLoading && !isDecoded && (
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
        )}
      </span>
    </motion.button>
  );
};
