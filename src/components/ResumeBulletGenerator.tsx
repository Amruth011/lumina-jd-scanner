import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Sparkles, Zap, Target, MousePointer2 } from "lucide-react";

interface ResumeBulletGeneratorProps {
  bullets?: string[];
}

export const ResumeBulletGenerator = ({ bullets }: ResumeBulletGeneratorProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    const cleanedText = text.replace(/\*\*/g, "");
    navigator.clipboard.writeText(cleanedText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!bullets || bullets.length === 0) return null;

  return (
    <div className="glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded-[2.5rem] border-white/20 space-y-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
        <Sparkles size={160} />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-serif italic text-foreground">Content Optimization</h3>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50 mt-1">AI-generated achievement bullets</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            <MousePointer2 size={12} className="text-primary/40" />
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Click to Copy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 relative z-10">
        {bullets.map((bullet, i) => (
          <motion.div 
            key={i}
            whileHover={{ x: 8 }}
            onClick={() => copyToClipboard(bullet, i)}
            className="group/item relative p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-accent-emerald/30 hover:bg-white/[0.07] transition-all cursor-pointer overflow-hidden"
          >
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-accent-emerald/10 flex items-center justify-center text-accent-emerald text-[11px] font-black group-hover/item:bg-accent-emerald group-hover/item:text-white transition-all">
                {i + 1}
              </div>
              <p className="text-[14px] font-medium text-foreground/80 leading-relaxed group-hover/item:text-foreground transition-colors flex-1">
                {bullet.split('**').map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-accent-emerald font-black">{part}</strong> : part)}
              </p>
              <div className="ml-4 opacity-0 group-hover/item:opacity-100 transition-opacity">
                {copiedIndex === i ? (
                  <Check size={16} className="text-accent-emerald" />
                ) : (
                  <Copy size={16} className="text-muted-foreground/40 hover:text-accent-emerald transition-colors" />
                )}
              </div>
            </div>
            {/* Copied indicator overlay */}
            <AnimatePresence>
                {copiedIndex === i && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-accent-emerald/10 flex items-center justify-center backdrop-blur-[2px]"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-emerald bg-background px-4 py-1.5 rounded-full border border-accent-emerald/20 shadow-xl">Copied to Clipboard</span>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
        <div className="p-2 rounded-lg bg-primary/10">
            <Target size={14} className="text-primary" />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-black uppercase text-[9px] tracking-widest mr-2 text-primary/60">Pro Tip:</span>
            Achievement-based bullets with <span className="text-foreground font-bold">quantified metrics</span> (%, $, time) significantly increase recruiter callback rates.
        </p>
      </div>
    </div>
  );
};
