import { motion } from "framer-motion";
import { MessageSquareQuote, ShieldAlert, ArrowRightLeft } from "lucide-react";
import type { RecruiterInsight } from "@/types/jd";

interface RecruiterLensProps {
  insights?: RecruiterInsight[];
}

export const RecruiterLens = ({ insights }: RecruiterLensProps) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 px-4">
        <div className="p-2.5 rounded-2xl bg-accent-blue/10 border border-accent-blue/20">
          <MessageSquareQuote size={20} className="text-accent-blue" />
        </div>
        <div>
          <h3 className="text-2xl font-serif italic text-foreground tracking-tight">Recruiter Lens</h3>
          <p className="text-[12px] uppercase font-black tracking-[0.3em] text-muted-foreground mt-1.5 opacity-60">Jargon Decoding & Reality Checks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {insights.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative h-full"
          >
            <div className="glass-panel p-6 lg:p-10 rounded-[2.5rem] border-white/5 h-full flex flex-col justify-between transition-all duration-700 hover:border-accent-blue/20 hover:bg-accent-blue/[0.03] bg-gradient-to-br from-white/[0.02] to-transparent">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[12px] uppercase font-black tracking-widest text-muted-foreground/60 block mb-1">Corporate Logic</span>
                    <p className="font-display font-bold text-[15px] text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors italic">
                      &ldquo;{item.jargon}&rdquo;
                    </p>
                  </div>
                  <ArrowRightLeft className="w-5 h-5 text-accent-blue/20 group-hover:text-accent-blue/40 transition-all mt-4 transform group-hover:rotate-180 duration-1000" />
                </div>

                <div className="space-y-3 pt-5 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={16} className="text-accent-blue/60" />
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-accent-blue">Elite Realism</span>
                  </div>
                  <p className="font-serif italic text-[17px] text-foreground/90 leading-relaxed font-medium">
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
