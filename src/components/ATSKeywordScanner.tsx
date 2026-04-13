import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, XCircle, Zap, Brain } from "lucide-react";
import type { Skill } from "@/types/jd";

interface ATSKeywordScannerProps {
  skills: Skill[];
  aiInsight?: string;
}

export const ATSKeywordScanner = ({ skills, aiInsight }: ATSKeywordScannerProps) => {
  const [checkedKeywords, setCheckedKeywords] = useState<Set<string>>(new Set());

  const keywords = useMemo(() => {
    return skills.map(s => ({
      word: s.skill,
      importance: s.importance,
      category: s.category,
    }));
  }, [skills]);

  const toggleKeyword = (word: string) => {
    setCheckedKeywords(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const coveragePercent = keywords.length > 0
    ? Math.round((checkedKeywords.size / keywords.length) * 100)
    : 0;

  const getImportanceStyles = (importance: number) => {
    if (importance > 80) return "border-accent-red/10 bg-accent-red/5 text-muted-foreground/90";
    if (importance > 50) return "border-accent-amber/10 bg-accent-amber/5 text-muted-foreground/90";
    return "border-border/40 bg-muted/20 text-muted-foreground/70";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="premium-card rounded-2xl p-6"
    >
      {/* AI Insight */}
      {aiInsight && (
        <div className="flex items-start gap-3 mb-8 pb-6 border-b border-border/30">
          <div className="w-9 h-9 rounded-xl bg-accent-blue/5 flex items-center justify-center flex-shrink-0 mt-0.5 border border-accent-blue/10">
            <Brain className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-tag text-muted-foreground/60 mb-1">AI Analyst Insight</h4>
            <p className="text-sm text-foreground/85 leading-relaxed font-medium">{aiInsight}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/5">
            <Search className="w-5 h-5 text-foreground/70" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg md:text-xl text-foreground tracking-tight">
              ATS Keyword Scanner
            </h3>
            <p className="text-tag text-muted-foreground/60">Verify keywords present in your resume</p>
          </div>
        </div>

        {/* Coverage */}
        <div className="flex items-center gap-4 min-w-[160px]">
          <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${coveragePercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.05)] ${
                coveragePercent >= 80 ? "bg-accent-emerald" :
                coveragePercent >= 50 ? "bg-accent-amber" : "bg-accent-red"
              }`}
            />
          </div>
          <span className={`text-[13px] font-bold font-mono tracking-tighter whitespace-nowrap px-2 py-0.5 rounded-md ${
            coveragePercent >= 80 ? "bg-accent-emerald/10 text-accent-emerald" :
            coveragePercent >= 50 ? "bg-accent-amber/10 text-accent-amber" : "bg-accent-red/10 text-accent-red"
          }`}>
            {coveragePercent}%
          </span>
        </div>
      </div>

      {/* Keyword Chips */}
      <div className="flex flex-wrap gap-2.5">
        {keywords.map((kw, i) => {
          const isChecked = checkedKeywords.has(kw.word);
          return (
            <motion.button
              key={kw.word}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.02 * i, type: "spring", stiffness: 300 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleKeyword(kw.word)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-display font-bold border transition-all duration-300 cursor-pointer shadow-sm ${
                isChecked
                  ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/40 shadow-accent-emerald/5"
                  : getImportanceStyles(kw.importance)
              }`}
            >
              {isChecked ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5 opacity-20" />
              )}
              {kw.word}
              {kw.importance > 80 && !isChecked && (
                <Zap className="w-3 h-3 text-accent-red/60 ml-0.5" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-8 pt-5 border-t border-border/20">
        <span className="flex items-center gap-2 text-tag text-muted-foreground/60">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-red/30 flex items-center justify-center"><Zap className="w-1.5 h-1.5 text-accent-red" /></div> Critical
        </span>
        <span className="flex items-center gap-2 text-tag text-muted-foreground/60">
          <div className="w-2 h-2 rounded-full bg-accent-amber/40" /> Important
        </span>
        <span className="flex items-center gap-2 text-tag text-muted-foreground/60">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/20" /> Supporting
        </span>
      </div>
    </motion.div>
  );
};
