import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, ArrowRight, Upload, PlusCircle as PlusCircleIcon, AlertTriangle, CheckCircle2, XCircle, Sparkles, Copy, ShieldCheck, Edit3, Trash2, Plus, Download, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveApplication, type TrackedApplication } from "@/hooks/useApplications";
import type { Skill, ResumeGapResult } from "@/types/jd";
import { computeDeterministicScore } from "@/lib/deterministicScorer";
import { getCachedResumeAnalysis, setCachedResumeAnalysis } from "@/lib/resumeAnalysisCache";
import jsPDF from "jspdf";

interface ResumeGapAnalyzerProps {
  skills: Skill[];
  jobTitle?: string;
  jdText?: string;
  onResumeTextChange?: (text: string) => void;
  onResultChange?: (result: ResumeGapResult | null) => void;
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

export const ResumeGapAnalyzer = ({ skills, jobTitle, jdText, onResumeTextChange, onResultChange }: ResumeGapAnalyzerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<ResumeGapResult | null>(null);
  const [addedToTracker, setAddedToTracker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);
  const [generatedBullets, setGeneratedBullets] = useState<Record<number, string>>({});
  const [isAutoRunEnabled, setIsAutoRunEnabled] = useState(true);
  const [lastAnalyzedText, setLastAnalyzedText] = useState("");
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleExportPDF = async () => {
    if (!result) return;
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 20;
      let y = margin;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const wrapText = (text: string, maxWidth: number) => pdf.splitTextToSize(text, maxWidth);

      const addText = (text: string, size: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = wrapText(text, pageWidth - margin * 2);

        lines.forEach((line: string) => {
          if (y > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(line, margin, y);
          y += size * 0.4;
        });
        y += size * 0.2;
      };

      addText("Lumina JD - Strategy to Reach 100% Match", 18, true, [48, 86, 211]);
      y += 10;
      addText(`Current Match Score: ${result.overall_match}%`, 14, true);
      addText("Target Score: 100%", 14, true, [16, 185, 129]);
      y += 5;

      addText("Critical Gaps to Fix", 14, true, [220, 38, 38]);
      if (result.deductions?.length) {
        result.deductions.forEach((d) => addText(`- (-${d.percent}%) ${d.reason}`, 12));
      } else {
        addText("No major gaps found.", 12);
      }
      y += 5;

      addText("Step-by-step Action Plan", 14, true, [16, 185, 129]);
      if (result.actionable_directives?.length) {
        result.actionable_directives.forEach((d) => {
          addText(`Action: ${d.action.toUpperCase()} - ${d.description}`, 12, true);
          addText(d.reasoning, 12);
          y += 2;
        });
      } else {
        addText("Review your skills and ensure they are prominent.", 12);
      }
      y += 5;

      if (result.tailored_resume_snippets) {
        addText("Ready-to-Use Resume Snippets", 14, true, [147, 51, 234]);
        addText("Professional Summary:", 12, true);
        addText(result.tailored_resume_snippets.professional_summary, 12);
        y += 3;
        addText("Experience Bullets to Add/Replace:", 12, true);
        result.tailored_resume_snippets.experience_bullets.forEach((bullet: string) => {
          addText(`• ${bullet}`, 12);
        });
      }

      pdf.save("Lumina-Gap-Analysis.pdf");
      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF.");
    }
  };

  const handleGenerateBullet = async (index: number, reason: string) => {
    setGeneratingFor(index);
    try {
      const { data, error } = await supabase.functions.invoke("generate-bullet", {
        body: { gapReason: reason, resumeContext: resumeText, jobTitle },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setGeneratedBullets((prev) => ({
        ...prev,
        [index]: data.bullet || `Spearheaded initiatives addressing ${reason}, driving measurable improvements in project delivery.`,
      }));
    } catch (err: any) {
      console.error("Bullet generation error:", err);
      const keywords = reason.replace(/missing/i, "").trim();
      setGeneratedBullets((prev) => ({
        ...prev,
        [index]: `Led cross-functional initiatives in ${keywords || "this domain"}, resulting in measurable efficiency gains and stakeholder alignment.`,
      }));
      toast.error("Using fallback — deploy generate-bullet function for real AI bullets.");
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleCopyBullet = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Bullet point copied to clipboard!");
  };

  const processFile = async (file: File) => {
    const ext = file.name.toLowerCase().split(".").pop();
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
        setResult(null);
        onResultChange?.(null);
        setGeneratedBullets({});
        setLastAnalyzedText("");
        setAddedToTracker(false);
        setResumeText(text);
        onResumeTextChange?.(text);
        toast.success("Resume parsed successfully — previous results cleared.");
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

    if (result) {
      setPendingFile(file);
      setShowReplaceDialog(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    await processFile(file);
  };

  const handleReplaceSave = async () => {
    await handleExportPDF();
    setShowReplaceDialog(false);
    if (pendingFile) {
      await processFile(pendingFile);
      setPendingFile(null);
    }
  };

  const handleReplaceDiscard = async () => {
    setShowReplaceDialog(false);
    if (pendingFile) {
      await processFile(pendingFile);
      setPendingFile(null);
    }
  };

  const handleReplaceCancel = () => {
    setShowReplaceDialog(false);
    setPendingFile(null);
  };

  const handleCompare = async () => {
    const trimmedResume = resumeText.trim();
    if (trimmedResume.length < 20) {
      toast.error("Please upload a resume or paste text (min 20 characters).");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setAddedToTracker(false);
    try {
      // ── DETERMINISTIC IDENTITY CHECK (Hotfix) ──
      if (jdText?.trim() === resumeText.trim()) {
        const identityResult: ResumeGapResult = {
          overall_match: 100,
          skill_matches: skills.map(s => ({
            skill: s.skill,
            match_percent: 100,
            verdict: "strong",
            note: "Identity Match: This resume is identical to the job description."
          })),
          deductions: [],
          summary: "100% Perfect Match - Identity Detected. Your resume is identical to the job description.",
        };
        setResult(identityResult);
        onResultChange?.(identityResult);
        setLastAnalyzedText(resumeText);
        toast.success("Identity match: 100%!", { 
          icon: "🔥",
          duration: 5000
        });
        return;
      }

      const cachedResult = await getCachedResumeAnalysis(trimmedResume, skills);
      if (cachedResult) {
        setResult(cachedResult);
        onResultChange?.(cachedResult);
        setLastAnalyzedText(trimmedResume);
        toast.success(`Resume match: ${cachedResult.overall_match}% (locked)`);
        return;
      }

      const deterministicResult = computeDeterministicScore(trimmedResume, skills);

      let aiResult: any = null;
      try {
        const { data, error } = await supabase.functions.invoke("compare-resume", {
          body: { resumeText: trimmedResume, skills },
        });
        if (!error && !data?.error) {
          aiResult = data;
        }
      } catch (aiErr) {
        console.warn("AI analysis failed, using deterministic scoring only:", aiErr);
      }

      const baseResult: ResumeGapResult = {
        overall_match: deterministicResult.overall_match,
        skill_matches: deterministicResult.skill_matches.map((sm) => ({
          skill: sm.skill,
          match_percent: sm.match_percent,
          verdict: sm.verdict,
          note: sm.note,
        })),
        deductions: deterministicResult.deductions.map((d) => ({
          reason: d.reason,
          percent: d.percent,
        })),
        summary: `Your resume matches ${deterministicResult.overall_match}% of the required skills. ${deterministicResult.skill_matches.filter((s) => s.verdict === "missing").length} skills are missing and ${deterministicResult.skill_matches.filter((s) => s.verdict === "partial").length} need stronger evidence.`,
      };

      const finalResult: ResumeGapResult = aiResult
        ? {
            ...baseResult,
            summary: aiResult.summary || baseResult.summary,
            deductions: baseResult.deductions.map((d) => {
              const keyword = d.reason.replace("Missing: ", "").replace("Partial match: ", "").split(" —")[0].toLowerCase();
              const aiDed = aiResult.deductions?.find((ad: any) => ad.reason?.toLowerCase().includes(keyword));
              return aiDed?.fix_snippet ? { ...d, fix_snippet: aiDed.fix_snippet } : d;
            }),
            tailored_resume_snippets: aiResult.tailored_resume_snippets || undefined,
            actionable_directives: aiResult.actionable_directives || undefined,
            skill_matches: baseResult.skill_matches.map((sm) => {
              const aiSm = aiResult.skill_matches?.find((a: any) => a.skill === sm.skill);
              return aiSm?.note ? { ...sm, note: aiSm.note } : sm;
            }),
          }
        : baseResult;

      await setCachedResumeAnalysis(trimmedResume, skills, finalResult);
      setResult(finalResult);
      onResultChange?.(finalResult);
      setLastAnalyzedText(trimmedResume);
      toast.success(`Resume match: ${finalResult.overall_match}%`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to analyze resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!isAutoRunEnabled) return;
    const trimmedResume = resumeText.trim();
    if (trimmedResume.length <= 20 || trimmedResume === lastAnalyzedText || isAnalyzing || isParsing) return;
    void handleCompare();
  }, [isAutoRunEnabled, resumeText, lastAnalyzedText, isAnalyzing, isParsing, skills]);

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

  const getVerdictIcon = (verdict: string) => {
    if (verdict === "strong") return <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--skill-core))]" />;
    if (verdict === "partial") return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    return <XCircle className="w-3.5 h-3.5 text-destructive" />;
  };

  const getVerdictLabel = (verdict: string) => {
    if (verdict === "strong") return "Strong Match";
    if (verdict === "partial") return "Partial";
    return "Gap";
  };

  const getMatchColor = (percent: number) => {
    if (percent >= 80) return "text-[hsl(var(--skill-core))]";
    if (percent >= 50) return "text-amber-500";
    return "text-destructive";
  };

  return (
    <>
      {/* Replace Resume Confirmation Dialog */}
      <AnimatePresence>
        {showReplaceDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleReplaceCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-amber-500/10">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">Replace Current Resume?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                You have existing analysis results. Uploading a new resume will erase them. Would you like to save the current results first?
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReplaceSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <Download className="w-4 h-4" /> Save PDF & Replace
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReplaceDiscard}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Discard & Replace
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReplaceCancel}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-strong rounded-2xl p-6 glow-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="p-2 rounded-lg bg-accent/10"
          >
            <FileText className="w-5 h-5 text-accent" />
          </motion.div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            Resume Gap Analyzer
          </h3>
        </div>
        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.05, x: 3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-all"
          >
            Compare Resume <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Trust and Auto-run header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 bg-secondary/30 p-3 rounded-lg border border-border">
               <div className="flex items-center gap-3">
                 <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full"><ShieldCheck className="w-3.5 h-3.5" /> 100% Secure & Private</span>
                 <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> ATS-Optimized</span>
               </div>
               
               <label className="flex items-center gap-2 cursor-pointer bg-background px-3 py-1.5 rounded-md border border-border shadow-sm">
                 <input 
                   type="checkbox" 
                   className="hidden" 
                   checked={isAutoRunEnabled} 
                   onChange={(e) => setIsAutoRunEnabled(e.target.checked)} 
                 />
                 <span className="text-xs font-semibold whitespace-nowrap text-foreground">Auto-Run Analysis</span>
                 <div className={`w-8 h-4 rounded-full transition-colors relative border ${isAutoRunEnabled ? 'bg-emerald-500 border-emerald-500' : 'bg-black/20 dark:bg-black/50 border-border'}`}>
                    <div className={`absolute w-3 h-3 shadow-sm rounded-full top-0.5 transition-transform ${isAutoRunEnabled ? 'translate-x-[18px] bg-white' : 'translate-x-0.5 bg-white dark:bg-zinc-400'}`} />
                 </div>
               </label>
            </div>

            {/* File Upload Area — Drag & Drop + Click */}
            <motion.div
              whileHover={{ borderColor: "hsl(210 100% 52% / 0.4)", background: "hsl(210 100% 52% / 0.03)" }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add("border-primary", "bg-primary/5"); }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary", "bg-primary/5"); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove("border-primary", "bg-primary/5");
                const file = e.dataTransfer.files[0];
                if (file) {
                  const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleFileUpload(fakeEvent);
                }
              }}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 mb-3 cursor-pointer transition-all text-center"
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
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <FileText className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-foreground">{fileName}</span>
                  <span className="text-xs text-muted-foreground">Click or drag to replace</span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </motion.div>
                  <span className="text-sm font-medium text-foreground">Drag & Drop or Click to Upload</span>
                  <span className="text-xs text-muted-foreground">PDF, DOCX, or TXT (max 10MB)</span>
                </div>
              )}
            </motion.div>

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

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              onClick={handleCompare}
              disabled={isAnalyzing || resumeText.trim().length < 20}
              className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold bg-accent text-accent-foreground hover:bg-muted transition-all disabled:opacity-40 specular-highlight premium-button-glow"
            >
              <div className="shimmer-sweep" />
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-1" /> Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-1" /> Run Gap Analysis
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 border border-border/50 rounded-2xl overflow-hidden liquid-glass backdrop-blur-none bg-transparent"
          >
           <div ref={page1Ref} className="bg-background p-5 sm:p-8">
            {/* Overall match score - prominent */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-5 text-center py-6 glass liquid-glass rounded-xl relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative z-10">
                <span className={`text-5xl font-display font-bold ${getMatchColor(result.overall_match)}`}>
                  {result.overall_match}%
                </span>
                <p className="text-sm text-muted-foreground mt-1">Overall Match Score</p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  {!addedToTracker ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddToTracker}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all"
                    >
                      <PlusCircleIcon className="w-3.5 h-3.5" /> Add to Tracker
                    </motion.button>
                  ) : (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-1 text-xs text-[hsl(var(--skill-core))] font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tracked
                    </motion.span>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-accent-foreground bg-accent hover:opacity-90 transition-all border border-accent/20 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" /> Action Plan
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Why Not 100% — Prominent deductions panel */}
            {result.deductions && result.deductions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-5 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-destructive/15"
                  >
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </motion.div>
                  <h4 className="text-sm font-bold text-destructive">
                    Why Not 100%? — Fix These to Improve Your Score
                  </h4>
                </div>
                <div className="space-y-2">
                  {result.deductions.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex flex-col bg-background/60 rounded-xl border border-destructive/20 overflow-hidden"
                    >
                      <div className="flex items-start gap-3 px-4 py-3">
                        <span className="text-destructive font-bold text-sm whitespace-nowrap mt-0.5 min-w-[35px] bg-destructive/10 px-1.5 py-0.5 rounded text-center">-{d.percent}%</span>
                        <div className="flex-1">
                           <span className="text-sm text-foreground leading-snug">{d.reason}</span>
                        </div>
                        <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => handleGenerateBullet(i, d.reason)}
                           disabled={generatingFor === i || !!generatedBullets[i]}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50"
                        >
                           {generatingFor === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                           {generatingFor === i ? "Generating..." : generatedBullets[i] ? "Generated" : "Fix with AI"}
                        </motion.button>
                      </div>

                      {/* Fix Snippet — ready-to-paste suggestion from gap analysis */}
                      {d.fix_snippet && (
                        <div className="bg-emerald-500/5 border-t border-emerald-500/15 px-4 py-2.5 flex gap-2 items-start group relative">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed flex-1">
                            <span className="font-bold">Fix:</span> {d.fix_snippet}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCopyBullet(d.fix_snippet!)}
                            className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy fix snippet"
                          >
                            <Copy className="w-3 h-3" />
                          </motion.button>
                        </div>
                      )}

                      <AnimatePresence>
                        {generatedBullets[i] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="bg-primary/5 border-t border-primary/10 px-4 py-3 flex gap-3 items-start relative group"
                          >
                            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-sm text-foreground/90 font-medium leading-relaxed flex-1">
                              "{generatedBullets[i]}"
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleCopyBullet(generatedBullets[i])}
                              className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 absolute right-2 top-2"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
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
                    <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      {getVerdictIcon(sm.verdict)}
                      {sm.skill}
                    </span>
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
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="mt-4 glass rounded-xl p-4 relative overflow-hidden"
             >
               <motion.div
                 className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"
               />
               <p className="text-sm text-muted-foreground leading-relaxed pl-3">
                 {result.summary}
               </p>
             </motion.div>
           </div>{/* END PAGE 1 */}
           
           <div ref={page2Ref} className="bg-background/50 border-t border-border p-5 sm:p-8">
             {/* Actionable Directives */}
             {(result.actionable_directives && result.actionable_directives.length > 0) && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="mt-0"
               >
                 <div className="flex items-center gap-2 mb-4">
                    <Edit3 className="w-5 h-5 text-primary" />
                    <h4 className="font-display font-semibold text-lg text-primary">Required Resume Changes</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {result.actionable_directives.map((dir, idx) => {
                     let Icon = Edit3;
                     let color = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                     if (dir.action === "add") { Icon = Plus; color = "text-[hsl(var(--skill-core))] bg-[hsl(var(--skill-core))/0.1] border-[hsl(var(--skill-core))/0.2]"; }
                     if (dir.action === "delete") { Icon = Trash2; color = "text-destructive bg-destructive/10 border-destructive/20"; }
                     if (dir.action === "replace") { Icon = Sparkles; color = "text-purple-500 bg-purple-500/10 border-purple-500/20"; }

                     return (
                       <div key={idx} className={`p-4 rounded-xl border ${color} relative`}>
                         <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">{dir.action}</span>
                         </div>
                         <p className="text-sm font-semibold text-foreground/90 mb-1">{dir.description}</p>
                         <p className="text-xs text-muted-foreground/80">{dir.reasoning}</p>
                       </div>
                     )
                   })}
                 </div>
               </motion.div>
             )}

