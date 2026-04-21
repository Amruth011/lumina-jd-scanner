import { motion } from "framer-motion";
import { ShieldCheck, Target, TrendingUp, AlertCircle, Bookmark, Zap } from "lucide-react";
import type { DetailedJdGrade } from "@/types/jd";

interface JdVerdictCardProps {
  grade?: DetailedJdGrade;
}

export const JdVerdictCard = ({ grade }: JdVerdictCardProps) => {
  if (!grade) return null;

  const getGradeColor = (letter: string) => {
    if (!letter) return "text-foreground";
    const L = String(letter)[0]?.toUpperCase();
    switch (L) {
      case "S": return "text-primary";
      case "A": return "text-accent-emerald";
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
      className="glass-panel p-10 h-full relative overflow-hidden flex flex-col items-center justify-between"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full -mt-24 pointer-events-none" />
      
      <div className="text-center space-y-3 relative z-10">
        <span className="text-[12px] uppercase font-black tracking-[0.3em] text-muted-foreground opacity-80 block">Global Verdict</span>
        <div className={`text-9xl font-serif italic font-black transition-all duration-700 ${getGradeColor(String(grade.letter))}`}>
          {String(grade.letter)}
        </div>
      </div>

      <div className="space-y-8 w-full relative z-10">
        <div className="h-px w-full bg-foreground/10" />
        
        <p className="text-center text-[15px] font-medium text-foreground leading-relaxed italic px-2">
          &ldquo;{String(grade.summary || "Intelligence analysis in progress...")}&rdquo;
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4">
          {Object.entries(grade?.breakdown || {}).slice(0, 4).map(([key, value], idx) => {
            const Icon = getSectionIcon(key);
            const val = (value as number);
            const max = key === "clarity" ? 20 : key === "benefits" || key === "growth" ? 10 : 15;
            
            return (
              <div key={key} className="space-y-2.5 p-4 rounded-2xl bg-foreground/5 border border-foreground/5 hover:bg-foreground/10 transition-all">
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className="text-primary/60" />
                  <span className="text-[12px] uppercase font-black tracking-widest text-muted-foreground/80 truncate">
                    {String(key).replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-sm font-display font-black text-foreground">{value}</span>
                  <span className="text-[12px] uppercase font-black text-muted-foreground opacity-40">/ {max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
