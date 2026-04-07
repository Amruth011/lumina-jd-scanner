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

  const getImportanceColor = (importance: number) => {
    if (importance > 80) return "border-red-500/20 bg-red-500/5 dark:bg-red-500/8";
    if (importance > 50) return "border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/8";
    return "border-border/50 bg-muted/20";
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
        <div className="flex items-start gap-3 mb-6 pb-5 border-b border-border/30">
          <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Brain className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">AI Insight</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{aiInsight}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-foreground/5 flex items-center justify-center">
            <Search className="w-4 h-4 text-foreground/60" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base text-foreground">
              ATS Keyword Scanner
            </h3>
            <p className="text-[11px] text-muted-foreground/60">Tap keywords already in your resume</p>
          </div>
        </div>

        {/* Coverage */}
        <div className="flex items-center gap-3 min-w-[140px]">
          <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${coveragePercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${
                coveragePercent >= 80 ? "bg-emerald-500" :
                coveragePercent >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </div>
          <span className={`text-sm font-bold font-mono whitespace-nowrap ${
            coveragePercent >= 80 ? "text-emerald-500" :
            coveragePercent >= 50 ? "text-amber-500" : "text-red-500"
          }`}>
            {coveragePercent}%
          </span>
        </div>
      </div>

      {/* Keyword Chips */}
      <div className="flex flex-wrap gap-2">
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer ${
                isChecked
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : getImportanceColor(kw.importance)
              }`}
            >
              {isChecked ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3 text-muted-foreground/40" />
              )}
              {kw.word}
              {kw.importance > 80 && !isChecked && (
                <Zap className="w-3 h-3 text-red-500/60 ml-0.5" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border/30">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          <Zap className="w-3 h-3 text-red-500/50" /> Critical
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" /> Important
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" /> Supporting
        </span>
      </div>
    </motion.div>
  );
};
