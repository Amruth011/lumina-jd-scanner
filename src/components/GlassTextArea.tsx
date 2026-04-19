import { motion } from "framer-motion";

interface GlassTextAreaProps {
  value: string;
  onChange: (val: string) => void;
  isScanning: boolean;
}

export const GlassTextArea = ({ value, onChange, isScanning }: GlassTextAreaProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full mx-auto group"
    >
      <div className="relative premium-card rounded-2xl p-[1px] overflow-hidden">
        {/* Scanning indicator */}
        {isScanning && (
          <motion.div
            className="absolute left-0 right-0 h-px bg-foreground/20 z-10"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div className="relative rounded-2xl overflow-hidden">
          {/* Line numbers gutter */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/20 border-r border-border/20 pointer-events-none flex flex-col items-end pt-6 pr-3 gap-[1px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="text-[10px] font-mono font-bold text-muted-foreground/60 leading-[1.625rem]">
                {String(i + 1).padStart(2, '0')}
              </span>
            ))}
          </div>

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste complete 'About the Job' for objective-grade analysis extraction..."
            className="w-full h-80 bg-transparent rounded-2xl pl-16 pr-8 py-6 text-foreground placeholder:text-muted-foreground/70 resize-none focus:outline-none text-[13.5px] leading-relaxed transition-all font-mono font-medium"
            disabled={isScanning}
          />
        </div>
      </div>

      {/* Character count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: value.length > 0 ? 1 : 0 }}
        className="absolute bottom-3 right-4 text-xs text-muted-foreground/80 font-mono"
      >
        {value.length.toLocaleString()} chars
      </motion.div>
    </motion.div>
  );
};
