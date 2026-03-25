import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Skill, ResumeGapResult } from "@/types/jd";

interface ResumeGapAnalyzerProps {
  skills: Skill[];
}

export const ResumeGapAnalyzer = ({ skills }: ResumeGapAnalyzerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeGapResult | null>(null);

  const handleCompare = async () => {
    if (resumeText.trim().length < 20) {
      toast.error("Please paste your resume (min 20 characters).");
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("compare-resume", {
        body: { resumeText, skills },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data);
      toast.success(`Resume match: ${data.overall_match}%`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to analyze resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getBarColor = (verdict: string) => {
    if (verdict === "strong") return "from-emerald-500 to-green-400";
    if (verdict === "partial") return "from-amber-500 to-yellow-400";
    return "from-red-500 to-rose-400";
  };

  const getVerdictLabel = (verdict: string) => {
    if (verdict === "strong") return "Strong Match";
    if (verdict === "partial") return "Partial";
    return "Gap";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-strong rounded-2xl p-6 glow-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            Resume Gap Analyzer
          </h3>
        </div>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-all"
          >
            Compare Resume <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-40 bg-transparent rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans text-sm leading-relaxed border border-border mb-3"
              disabled={isAnalyzing}
            />
            <button
              onClick={handleCompare}
              disabled={isAnalyzing || resumeText.trim().length < 20}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-all disabled:opacity-40"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                "Run Gap Analysis"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-5"
          >
            {/* Overall match */}
            <div className="mb-4 text-center">
              <span className="text-3xl font-display font-bold text-foreground">{result.overall_match}%</span>
              <span className="text-sm text-muted-foreground ml-2">Overall Match</span>
            </div>

            {/* Skill bars */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {result.skill_matches.map((sm, i) => (
                <motion.div
                  key={sm.skill}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-foreground">{sm.skill}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        sm.verdict === "strong"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : sm.verdict === "partial"
                          ? "text-amber-400 bg-amber-500/10"
                          : "text-red-400 bg-red-500/10"
                      }`}>
                        {getVerdictLabel(sm.verdict)}
                      </span>
                      {sm.match_percent}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted/50 overflow-hidden glass">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sm.match_percent}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${getBarColor(sm.verdict)}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{sm.note}</p>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed glass rounded-xl p-3">
              {result.summary}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
