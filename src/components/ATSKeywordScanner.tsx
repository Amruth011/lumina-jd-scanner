import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, XCircle, Zap } from "lucide-react";
import type { Skill } from "@/types/jd";

interface ATSKeywordScannerProps {
  skills: Skill[];
}

export const ATSKeywordScanner = ({ skills }: ATSKeywordScannerProps) => {
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
    if (importance > 80) return "border-red-500/40 bg-red-500/5 dark:bg-red-500/10";
    if (importance > 50) return "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10";
    return "border-border bg-secondary/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-strong rounded-2xl p-6 glow-border"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 15 }}
            className="p-2 rounded-lg bg-primary/10"
          >
            <Search className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground">
              ATS Keyword Scanner
            </h3>
            <p className="text-xs text-muted-foreground">Click keywords you already have in your resume</p>
          </div>
        </div>

        {/* Coverage Bar */}
        <div className="flex items-center gap-3 min-w-[160px]">
          <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
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
          <span className={`text-sm font-bold whitespace-nowrap ${
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.02 * i, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleKeyword(kw.word)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                isChecked
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-sm"
                  : getImportanceColor(kw.importance)
              }`}
            >
              {isChecked ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3 text-muted-foreground" />
              )}
              {kw.word}
              {kw.importance > 80 && !isChecked && (
                <Zap className="w-3 h-3 text-red-500 ml-0.5" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Zap className="w-3 h-3 text-red-500" /> Critical (80%+)
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Important (50-80%)
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-muted-foreground" /> Supporting
        </span>
      </div>
    </motion.div>
  );
};