            {/* Tailored Resume Snippets */}
            {result.tailored_resume_snippets && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 border border-primary/20 bg-primary/5 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display font-semibold text-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Tailored For Your Resume
                  </h4>
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Copy & Paste</span>
                </div>
                
                <div className="space-y-4">
                  <div className="relative group bg-background/60 p-4 rounded-lg border border-border shadow-sm">
                    <h5 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Professional Summary</h5>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">{result.tailored_resume_snippets.professional_summary}</p>
                    <button onClick={() => handleCopyBullet(result.tailored_resume_snippets!.professional_summary)} className="absolute right-2 top-2 p-1.5 opacity-0 group-hover:opacity-100 bg-background rounded-md shadow-sm border border-border text-muted-foreground hover:text-foreground transition-all">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Experience Bullet Points</h5>
                    {result.tailored_resume_snippets.experience_bullets.map((bullet, idx) => (
                      <div key={idx} className="relative group bg-background/60 p-3.5 rounded-lg border border-border shadow-sm pl-8">
                        <span className="absolute left-3.5 top-5 w-1.5 h-1.5 rounded-full bg-primary" />
                        <p className="text-sm text-foreground/90 leading-relaxed font-medium">{bullet}</p>
                        <button onClick={() => handleCopyBullet(bullet)} className="absolute right-2 top-2 p-1.5 opacity-0 group-hover:opacity-100 bg-background rounded-md shadow-sm border border-border text-muted-foreground hover:text-foreground transition-all">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
           </div>{/* END PAGE 2 */}
            


          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
};
