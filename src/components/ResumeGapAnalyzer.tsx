import { useState, useRef, useEffect, useCallback } from "react";
// Important: Use static import with ?url so Vite bundler properly packages the worker file for Vercel
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, ArrowRight, Upload, PlusCircle as PlusCircleIcon, AlertTriangle, CheckCircle2, XCircle, Sparkles, Copy, ShieldCheck, Edit3, Trash2, Plus, Download, BarChart3, Zap, TrendingUp, CloudUpload, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveApplication, type TrackedApplication } from "@/hooks/useApplications";
import type { Skill, ResumeGapResult, ResumeDeduction } from "@/types/jd";
import { computeDeterministicScore } from "@/lib/deterministicScorer";
import { getCachedResumeAnalysis, setCachedResumeAnalysis } from "@/lib/resumeAnalysisCache";
import { MatchHero } from "./gap-analysis/MatchHero";
import { ComparisonMatrix } from "./gap-analysis/ComparisonMatrix";
import { GapRecommendations } from "./gap-analysis/GapRecommendations";
import { DashboardSkeleton } from "./dashboard/DashboardSkeleton";
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
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageText = content.items.map((item: any) => item.str || "").join(" ");
    fullText += pageText + "\n";
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
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 20;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(16, 185, 129); // #10B981 Teal
      pdf.text("Lumina Strategy: Path to 100% Match", 20, y);
      
      y += 15;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Match Score: ${result.overall_match}%`, 20, y);
      
      y += 10;
      pdf.text("Executive Summary:", 20, y);
      y += 7;
      pdf.setFont("helvetica", "normal");
      const summaryLines = pdf.splitTextToSize(result.summary, pageWidth - 40);
      pdf.text(summaryLines, 20, y);
      y += summaryLines.length * 7;

      y += 10;
      pdf.setFont("helvetica", "bold");
      pdf.text("Identified Gaps:", 20, y);
      y += 7;
      pdf.setFont("helvetica", "normal");
      (result.deductions || []).forEach(d => {
        const text = `- ${d.reason} (-${d.percent}%)`;
        pdf.text(text, 25, y);
        y += 7;
      });

      pdf.save("Match-Strategy.pdf");
      toast.success("PDF Downloaded!");
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleGenerateBullet = async (index: number, reason: string) => {
    setGeneratingFor(index);
    try {
      const { data, error } = await supabase.functions.invoke("generate-bullet", {
        body: { gapReason: reason, resumeContext: resumeText, jobTitle },
      });
      if (error) throw error;
      setGeneratedBullets(prev => ({ ...prev, [index]: data.bullet }));
    } catch (err) {
      setGeneratedBullets(prev => ({ ...prev, [index]: "Focus on project delivery and measurable outcomes in this domain." }));
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleCopyBullet = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const processFile = async (file: File) => {
    const ext = file.name.toLowerCase().split(".").pop();
    setFileName(file.name);
    setIsParsing(true);
    try {
      let text = "";
      if (ext === "pdf") text = await extractPdfText(file);
      else if (ext === "docx") text = await extractDocxText(file);
      else text = await file.text();

      if (text.length < 20) throw new Error("File content too short.");
      setResumeText(text);
      setResult(null);
      setIsOpen(true);
      toast.success("Ready for analysis");
    } catch (err) {
      toast.error("Error parsing file.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleCompare = useCallback(async () => {
    const trimmedResume = (resumeText || "").trim();
    if (trimmedResume.length < 20) return;

    setIsAnalyzing(true);
    setResult(null);
    try {
      console.log(`Intelligence Scan: Starting for "${fileName}" (${trimmedResume.length} chars)`);
      
      // 1. Check Cache first for absolute consistency
      const cached = await getCachedResumeAnalysis(trimmedResume, skills, jobTitle);
      if (cached) {
        console.log(`Intelligence Scan: Cache Hit for "${jobTitle}" (Restoring consistent result)`);
        setResult(cached);
        setLastAnalyzedText(trimmedResume);
        setIsAnalyzing(false);
        toast.success("Intelligence Scan Complete (Cached)");
        return;
      }

      // 2. Run Deterministic Keyword Base
      const deterministicResult = computeDeterministicScore(trimmedResume, skills);
      const baseResult: ResumeGapResult = {
        overall_match: deterministicResult.overall_match,
        skill_matches: (deterministicResult.skill_matches || []).map(sm => ({
            skill: sm.skill,
            match_percent: sm.match_percent,
            verdict: sm.verdict,
            note: sm.note
        })),
        deductions: (deterministicResult.deductions || []).map(d => ({
            reason: d.reason,
            percent: d.percent
        })),
        summary: `Match identified at ${deterministicResult.overall_match}%. Reviewing specific capability tokens now.`
      };

      setResult(baseResult);
      setIsOpen(true);

      let aiResult: Partial<ResumeGapResult> | null = null;
      try {
        console.log(`Deep Scan: Invoking compare-resume intelligence...`);
        const { data, error: invokeError } = await supabase.functions.invoke("compare-resume", {
          body: { 
            jdSkills: skills, 
            resumeText: trimmedResume,
            jobTitle 
          },
        });

        if (invokeError) throw invokeError;
        
        if (data && !data.error) {
          aiResult = data;
          console.log(`Deep Scan: Intelligence Scored Successfully via Groq.`);
        } else if (data?.error) {
          throw new Error(data.error);
        }
      } catch (err) {
        console.warn("AI Deep Scan encountered a non-critical limit:", err);
        toast.info("AI Analysis limited. Using high-precision deterministic scoring.");
      }
 
      // Scoring Logic: AI has final authority over summary and directives, but deterministic logic ALWAYS rules the final score to prevent hallucination
      const final: ResumeGapResult = aiResult ? {
        ...baseResult,
        overall_match: baseResult.overall_match,
        summary: aiResult.summary || baseResult.summary,
        deductions: (baseResult.deductions || []).map(d => {
            const safeAiDeductions = Array.isArray(aiResult?.deductions) ? aiResult.deductions : [];
            const aiD = safeAiDeductions.find((ad: { reason: string; fix_snippet?: string }) => ad.reason?.includes(d.reason));
            return aiD?.fix_snippet ? { ...d, fix_snippet: aiD.fix_snippet } : d;
        }),
        tailored_resume_snippets: Array.isArray(aiResult.tailored_resume_snippets) ? aiResult.tailored_resume_snippets : [],
        actionable_directives: Array.isArray(aiResult.actionable_directives) ? aiResult.actionable_directives : []
      } : baseResult;

      setResult(final);
      await setCachedResumeAnalysis(trimmedResume, skills, final, jobTitle);
      setLastAnalyzedText(trimmedResume);
      toast.success("Intelligence Scan Complete");
    } catch (err) {
      toast.error("Analysis failed. Showing static scores.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, skills, jobTitle, fileName]);


  useEffect(() => {
    if (isAutoRunEnabled && resumeText && resumeText !== lastAnalyzedText && !isAnalyzing && !isParsing) {
      handleCompare();
    }
  }, [resumeText, isAutoRunEnabled, lastAnalyzedText, isAnalyzing, isParsing, handleCompare]);

  const handleAddToTracker = async () => {
    if (!result) return;
    const company = prompt("Company?");
    if (!company) return;
    await saveApplication({
        id: crypto.randomUUID(),
        company,
        role: jobTitle || "Unknown",
        matchPercent: result.overall_match,
        currentMatchPercent: result.overall_match,
        status: "Applied",
        addedAt: new Date().toISOString()
    });
    setAddedToTracker(true);
    window.dispatchEvent(new Event("tracker-updated"));
    toast.success("Tracked!");
  };

  const getVerdictIcon = (v: string) => {
    if (v === "strong") return <CheckCircle2 className="w-4 h-4 text-accent-emerald" />;
    return <AlertTriangle className="w-4 h-4 text-accent-amber" />;
  };

  const renderResults = () => {
    if (!result) return null;
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] gap-4">
            <div className="premium-card p-4 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-foreground">{result.overall_match}%</span>
                <span className="text-[12px] font-black uppercase text-accent-emerald tracking-widest mt-1 block">Match</span>
            </div>
            <div className="premium-card p-4 flex items-center">
                <p className="text-sm font-medium text-foreground/80 leading-relaxed italic pl-4">
                    "{result.summary}"
                </p>
            </div>
        </div>

        {result.deductions && result.deductions.length > 0 && (
          <div className="premium-card p-6 border-red-500/10 bg-red-500/[0.02]">
            <h4 className="text-xs font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-accent-red">
                <Zap className="w-4 h-4" /> Gap Analysis
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.deductions.map((d, i) => (
                    <div key={i} className="p-5 rounded-[2rem] bg-white border border-border/40 flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                        <div>
                            <span className="text-xs font-bold text-foreground block mb-1">{d.reason}</span>
                            <span className="text-[9px] text-accent-red font-bold px-2 py-0.5 rounded bg-accent-red/10 border border-accent-red/20">-{d.percent} Impact</span>
                        </div>
                        {d.fix_snippet && <button onClick={() => handleCopyBullet(d.fix_snippet!)} className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-all shrink-0"><Copy className="w-3.5 h-3.5" /></button>}
                    </div>
                ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="premium-card p-6 border-zinc-100">
                <h4 className="font-bold mb-4 uppercase tracking-widest text-[9px] text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 opacity-50" /> Skill Signatures
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(result.skill_matches || []).slice(0, 10).map((sm, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-[1.5rem] bg-slate-50/50 border border-border/20">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {getVerdictIcon(sm.verdict)}
                                <span className="text-xs font-medium truncate">{sm.skill}</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">{sm.match_percent}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="premium-card p-6 bg-accent-emerald/[0.02] border-accent-emerald/10">
                <h4 className="font-bold mb-4 uppercase tracking-[0.15em] text-[9px] text-accent-emerald flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Action Roadmap
                </h4>
                <div className="space-y-3">
                    {(result.actionable_directives?.length ? result.actionable_directives : [
                        { action: "Optimize", description: "Quantify your achievements in core skill areas." },
                        { action: "Inject", description: "Integrate JD keyword tokens into your professional summary." }
                    ]).map((d, i) => (
                        <div key={i} className="flex gap-4 items-start p-5 rounded-[2rem] bg-white border border-border/10 shadow-sm">
                            <div className="w-6 h-6 rounded flex-shrink-0 bg-accent-blue/10 flex items-center justify-center text-[10px] font-black text-accent-blue">{i+1}</div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-foreground block mb-0.5">{d.action}</span>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">{d.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 lg:p-10 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 mb-16 relative z-10">
        <div className="flex items-center gap-10">
          <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/5 flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform duration-700">
            <FileText className="w-12 h-12 text-primary/40" />
          </div>
          <div>
            <h3 className="font-serif italic text-5xl text-foreground tracking-tighter">Resume Intelligence</h3>
            <p className="text-[10px] uppercase tracking-[0.5em] font-black text-muted-foreground/40 mt-3">High-Fidelity Semantic Cross-Reference</p>
          </div>
        </div>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="px-12 py-6 rounded-full bg-accent-emerald text-white text-[12px] font-black uppercase tracking-[0.3em] hover:scale-110 transition-all active:scale-95 shadow-2xl shadow-accent-emerald/20 group"
          >
            Launch Diagnostic Scan <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-6">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`md:col-span-8 h-72 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-6 transition-all duration-700 cursor-pointer group/upload relative overflow-hidden ${
                        isParsing ? "bg-primary/5 border-primary/40 animate-pulse" : "border-white/10 hover:border-primary/40 hover:bg-primary/[0.02]"
                    }`}
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/upload:opacity-100 transition-opacity duration-700" />
                    {isParsing ? <Loader2 className="w-16 h-16 text-primary animate-spin" /> : <CloudUpload className="w-16 h-16 text-muted-foreground/20 group-hover/upload:text-primary/40 transition-colors" />}
                    <div className="text-center relative z-10">
                        <p className="text-xl font-display font-bold text-foreground/90">{fileName || "Inject Resume Signal"}</p>
                        <p className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">PDF or Semantic Textual Signature</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
                </div>

                <div className="md:col-span-4 space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-border/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-accent-emerald" />
                            <span className="text-xs font-black uppercase tracking-widest text-foreground/70">Secure Buffer</span>
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">Intelligence processing is strictly localized and non-custodial.</p>
                    </div>
                    <div className="flex items-center gap-4 px-8 py-5 rounded-[2.5rem] bg-slate-50/50 border border-border/10 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setIsAutoRunEnabled(!isAutoRunEnabled)}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isAutoRunEnabled ? 'bg-accent-emerald border-accent-emerald' : 'border-border'}`}>
                            {isAutoRunEnabled && <CheckCircle2 className="w-3.5 h-3.5 text-background" />}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-foreground/80">Auto-Run Diagnostic</span>
                    </div>
                </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste raw intent here for a deep-tissue semantic scan..."
                  className="w-full h-48 bg-slate-50 border border-border/40 rounded-[3rem] p-10 text-[15px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none relative z-10 font-medium placeholder:text-muted-foreground/30"
              />
            </div>

            {isAnalyzing && (
              <div className="mt-12">
                <DashboardSkeleton />
              </div>
            )}

            {!isAnalyzing && result && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <MatchHero score={result.overall_match} summary={result.summary} />

                <div className="space-y-12">
                  <ComparisonMatrix 
                    items={(result.skill_matches || []).map(sm => ({
                      skill: sm.skill,
                      required: true, // Assuming all skills in result are high-priority
                      present: sm.match_percent > 50,
                      evidence: sm.note
                    }))}
                  />

                  <GapRecommendations 
                    recommendations={(result.actionable_directives || []).map(d => ({
                      title: d.action,
                      description: d.description,
                      type: "strategy" as const
                    }))}
                  />
                </div>

                {/* ── FINAL ACTIONS ── */}
                <div className="mt-20 flex flex-col items-center gap-10">
                  <button 
                    onClick={handleAddToTracker} 
                    disabled={addedToTracker} 
                    className="px-16 py-7 rounded-full bg-[#10B981] text-[#1E2A3A] font-black uppercase tracking-[0.4em] text-[13px] hover:scale-110 active:scale-95 transition-all flex items-center gap-5 group shadow-2xl shadow-[#10B981]/20"
                  >
                    {addedToTracker ? <CheckCircle2 className="w-6 h-6" /> : <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />}
                    {addedToTracker ? "Application Tracked" : "Initiate Pipeline Tracking"}
                  </button>
                  <button onClick={handleExportPDF} className="text-xs font-display font-bold uppercase tracking-[0.5em] text-[#1E2A3A]/40 hover:text-[#1E2A3A] transition-all duration-500 pb-1 border-b border-transparent hover:border-[#1E2A3A]/10">
                    Download Intelligence Strategy
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
