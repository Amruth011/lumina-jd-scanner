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
    fullText += content.items.map((item: unknown) => (item as { str: string }).str).join(" ") + "\n";
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

      // Semantic Brand Colors for PDF
      const colorBlue = [59, 130, 246]; // accent-blue
      const colorEmerald = [16, 185, 129]; // accent-emerald
      const colorRed = [239, 68, 68]; // accent-red
      const colorViolet = [139, 92, 246]; // accent-violet

      addText("Lumina JD - Strategy to Reach 100% Match", 18, true, colorBlue);
      y += 10;
      addText(`Current Match Score: ${result.overall_match}%`, 14, true);
      addText("Target Score: 100%", 14, true, colorEmerald);
      y += 5;

      addText("Critical Gaps to Fix", 14, true, colorRed);
      if (result.deductions?.length) {
        result.deductions.forEach((d) => addText(`- (-${d.percent}%) ${d.reason}`, 12));
      } else {
        addText("No major gaps found.", 12);
      }
      y += 5;

      addText("Step-by-step Action Plan", 14, true, colorEmerald);
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
        addText("Ready-to-Use Resume Snippets", 14, true, colorViolet);
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
    } catch (err) {
      console.error("Bullet generation error:", err);
      const keywords = reason.replace(/missing/i, "").trim();
      setGeneratedBullets((prev) => ({
        ...prev,
        [index]: `Led cross-functional initiatives in ${keywords || "this domain"}, resulting in measurable efficiency gains and stakeholder alignment.`,
      }));
      toast.error((err as Error).message || "Using fallback — deploy generate-bullet function for real AI bullets.");
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
    } catch (err) {
      console.error("File parse error:", err);
      toast.error((err as Error).message || "Failed to parse file. Try pasting text manually.");
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

  const handleCompare = useCallback(async () => {
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
      let aiResult: Partial<ResumeGapResult> | null = null;
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
              const aiDed = aiResult.deductions?.find((ad) => ad.reason?.toLowerCase().includes(keyword));
              return aiDed?.fix_snippet ? { ...d, fix_snippet: aiDed.fix_snippet } : d;
            }),
            tailored_resume_snippets: aiResult.tailored_resume_snippets || undefined,
            actionable_directives: aiResult.actionable_directives || undefined,
            skill_matches: baseResult.skill_matches.map((sm) => {
              const aiSm = aiResult.skill_matches?.find((a) => a.skill === sm.skill);
              return aiSm?.note ? { ...sm, note: aiSm.note } : sm;
            }),
          }
        : baseResult;

      await setCachedResumeAnalysis(trimmedResume, skills, finalResult);
      setResult(finalResult);
      onResultChange?.(finalResult);
      setLastAnalyzedText(trimmedResume);
      toast.success(`Resume match: ${finalResult.overall_match}%`);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Failed to analyze resume.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, jdText, skills, onResultChange]);

  useEffect(() => {
    if (!isAutoRunEnabled) return;
    const trimmedResume = resumeText.trim();
    if (trimmedResume.length <= 20 || trimmedResume === lastAnalyzedText || isAnalyzing || isParsing) return;
    void handleCompare();
  }, [isAutoRunEnabled, resumeText, lastAnalyzedText, isAnalyzing, isParsing, handleCompare]);

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
    if (verdict === "strong") return "bg-accent-emerald shadow-[0_0_10px_rgba(16,185,129,0.2)]";
    if (verdict === "partial") return "bg-accent-amber shadow-[0_0_10px_rgba(245,158,11,0.2)]";
    return "bg-accent-red shadow-[0_0_10px_rgba(239,68,68,0.2)]";
  };

  const getVerdictIcon = (verdict: string) => {
    if (verdict === "strong") return <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />;
    if (verdict === "partial") return <AlertTriangle className="w-3.5 h-3.5 text-accent-amber" />;
    return <XCircle className="w-3.5 h-3.5 text-accent-red" />;
  };

  const getVerdictLabel = (verdict: string) => {
    if (verdict === "strong") return "Strong Match";
    if (verdict === "partial") return "Partial";
    return "Gap";
  };

  const getMatchColor = (percent: number) => {
    if (percent >= 80) return "text-accent-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]";
    if (percent >= 50) return "text-accent-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]";
    return "text-accent-red drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]";
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
                <div className="p-2 rounded-full bg-accent-amber/10">
                  <AlertTriangle className="w-5 h-5 text-accent-amber" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground tracking-tight">Replace Current Resume?</h3>
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/5"
          >
            <FileText className="w-5 h-5 text-foreground/70" />
          </motion.div>
          <div>
            <h3 className="font-display font-bold text-lg md:text-xl text-foreground tracking-tight">
              Resume Gap Analyzer
            </h3>
            <p className="text-tag text-muted-foreground/60">Evaluate your resume against the JD</p>
          </div>
        </div>
        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.05, x: 3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-foreground text-background hover:opacity-90 transition-all liquid-glass-refraction shadow-lg shadow-foreground/5"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 bg-secondary/30 p-3 rounded-xl border border-border/50 backdrop-blur-sm">
               <div className="flex items-center gap-3">
                 <span className="flex items-center gap-1.5 text-tag text-accent-emerald bg-accent-emerald/10 px-3 py-1 rounded-full border border-accent-emerald/10"><ShieldCheck className="w-3.5 h-3.5" /> 100% SECURE</span>
                 <span className="flex items-center gap-1.5 text-tag text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full border border-accent-blue/10"><CheckCircle2 className="w-3.5 h-3.5" /> ATS-OPTIMIZED</span>
               </div>
               
               <label className="flex items-center gap-2 cursor-pointer bg-background px-3 py-1.5 rounded-md border border-border shadow-sm">
                 <input 
                   type="checkbox" 
                   className="hidden" 
                   checked={isAutoRunEnabled} 
                   onChange={(e) => setIsAutoRunEnabled(e.target.checked)} 
                 />
                 <span className="text-xs font-semibold whitespace-nowrap text-foreground">Auto-Run Analysis</span>
                 <div className={`w-8 h-4 rounded-full transition-colors relative border ${isAutoRunEnabled ? 'bg-accent-emerald border-accent-emerald/50' : 'bg-black/10 border-border'}`}>
                    <div className={`absolute w-3 h-3 shadow-sm rounded-full top-0.5 transition-transform ${isAutoRunEnabled ? 'translate-x-[18px] bg-white' : 'translate-x-0.5 bg-white/60'}`} />
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
              className="relative overflow-hidden flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold bg-accent text-accent-foreground hover:bg-muted transition-all disabled:opacity-40 liquid-glass-refraction premium-button-glow"
            >
              <div className="liquid-water-layer opacity-20" />
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
              className="mb-8 text-center p-12 glass shadow-2xl rounded-[40px] relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 2, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <span className={`text-7xl md:text-8xl font-display font-black tracking-tighter ${getMatchColor(result.overall_match)}`}>
                    {result.overall_match}%
                  </span>
                  <div className="absolute -top-2 -right-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-black uppercase tracking-widest shadow-lg">
                    <Zap className="w-3 h-3 fill-current" /> Match
                  </div>
                </div>
                <p className="text-sm text-muted-foreground/60 font-bold uppercase tracking-[0.3em] mt-4">Enterprise Match Score</p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  {!addedToTracker ? (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddToTracker}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold text-foreground bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-all shadow-sm"
                    >
                      <PlusCircleIcon className="w-4 h-4" /> Save to Pipeline
                    </motion.button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold text-accent-emerald bg-accent-emerald/5 border border-accent-emerald/10">
                      <CheckCircle2 className="w-4 h-4" /> Tracked in Dashboard
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold text-background bg-foreground hover:opacity-90 transition-all shadow-xl shadow-foreground/10"
                  >
                    <FileText className="w-4 h-4" /> Export Strategy PDF
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* WHY NOT 100% - THE STRATEGY PANEL */}
            {result.deductions && result.deductions.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-8 rounded-[40px] border border-accent-red/20 bg-accent-red/5 p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 pointer-events-none">
                   <AlertTriangle className="w-32 h-32 text-accent-red" />
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-accent-red" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-display font-bold text-foreground tracking-tight">Strategy: The Gap Closer</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Architecting 100% Match Candidacy</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {result.deductions.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="group relative bg-background/40 hover:bg-background/80 rounded-2xl border border-border/40 overflow-hidden transition-all duration-300"
                    >
                      <div className="flex items-center gap-5 px-6 py-5">
                        <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-accent-red/10 border border-accent-red/20 min-w-[70px]">
                          <span className="text-[10px] font-bold text-accent-red/60 uppercase tracking-tighter">Impact</span>
                          <span className="text-xl font-display font-black text-accent-red">-{d.percent}%</span>
                        </div>
                        <div className="flex-1 space-y-1">
                           <span className="text-base font-bold text-foreground leading-tight tracking-tight block">{d.reason}</span>
                           <span className="text-xs text-muted-foreground italic flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                             <Sparkles className="w-3 h-3" /> Potential 0.1% candidacy bottleneck detected.
                           </span>
                        </div>
                        <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => handleGenerateBullet(i, d.reason)}
                           disabled={generatingFor === i || !!generatedBullets[i]}
                           className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold text-accent-blue bg-accent-blue/10 border border-accent-blue/20 hover:bg-accent-blue/20 transition-all disabled:opacity-50 shadow-sm"
                        >
                           {generatingFor === i ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                           {generatingFor === i ? "Brewing..." : generatedBullets[i] ? "Optimized" : "Inject AI Polish"}
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {(d.fix_snippet || generatedBullets[i]) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="bg-foreground/5 border-t border-white/5 p-6 space-y-4"
                          >
                            {d.fix_snippet && (
                              <div className="flex gap-4 items-start">
                                <div className="w-6 h-6 rounded-full bg-accent-emerald/10 flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />
                                </div>
                                <div className="space-y-1 flex-1">
                                  <p className="text-[10px] font-bold text-accent-emerald uppercase tracking-widest leading-none mb-1">Static Analysis Fix</p>
                                  <p className="text-sm text-foreground/80 font-medium leading-relaxed italic">"{d.fix_snippet}"</p>
                                </div>
                                <button onClick={() => handleCopyBullet(d.fix_snippet!)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><Copy className="w-4 h-4 text-muted-foreground" /></button>
                              </div>
                            )}
                            
                            {generatedBullets[i] && (
                              <div className="flex gap-4 items-start pt-4 border-t border-white/5">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="space-y-1 flex-1">
                                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Generative AI Reinforcement</p>
                                  <p className="text-sm text-foreground font-bold leading-relaxed">"{generatedBullets[i]}"</p>
                                </div>
                                <button onClick={() => handleCopyBullet(generatedBullets[i])} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><Copy className="w-4 h-4 text-muted-foreground" /></button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
                <div className="mb-8 rounded-[40px] border border-accent-emerald/20 bg-accent-emerald/5 p-12 text-center space-y-4">
                   <div className="w-20 h-20 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto border border-accent-emerald/20">
                     <CheckCircle2 className="w-10 h-10 text-accent-emerald" />
                   </div>
                   <h4 className="text-2xl font-display font-bold">Unicorn Candidate Status</h4>
                   <p className="text-muted-foreground max-w-sm mx-auto">No significant skill gaps detected. Your profile matches the JD's core signature exactly.</p>
                </div>
            )}

            {/* THE HEATMAP & ROADMAP GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
                {/* SKILL HEATMAP */}
                <div className="rounded-[40px] bg-muted/20 p-8 border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-lg font-bold tracking-tight">Competency Breakdown</h4>
                     <div className="flex gap-2">
                       {['strong', 'partial', 'missing'].map(v => (
                         <div key={v} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border font-bold capitalize">
                           <div className={`w-1.5 h-1.5 rounded-full ${getBarColor(v)}`} />
                           <span className="text-[10px] text-muted-foreground uppercase">{v}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.skill_matches.map((sm, i) => (
                      <div key={sm.skill} className="p-4 rounded-2xl bg-background/40 border border-white/5 flex items-center justify-between group hover:bg-background transition-all">
                        <div className="flex items-center gap-3">
                           {getVerdictIcon(sm.verdict)}
                           <span className="text-sm font-medium">{sm.skill}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          sm.match_percent >= 80 ? 'text-accent-emerald' : sm.match_percent >= 50 ? 'text-accent-amber' : 'text-accent-red'
                        }`}>{sm.match_percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SIDEBAR: ACTION ROADMAP */}
                <div className="space-y-6">
                  <div className="rounded-3xl bg-foreground text-background p-6 space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BarChart3 className="w-24 h-24" />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Success Roadmap</h5>
                        <h4 className="text-xl font-display font-bold leading-tight">Your Path to <span className="text-primary italic">100%</span></h4>
                        
                        <div className="space-y-4 pt-4">
                          {[
                            { step: 1, label: "Address Missing Skills", done: result.skill_matches.every(s => s.verdict !== 'missing') },
                            { step: 2, label: "Quantify Experience", done: !!result.tailored_resume_snippets },
                            { step: 3, label: "Final ATS Audit", done: result.overall_match >= 90 }
                          ].map((s, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${s.done ? 'bg-accent-emerald border-accent-emerald text-white' : 'border-white/20 text-white/40'}`}>
                                  {s.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                                </div>
                                <span className={`text-xs font-bold ${s.done ? 'line-through opacity-40' : ''}`}>{s.label}</span>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={handleExportPDF}
                          className="w-full py-4 mt-6 rounded-[20px] bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all"
                        >
                          Download Battleplan PDF
                        </button>
                      </div>
                  </div>
                </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 glass rounded-[32px] p-6 relative overflow-hidden"
            >
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent-blue to-accent-violet rounded-full opacity-60"
              />
              <p className="text-base text-card-foreground font-medium leading-relaxed pl-4 italic">
                "{result.summary}"
              </p>
            </motion.div>
           </div>{/* END PAGE 1 */}
           
           <div ref={page2Ref} className="bg-background/20 border-t border-border/40 p-5 sm:p-8">
             {/* Actionable Directives */}
             {(result.actionable_directives && result.actionable_directives.length > 0) && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="mt-0"
               >
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10">
                       <Edit3 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                       <h4 className="font-display font-bold text-lg text-foreground tracking-tight leading-none">Required Changes</h4>
                       <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mt-1 font-bold">Actionable Directives</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   {result.actionable_directives.map((dir, idx) => {
                     let Icon = Edit3;
                     let color = "text-accent-amber bg-accent-amber/5 border-accent-amber/20";
                     if (dir.action === "add") { Icon = Plus; color = "text-accent-emerald bg-accent-emerald/5 border-accent-emerald/20"; }
                     if (dir.action === "delete") { Icon = Trash2; color = "text-accent-red bg-accent-red/5 border-accent-red/20"; }
                     if (dir.action === "replace") { Icon = Sparkles; color = "text-accent-violet bg-accent-violet/5 border-accent-violet/20"; }

                     return (
                       <div key={idx} className={`p-5 rounded-2xl border ${color} relative flex flex-col gap-3 shadow-sm`}>
                         <div className="flex items-center gap-2">
                            <div className="p-1 px-2 rounded-md bg-background/40">
                               <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-display font-bold text-[9px] uppercase tracking-[0.2em]">{dir.action}</span>
                         </div>
                         <p className="text-[13.5px] font-bold text-foreground/90 leading-tight tracking-tight">{dir.description}</p>
                         <p className="text-xs text-muted-foreground/70 font-medium leading-relaxed">{dir.reasoning}</p>
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
                className="mt-10 border border-accent-blue/20 bg-accent-blue/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/10">
                       <Sparkles className="w-4 h-4 text-accent-blue" />
                     </div>
                     <div>
                       <h4 className="font-display font-bold text-lg text-accent-blue tracking-tight leading-none">
                         Tailored Output
                       </h4>
                       <p className="text-[10px] uppercase tracking-[0.2em] text-accent-blue/40 mt-1 font-bold">Direct Application-Ready</p>
                     </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-[0.2em]">Copy & Paste</span>
                </div>
                
                <div className="space-y-6">
                  <div className="relative group bg-background/50 p-5 rounded-2xl border border-border/40 shadow-sm transition-all hover:bg-background/80">
                     <h5 className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-3">Professional Summary</h5>
                     <p className="text-sm text-foreground/80 leading-relaxed font-medium">{result.tailored_resume_snippets.professional_summary}</p>
                     <button onClick={() => handleCopyBullet(result.tailored_resume_snippets!.professional_summary)} className="absolute right-3 top-3 p-2 opacity-0 group-hover:opacity-100 bg-background rounded-xl shadow-md border border-border text-muted-foreground hover:text-foreground transition-all">
                       <Copy className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Experience Bullet Points</h5>
                    {result.tailored_resume_snippets.experience_bullets.map((bullet, idx) => (
                      <div key={idx} className="relative group bg-background/50 p-4 rounded-xl border border-border/30 shadow-sm pl-10 transition-all hover:bg-background/80">
                        <span className="absolute left-4 top-[1.125rem] w-2 h-2 rounded-full bg-accent-blue/40" />
                        <p className="text-sm text-foreground/85 leading-relaxed font-medium">{bullet}</p>
                        <button onClick={() => handleCopyBullet(bullet)} className="absolute right-3 top-3 p-2 opacity-0 group-hover:opacity-100 bg-background rounded-xl shadow-md border border-border text-muted-foreground hover:text-foreground transition-all">
                          <Copy className="w-4 h-4" />
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
