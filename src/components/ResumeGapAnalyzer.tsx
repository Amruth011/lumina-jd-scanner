import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, ArrowRight, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Skill, ResumeGapResult } from "@/types/jd";

interface ResumeGapAnalyzerProps {
  skills: Skill[];
}

export const ResumeGapAnalyzer = ({ skills }: ResumeGapAnalyzerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<ResumeGapResult | null>(null);
  const [showDeductions, setShowDeductions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().split(".").pop();
    if (!["pdf", "docx", "txt"].includes(ext || "")) {
      toast.error("Supported formats: PDF, DOCX, TXT");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB).");
      return;
    }

    setFileName(file.name);

    if (ext === "txt") {
      const text = await file.text();
      setResumeText(text);
      toast.success("Resume text loaded.");
      return;
    }

    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume-file`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to parse file.");
      }

      const data = await response.json();
      setResumeText(data.text);
      toast.success("Resume parsed successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to parse resume file.");
      setFileName("");
    } finally {
      setIsParsing(false);
    }
  };

  const handleCompare = async () => {
    if (resumeText.trim().length < 20) {
      toast.error("Please upload a resume or paste text (min 20 characters).");
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
            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 mb-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isParsing || isAnalyzing}
              />
              {isParsing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Parsing {fileName}...</span>
                </div>
              ) : fileName ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-foreground">{fileName}</span>
                  <span className="text-xs text-muted-foreground">Click to replace</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Upload Resume
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PDF, DOCX, or TXT (max 10MB)
                  </span>
                </div>
              )}
            </div>

            {/* Or paste text */}
            <details className="mb-3">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Or paste resume text manually
              </summary>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-32 bg-transparent rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans text-sm leading-relaxed border border-border mt-2"
                disabled={isAnalyzing}
              />
            </details>

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
            {/* Overall match + Why not 100% */}
            <div className="mb-4 text-center">
              <span className="text-3xl font-display font-bold text-foreground">{result.overall_match}%</span>
              <span className="text-sm text-muted-foreground ml-2">Overall Match</span>

              {result.deductions && result.deductions.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowDeductions(!showDeductions)}
                    className="inline-flex items-center gap-1 text-xs text-destructive/80 hover:text-destructive transition-colors font-medium"
                  >
                    Why not 100%?
                    {showDeductions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {showDeductions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 glass rounded-xl p-3 text-left max-w-md mx-auto"
                      >
                        <p className="text-xs font-semibold text-foreground mb-2">Deductions</p>
                        <ul className="space-y-1">
                          {result.deductions.map((d, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs">
                              <span className="text-destructive font-bold">-{d.percent}%</span>
                              <span className="text-muted-foreground">{d.reason}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
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
