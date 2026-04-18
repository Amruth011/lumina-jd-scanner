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
      case "S": return "text-accent-blue shadow-[0_0_20px_rgba(var(--accent-blue-rgb),0.3)] border-accent-blue/30";
      case "A": return "text-accent-emerald shadow-[0_0_20px_rgba(var(--accent-emerald-rgb),0.3)] border-accent-emerald/30";
      case "B": return "text-accent-emerald/80 border-accent-emerald/20";
      case "C": return "text-accent-gold border-accent-gold/20";
      case "D": case "F": return "text-red-400 border-red-400/20";
      default: return "text-foreground border-border";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group border-white/5"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
      
      <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
        <div className="flex flex-col items-center">
            <div className={`text-8xl md:text-9xl font-serif italic font-black transition-all duration-700 ${getGradeColor(grade.letter)}`}>
              {grade.letter}
            </div>
            <div className="mt-2 text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground opacity-50">
              Verdict
            </div>
        </div>

        <div className="flex-1 space-y-8">
          <div>
            <h4 className="text-2xl md:text-3xl font-serif italic text-foreground leading-tight tracking-tight">
              &ldquo;{grade.summary}&rdquo;
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4">
            {Object.entries(grade.breakdown).map(([key, value], idx) => {
              const Icon = getSectionIcon(key);
              const max = key === "clarity" ? 20 : key === "benefits" || key === "growth" ? 10 : 15;
              const percent = (value / max) * 100;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={12} className="text-primary/60" />
                    <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground capitalize">
                      {key.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-sm font-display font-bold">{value}</span>
                    <span className="text-[10px] text-muted-foreground pb-0.5 opacity-40">/{max}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                      className={`h-full ${percent > 75 ? 'bg-accent-emerald' : percent > 40 ? 'bg-accent-gold' : 'bg-red-400'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
