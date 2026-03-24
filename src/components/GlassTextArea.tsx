import { motion } from "framer-motion";

interface GlassTextAreaProps {
  value: string;
  onChange: (val: string) => void;
  isScanning: boolean;
}

export const GlassTextArea = ({ value, onChange, isScanning }: GlassTextAreaProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-3xl mx-auto"
    >
      <div className="glass-strong rounded-2xl p-1 glow-border relative overflow-hidden">
        {isScanning && (
          <motion.div
            className="absolute left-0 right-0 h-1 scan-line z-10 rounded-full"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your Job Description here..."
          className="w-full h-64 bg-transparent rounded-xl p-6 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-sans text-sm leading-relaxed transition-all"
          disabled={isScanning}
        />
      </div>
    </motion.div>
  );
};
