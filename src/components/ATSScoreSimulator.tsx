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

    const formattingScore = 100; 

    const overallScore = Math.round(
      (result.overall_match * 0.7) + (keywordRate * 0.3)
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
      className={`rounded-[40px] p-10 premium-card relative overflow-hidden transition-all duration-700 ${
        verdict.pass
          ? "border-accent-emerald/20 hover:border-accent-emerald/40"
          : "border-accent-red/20 hover:border-accent-red/40"
      }`}
    >
      <div className={`absolute top-0 right-0 p-12 opacity-5 pointer-events-none`}>
        {verdict.pass ? <ShieldCheck className="w-64 h-64 -rotate-12" /> : <ShieldX className="w-64 h-64 rotate-12" />}
      </div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-10 mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xl ${
              verdict.pass ? "bg-accent-emerald/10 border-accent-emerald/20" : "bg-accent-red/10 border-accent-red/20"
            }`}
          >
            {verdict.pass ? (
              <ShieldCheck className="w-7 h-7 text-accent-emerald" />
            ) : (
              <ShieldX className="w-7 h-7 text-accent-red" />
            )}
          </motion.div>
          <div>
            <h4 className={`text-4xl font-display font-black tracking-tighter leading-none mb-2 ${
              verdict.pass ? "text-accent-emerald" : "text-accent-red"
            }`}>
              ATS Verdict: {verdict.pass ? "PASS" : "FAIL"}
            </h4>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">
              Enterprise Grade Simulation Core
            </p>
          </div>
        </div>
        
        <div className="text-center md:text-right">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className={`text-6xl md:text-8xl font-display font-black tracking-tighter block leading-none mb-2 ${
              verdict.pass ? "text-accent-emerald shadow-emerald-500/20" : "text-accent-red shadow-red-500/20"
            }`}
          >
            {verdict.score}%
          </motion.span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 block">Confidence Score</span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        {[
          { label: "Keyword Match", value: verdict.keyword_match_rate },
          { label: "Section Score", value: verdict.section_completeness },
          { label: "Format Score", value: verdict.formatting_score },
        ].map((metric, i) => (
          <div key={metric.label} className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/5 text-center shadow-inner group hover:bg-white/10 transition-all duration-500">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className={`text-4xl font-display font-black block tracking-tighter leading-none mb-4 ${
                metric.value >= 70 ? "text-accent-emerald" :
                metric.value >= 50 ? "text-accent-amber" : "text-accent-red"
              }`}
            >
              {metric.value}%
            </motion.span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/30 block group-hover:text-muted-foreground/60 transition-colors">
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
