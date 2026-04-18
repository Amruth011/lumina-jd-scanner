import { motion } from "framer-motion";
import { ShieldCheck, Target, TrendingUp, AlertCircle, Bookmark, Zap } from "lucide-react";
import type { DetailedJdGrade } from "@/types/jd";

interface JdVerdictCardProps {
  grade?: DetailedJdGrade;
}

export const JdVerdictCard = ({ grade }: JdVerdictCardProps) => {
  if (!grade) return null;

  const getGradeColor = (letter: string) => {
    switch (letter[0]) {
      case "S": return "text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]";
      case "A": return "text-accent-emerald shadow-[0_0_30px_rgba(var(--accent-emerald-rgb),0.2)]";
      case "B": return "text-accent-emerald/80";
      case "C": return "text-accent-gold";
      case "D": case "F": return "text-red-400";
      default: return "text-foreground";
    }
  };

  const getSectionIcon = (key: string) => {
    switch (key) {
      case "clarity": return Target;
      case "realistic": return ShieldCheck;
      case "compensation": return TrendingUp;
      case "red_flags": return AlertCircle;
      case "benefits": return Bookmark;
      case "growth": return Zap;
      default: return Target;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-10 rounded-[3rem] h-full relative overflow-hidden flex flex-col items-center justify-between border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mt-24 pointer-events-none" />
      
      <div className="text-center space-y-2 relative z-10">
        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground opacity-50 block">Letter Grade</span>
        <div className={`text-9xl font-serif italic font-black transition-all duration-700 ${getGradeColor(grade.letter)}`}>
          {grade.letter}
        </div>
      </div>

      <div className="space-y-6 w-full relative z-10">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <p className="text-center text-sm font-medium text-muted-foreground leading-relaxed italic">
          &ldquo;{grade.summary}&rdquo;
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {Object.entries(grade?.breakdown || {}).slice(0, 4).map(([key, value], idx) => {
            const Icon = getSectionIcon(key);
            const val = (value as number);
            const max = key === "clarity" ? 20 : key === "benefits" || key === "growth" ? 10 : 15;
            const percent = (val / max) * 100;
            
            return (
              <div key={key} className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <Icon size={10} className="text-primary/60" />
                  <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground truncate">
                    {key.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xs font-display font-bold">{value}</span>
                  <span className="text-[8px] text-muted-foreground opacity-40">/{max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
