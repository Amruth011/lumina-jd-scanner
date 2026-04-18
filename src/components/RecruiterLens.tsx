import { motion } from "framer-motion";
import { MessageSquareQuote, ShieldAlert, ArrowRightLeft } from "lucide-react";
import type { RecruiterInsight } from "@/types/jd";

interface RecruiterLensProps {
  insights?: RecruiterInsight[];
}

export const RecruiterLens = ({ insights }: RecruiterLensProps) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-4">
        <div className="p-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
          <MessageSquareQuote size={18} className="text-accent-blue" />
        </div>
        <div>
          <h3 className="text-lg font-serif italic text-foreground leading-none">The Recruiter Lens</h3>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-1 opacity-50">Jargon Decoding & Reality Checks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative"
          >
            <div className="glass-panel p-6 rounded-[2rem] border-white/5 h-full flex flex-col justify-between transition-all duration-500 hover:border-accent-blue/20 hover:bg-accent-blue/[0.02]">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 opacity-40">JD Says</span>
                    <p className="font-display font-bold text-sm text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">
                      "{item.jargon}"
                    </p>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-accent-blue/20 group-hover:text-accent-blue/40 transition-colors mt-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={10} className="text-accent-blue" />
                    <span className="text-[9px] uppercase font-black tracking-widest text-accent-blue/80">The Reality</span>
                  </div>
                  <p className="font-serif italic text-base text-foreground leading-relaxed">
                    {item.reality}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
