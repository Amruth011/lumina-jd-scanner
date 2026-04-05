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
      className="relative w-full max-w-3xl mx-auto group"
    >
      <div className="relative glass-strong rounded-2xl p-1 overflow-hidden transition-all duration-300 group-focus-within:border-primary/30 group-focus-within:shadow-lg group-focus-within:shadow-primary/5">
        {isScanning && (
          <>
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent z-10"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 bg-primary/5"
              animate={{ opacity: [0, 0.08, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your Job Description here..."
          className="w-full h-64 bg-transparent rounded-xl p-6 text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none font-sans text-sm leading-relaxed transition-all"
          disabled={isScanning}
        />
      </div>
      
      {/* Character count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: value.length > 0 ? 1 : 0 }}
        className="absolute bottom-3 right-4 text-xs font-mono text-muted-foreground/50"
      >
        {value.length} chars
      </motion.div>
    </motion.div>
  );
};
