import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, ArrowRight, Upload, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveApplication, type TrackedApplication } from "@/components/ApplicationTracker";
import type { Skill, ResumeGapResult } from "@/types/jd";

interface ResumeGapAnalyzerProps {
  skills: Skill[];
  jobTitle?: string;
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerSrc = await import("pdfjs-dist/legacy/build/pdf.worker.mjs?url");
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return fullText.trim();
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export const ResumeGapAnalyzer = ({ skills, jobTitle }: ResumeGapAnalyzerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<ResumeGapResult | null>(null);
  
  const [addedToTracker, setAddedToTracker] = useState(false);
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
    setIsParsing(true);

    try {
      let text = "";
      if (ext === "txt") {
        text = await file.text();
      } else if (ext === "pdf") {
        text = await extractPdfText(file);
      } else if (ext === "docx") {
        text = await extractDocxText(file);
      }

      if (text.trim().length < 20) {
        toast.error("Could not extract enough text from the file. Try pasting manually.");
        setFileName("");
      } else {
        setResumeText(text);
        toast.success("Resume parsed successfully.");
      }
    } catch (err: any) {
      console.error("File parse error:", err);
      toast.error("Failed to parse file. Try pasting text manually.");
      setFileName("");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCompare = async () => {
    if (resumeText.trim().length < 20) {
      toast.error("Please upload a resume or paste text (min 20 characters).");
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    setAddedToTracker(false);
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

  const handleAddToTracker = async () => {
    if (!result) return;
    const company = prompt("Company name?");
    if (!company) return;

    const app: TrackedApplication = {
      id: crypto.randomUUID(),
      company,
      role: jobTitle || "Unknown Role",
      matchPercent: result.overall_match,
      currentMatchPercent: result.overall_match,
      status: "Saved",
      addedAt: new Date().toISOString(),
    };

    try {
      await saveApplication(app);
      setAddedToTracker(true);
      window.dispatchEvent(new Event("tracker-updated"));
      toast.success("Added to tracker!");
    } catch {
      toast.error("Failed to save. Please sign in first.");
    }
  };

  const getBarColor = (verdict: string) => {
    if (verdict === "strong") return "from-[hsl(160,64%,36%)] to-[hsl(155,55%,48%)]";
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
                  <span className="text-sm font-medium text-foreground">Upload Resume</span>
                  <span className="text-xs text-muted-foreground">PDF, DOCX, or TXT (max 10MB)</span>
                </div>
              )}
            </div>

            <details className="mb-3">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Or paste resume text manually
              </summary>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-32 bg-background rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans text-sm leading-relaxed border border-border mt-2"
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
            {/* Overall match + Add to Tracker */}
            <div className="mb-4 text-center">
              <span className="text-3xl font-display font-bold text-foreground">{result.overall_match}%</span>
              <span className="text-sm text-muted-foreground ml-2">Overall Match</span>

              {!addedToTracker ? (
                <button
                  onClick={handleAddToTracker}
                  className="ml-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add to Tracker
                </button>
              ) : (
                <span className="ml-4 text-xs text-[hsl(var(--skill-core))] font-semibold">✓ Tracked</span>
              )}
            </div>

            {/* Why Not 100% — Always Visible & Prominent */}
            {result.deductions && result.deductions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-5 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/15">
                    <span className="text-destructive text-xs font-bold">!</span>
                  </div>
                  <h4 className="text-sm font-bold text-destructive">
                    Why Not 100%? — Fix These to Improve Your Score
                  </h4>
                </div>
                <div className="space-y-2">
                  {result.deductions.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 bg-background/60 rounded-lg px-3 py-2 border border-destructive/10">
                      <span className="text-destructive font-extrabold text-sm whitespace-nowrap mt-0.5">-{d.percent}%</span>
                      <span className="text-sm text-foreground leading-snug">{d.reason}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground italic">
                  Address these gaps to push your match score closer to 100%.
                </p>
              </motion.div>
            )}

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
                          ? "text-[hsl(var(--skill-core))] bg-[hsl(var(--skill-core)/0.12)]"
                          : sm.verdict === "partial"
                          ? "text-amber-600 bg-amber-500/10"
                          : "text-destructive bg-destructive/10"
                      }`}>
                        {getVerdictLabel(sm.verdict)}
                      </span>
                      {sm.match_percent}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted/50 overflow-hidden">
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
