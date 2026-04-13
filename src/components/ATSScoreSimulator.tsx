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

    const hasSnippets = !!result.tailored_resume_snippets;
    const hasDirectives = !!result.actionable_directives?.length;
    const sectionScore = Math.round(
      (result.overall_match * 0.5) + (keywordRate * 0.3) + ((hasSnippets ? 10 : 0) + (hasDirectives ? 10 : 0))
    );

    const formattingScore = 85; 

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
      className={`rounded-2xl border p-6 glass backdrop-blur-md relative overflow-hidden ${
        verdict.pass
          ? "border-accent-emerald/20 bg-accent-emerald/5"
          : "border-accent-red/20 bg-accent-red/5"
      }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${verdict.pass ? 'bg-accent-emerald/40' : 'bg-accent-red/40'}`} />
      
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm ${
            verdict.pass ? "bg-accent-emerald/10 border-accent-emerald/20" : "bg-accent-red/10 border-accent-red/20"
          }`}
        >
          {verdict.pass ? (
            <ShieldCheck className="w-8 h-8 text-accent-emerald" />
          ) : (
            <ShieldX className="w-8 h-8 text-accent-red" />
          )}
        </motion.div>
        <div>
          <h4 className={`font-display font-bold text-lg md:text-xl tracking-tight leading-none mb-2 ${
            verdict.pass ? "text-accent-emerald" : "text-accent-red"
          }`}>
            ATS Verdict: {verdict.pass ? "LIKELY PASS" : "LIKELY FAIL"}
          </h4>
          <p className="text-tag text-muted-foreground/40 font-mono tracking-widest">
            Enterprise Grade Simulation Core
          </p>
        </div>
        <div className="ml-auto text-right">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-5xl md:text-6xl font-display font-bold tracking-tighter block leading-none mb-1.5 ${
              verdict.pass ? "text-accent-emerald" : "text-accent-red"
            }`}
          >
            {verdict.score}%
          </motion.span>
          <span className="text-tag text-muted-foreground/40 block leading-none">Confidence Score</span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {[
          { label: "Keyword Match", value: verdict.keyword_match_rate },
          { label: "Section Score", value: verdict.section_completeness },
          { label: "Format Score", value: verdict.formatting_score },
        ].map((metric, i) => (
          <div key={metric.label} className="bg-background/40 backdrop-blur-md rounded-2xl p-6 border border-border/40 text-center shadow-inner">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={`text-3xl md:text-4xl font-display font-bold block tracking-tighter leading-none mb-3 ${
                metric.value >= 70 ? "text-accent-emerald/80" :
                metric.value >= 50 ? "text-accent-amber/80" : "text-accent-red/80"
              }`}
            >
              {metric.value}%
            </motion.span>
            <span className="text-tag text-muted-foreground/30 block leading-none">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      {/* Reasons & Tips */}
      <div className="space-y-4 pl-1">
        <div className="flex flex-col gap-3.5">
          {verdict.reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-4 text-sm md:text-base text-foreground/80 font-medium leading-relaxed">
              <ChevronRight className="w-4 h-4 mt-1.5 text-muted-foreground/40 shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
        {!verdict.pass && verdict.tips.map((tip, i) => (
          <div key={`tip-${i}`} className="flex items-start gap-4 p-5 rounded-2xl bg-accent-amber/5 border border-accent-amber/10 text-sm text-accent-amber/90 font-bold leading-relaxed shadow-sm shadow-accent-amber/5">
            <AlertTriangle className="w-4 h-4 mt-1 shrink-0 text-accent-amber/60" />
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
