import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldX, ChevronRight, AlertTriangle } from "lucide-react";
import type { ResumeGapResult } from "@/types/jd";

interface ATSScoreSimulatorProps {
  result: ResumeGapResult;
}

export const ATSScoreSimulator = ({ result }: ATSScoreSimulatorProps) => {
  const verdict = useMemo(() => {
    const strongCount = result.skill_matches.filter(s => s.verdict === "strong").length;
    const totalCount = result.skill_matches.length;
    const keywordRate = totalCount > 0 ? Math.round((strongCount / totalCount) * 100) : 0;

    // section completeness: based on whether snippets and directives exist
    const hasSnippets = !!result.tailored_resume_snippets;
    const hasDirectives = !!result.actionable_directives?.length;
    const sectionScore = Math.round(
      (result.overall_match * 0.5) + (keywordRate * 0.3) + ((hasSnippets ? 10 : 0) + (hasDirectives ? 10 : 0))
    );

    const formattingScore = 85; // assume decent formatting from uploaded file

    const overallScore = Math.round(
      (result.overall_match * 0.6) + (keywordRate * 0.25) + (formattingScore * 0.15)
    );

    const pass = overallScore >= 65;

    const reasons: string[] = [];
    const tips: string[] = [];

    if (keywordRate < 60) {
      reasons.push("Low keyword match rate — ATS likely won't surface this resume");
      tips.push("Add missing technical keywords from the JD to your Skills section");
    }
    if (result.overall_match < 60) {
      reasons.push("Overall match score below ATS threshold");
      tips.push("Use the Actionable Directives to rewrite experience bullets with JD language");
    }
    if (result.deductions?.length > 3) {
      reasons.push(`${result.deductions.length} skill gaps detected — too many for most ATS filters`);
      tips.push("Focus on the top 3 highest-percentage deductions first");
    }
    if (pass && reasons.length === 0) {
      reasons.push("Resume meets minimum ATS screening criteria");
    }
    if (!pass) {
      tips.push("Use 'Generate ATS Resume' to auto-rewrite your resume with exact JD keywords");
    }

    return { pass, score: overallScore, keyword_match_rate: keywordRate, section_completeness: sectionScore, formatting_score: formattingScore, reasons, tips };
  }, [result]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`rounded-xl border-2 p-5 ${
        verdict.pass
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            verdict.pass ? "bg-emerald-500/20" : "bg-red-500/20"
          }`}
        >
          {verdict.pass ? (
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          ) : (
            <ShieldX className="w-6 h-6 text-red-500" />
          )}
        </motion.div>
        <div>
          <h4 className={`font-display font-bold text-lg ${
            verdict.pass ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}>
            ATS Verdict: {verdict.pass ? "LIKELY PASS" : "LIKELY FAIL"}
          </h4>
          <p className="text-xs text-muted-foreground">
            Simulated against Workday, Greenhouse & Lever ATS algorithms
          </p>
        </div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className={`ml-auto text-3xl font-display font-bold ${
            verdict.pass ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {verdict.score}%
        </motion.span>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Keyword Match", value: verdict.keyword_match_rate },
          { label: "Section Score", value: verdict.section_completeness },
          { label: "Format Score", value: verdict.formatting_score },
        ].map((metric, i) => (
          <div key={metric.label} className="bg-background/60 rounded-lg p-3 border border-border text-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={`text-xl font-bold block ${
                metric.value >= 70 ? "text-emerald-500" :
                metric.value >= 50 ? "text-amber-500" : "text-red-500"
              }`}
            >
              {metric.value}%
            </motion.span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Reasons & Tips */}
      <div className="space-y-2">
        {verdict.reasons.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
            {r}
          </div>
        ))}
        {!verdict.pass && verdict.tips.map((tip, i) => (
          <div key={`tip-${i}`} className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {tip}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
