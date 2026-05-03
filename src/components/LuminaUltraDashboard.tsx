import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, Target, TrendingUp, Clock, Ghost, Scale, 
  BrainCircuit, Star, Zap, UserCheck, MessageSquare,
  LayoutDashboard, Heart, SearchCheck, Briefcase, ArrowRight,
  ShieldCheck, Info, Copy, Activity, Sparkles, Download, Check, Users, Wand2, DollarSign
} from "lucide-react";
import type { DecodeResult, ResumeGapResult } from "@/types/jd";
import { LuminaGauge } from "./LuminaGauge";
import { JdVerdictCard } from "./JdVerdictCard";
import { InterviewCoach } from "./InterviewCoach";
import { IcebergAnalysis } from "./IcebergAnalysis";
import { LuminaTimeline } from "./LuminaTimeline";
import { RecruiterLens } from "./RecruiterLens";
import { BiasDetector } from "./BiasDetector";
import { ResumeBulletGenerator } from "./ResumeBulletGenerator";
import { SkillHighlights } from "./SkillHighlights";
import { CultureRadar } from "./CultureRadar";
import { LucideIcon } from "lucide-react";
import { generateUnifiedReport } from "@/lib/pdfExporter";
import { toast } from "sonner";

interface LuminaUltraDashboardProps {
  results: DecodeResult;
  resumeResults?: ResumeGapResult | null;
  jdText?: string;
}

export const LuminaUltraDashboard = ({ results, resumeResults, jdText }: LuminaUltraDashboardProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [synParams, setSynParams] = useState({
    intensity: 'Elite',
    focus: 'Technical',
    tone: 'Professional'
  });

  if (!results) {
    return (
      <div className="glass-panel p-12 rounded-[3.5rem] mt-8 text-center border-dashed border-foreground/10 bg-white shadow-xl flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center animate-pulse">
          <BrainCircuit className="text-primary/20" size={32} />
        </div>
        <h3 className="text-2xl font-serif italic text-muted-foreground">Initializing Tactical Interface...</h3>
        <p className="text-sm text-foreground/40 max-w-sm">Synchronizing with Lumina Engine. Waiting for secure data stream.</p>
      </div>
    );
  }

  const grade = (results?.grade && typeof results.grade.score === 'number') ? results.grade : { 
    score: 70, 
    letter: 'B', 
    summary: 'Standard Industry Alignment Analysis', 
    breakdown: {
      clarity: 70,
      realistic: 70,
      compensation: 50,
      red_flags: 10,
      benefits: 50,
      growth: 70,
      inclusivity: 80,
      readability: 80
    }, 
    plain_english_summary: [] 
  };

  const copyAllKeywords = () => {
    if (results?.resume_help?.keywords?.length) {
        navigator.clipboard.writeText(results.resume_help.keywords.join(", "));
        toast.success("Keywords copied to clipboard");
    } else {
        toast.info("No keywords available to copy");
    }
  };

  const handleCopySalary = () => {
    const min = results?.logistics?.salary_range?.min;
    const max = results?.logistics?.salary_range?.max;
    const currency = results?.logistics?.salary_range?.currency === 'INR' ? '₹' : '$';
    if (min && max) {
        navigator.clipboard.writeText(`${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`);
        setCopiedField('salary');
        toast.success("Salary range copied to clipboard");
        setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleExport = () => {
    generateUnifiedReport(results, resumeResults);
    toast.success("Intelligence Report Exported");
  };

  const LuminaInferenceBadge = ({ tooltip }: { tooltip: string }) => (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 border border-primary/10 cursor-help group/badge" title={tooltip}>
        <Sparkles size={10} className="text-primary animate-pulse" />
        <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 group-hover/badge:text-primary transition-colors">Inferred Intelligence</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── HERO INTELLIGENCE (Priority Metrics) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Total Score & Grade */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/20 p-8 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden group min-h-[400px]">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <LuminaGauge 
                    value={grade.score} 
                    label="Aggregate Score" 
                    size={220} 
                    color="var(--accent-blue)" 
                />
                <div className="mt-8 text-center relative z-10 space-y-4">
                  <div>
                    <span className="text-[12px] font-black uppercase text-primary/60 tracking-widest block">Intelligence Index</span>
                    <p className="text-[13px] text-muted-foreground mt-2 max-w-[280px] leading-relaxed font-medium">Composite score based on market value, role clarity, and risk factors.</p>
                  </div>
                </div>
            </div>
            <JdVerdictCard grade={grade} />
          </div>

          {/* Salary Range Card */}
          <div 
            className="lg:col-span-4 glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/20 p-10 rounded-[3.5rem] flex flex-col justify-center space-y-10 relative overflow-hidden group cursor-pointer"
            onClick={handleCopySalary}
          >
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Star size={140} className="text-accent-gold" />
                </div>
                <div className="space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-60">Projected Value Range</span>
                            {(results?.logistics?.salary_range?.estimate || !jdText?.toLowerCase()?.includes('salary')) && (
                                <LuminaInferenceBadge tooltip="Salary not explicitly stated. Calculated based on role, location, and seniority." />
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 px-6 md:px-12 relative">
                    <div className="flex items-center gap-3">
                        <DollarSign size={16} className="text-accent-gold" />
                        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-accent-gold/60">Forensic Salary Valuation</span>
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-4xl lg:text-5xl font-display font-black tracking-[-0.07em] text-foreground leading-none group-hover:text-accent-gold transition-colors">
                            {(() => {
                                const c = results?.logistics?.salary_range?.currency?.toUpperCase();
                                if (c === 'USD' || c === '$') return '$';
                                if (c === 'INR' || c === '₹') return '₹';
                                if (c === 'GBP' || c === '£') return '£';
                                if (c === 'EUR' || c === '€') return '€';
                                return '$';
                            })()}
                            {(results?.logistics?.salary_range?.min ?? 0).toLocaleString()}
                        </span>
                        <span className="text-xl text-muted-foreground/20 font-black">-</span>
                        <span className="text-4xl lg:text-5xl font-display font-black text-accent-emerald tracking-[-0.07em] leading-none">
                            {(results?.logistics?.salary_range?.max ?? 0).toLocaleString()}
                        </span>
                        
                        <div className="ml-4 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                            <span className="text-[9px] font-black uppercase text-accent-gold tracking-widest">
                                {(results?.logistics?.salary_range?.max ?? 0) > 150000 || (results?.logistics?.salary_range?.max ?? 0) > 5000000 ? "Market Elite Tier" : "Standard Domain Pay"}
                            </span>
                        </div>
                    </div>
                    {copiedField === 'salary' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-accent-gold/10 backdrop-blur-sm flex items-center justify-center rounded-[3.5rem] z-20">
                            <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-accent-gold/20 shadow-xl">
                                <Check size={12} className="text-accent-gold" />
                                <span className="text-[10px] font-black uppercase text-accent-gold tracking-widest">Copied Range</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="space-y-6 pt-4 relative z-10">
                    <div className="h-6 w-full bg-white/5 rounded-full p-1 border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                        <div className="h-full bg-gradient-to-r from-primary/20 via-accent-emerald/40 to-accent-gold/20 rounded-full relative z-10">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-4 border-accent-emerald z-20 shadow-xl" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-muted-foreground/40 block tracking-widest leading-none">Market Floor</span>
                          <span className="text-[12px] font-bold">Standard</span>
                        </div>
                        <div className="space-y-1 text-center font-display">
                          <span className="text-[10px] font-black uppercase text-foreground/40 block tracking-widest leading-none">Competitiveness</span>
                          <span className="text-[11px] font-black text-accent-emerald tracking-widest uppercase truncate block">Elite Tier</span>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[10px] font-black uppercase text-muted-foreground/40 block tracking-widest leading-none">Market Ceiling</span>
                          <span className="text-[12px] font-bold">Alpha</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* ── PHASE 1: JD DECODER ── */}
      <div className="space-y-8">
        <PhaseLabel number="01" title="JD Decoder" sub="Quick Scannable Wins" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Skill Highlights (Expanded Taxonomy) [NEW: taking space of old seniority] */}
            <div className="lg:col-span-12 xl:col-span-7 flex flex-col">
                <SkillHighlights skills={results?.skills || []} results={results} rawJd={jdText} />
            </div>

            {/* Strategic Details & Risk Decoder [NEW: Moving Seniority here] */}
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
                {/* Seniority Dashboard (Moved from left side to optimize space) */}
                <div className="glass-panel p-8 flex flex-col items-center group relative overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/20 rounded-[3rem]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                        <Activity size={60} className="text-accent-emerald" />
                    </div>
                    
                    <div className="w-full flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="shrink-0">
                            <LuminaGauge 
                                value={results?.qualifiers?.seniority_level ?? 0} 
                                label="Seniority" 
                                size={130} 
                                color="var(--accent-emerald)" 
                            />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-accent-emerald tracking-[0.2em]">Strategic Calibration</span>
                                <h4 className="text-2xl font-serif italic text-foreground leading-tight">
                                    {(results?.qualifiers?.seniority_level ?? 0) > 70 ? "Executive Leadership" : (results?.qualifiers?.seniority_level ?? 0) > 40 ? "Mid-Senior Strategic" : "Elite Associate Level"}
                                </h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Experience Req.</span>
                                    <p className="text-[11px] font-bold text-foreground">
                                        {(results?.qualifiers?.experience?.professional ?? 0) <= 1.5 || results?.title?.toLowerCase()?.includes('trainee') || results?.title?.toLowerCase()?.includes('intern')
                                            ? "Early Career / Entry" 
                                            : `${results?.qualifiers?.experience?.professional ?? 0}yr+ Domain Exp.`}
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Work Model</span>
                                    <p className="text-[11px] font-bold text-accent-emerald uppercase tracking-tighter">
                                        {results?.logistics?.work_arrangement?.remote_friendly === 'yes' ? 'Remote' : results?.logistics?.work_arrangement?.remote_friendly === 'partial' ? 'Hybrid' : 'On-Site'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3 mt-8 pt-6 border-t border-black/5 relative z-10">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                            <Target size={14} className="text-accent-blue opacity-40 shrink-0" />
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-[8px] font-black uppercase text-muted-foreground/50">Base Ops</span>
                                <span className="text-[10px] font-bold text-foreground truncate">
                                    {results?.title?.match(/Bengaluru|Bangalore|Hyderabad|Chennai|Pune|Mumbai|Delhi|London|Remote/i)?.[0] || "Global Tech Hub"}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                            <Activity size={14} className="text-accent-emerald opacity-40 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-muted-foreground/50">Intensity</span>
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-tighter">High Impact</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                            <Target size={14} className="text-accent-emerald opacity-40 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-muted-foreground/50">Threshold</span>
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-tighter leading-tight" title={String(results?.requirements?.education?.[0] || "")}>
                                    {String(results?.requirements?.education?.[0] || "Foundational")}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Red Flag Decoder */}
                <div className="glass-panel p-8 rounded-[3rem] border-white/20 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <ShieldAlert size={18} className="text-red-500" />
                            <span className="text-xs uppercase font-black tracking-widest text-red-500/70">Red Flag Decoder</span>
                        </div>
                        <span className="text-[10px] font-black text-red-500/40 uppercase tracking-widest">Risks Identified</span>
                    </div>
                    <div className="space-y-4 relative z-10">
                        {results?.red_flags?.length ? results.red_flags.slice(0, 2).map((flag, i) => (
                            <div key={i} className="pl-4 border-l-2 border-red-500-20 space-y-1 group-f cursor-pointer" onClick={() => { navigator.clipboard.writeText(flag.note); toast.success("Insight copied"); }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-[14px] font-serif italic text-foreground tracking-tight underline decoration-red-500-10 decoration-2 underline-offset-4 group-hover-f:text-red-500 transition-colors">&ldquo;{flag.phrase}&rdquo;</p>
                                    <span className="text-xs font-black text-red-500/60">{flag.intensity}%</span>
                                </div>
                                <p className="text-[12px] font-medium text-muted-foreground leading-relaxed transition-colors group-hover-f:text-foreground-70">{flag.note}</p>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-4 space-y-2 opacity-40">
                                <ShieldCheck size={32} className="text-accent-emerald/40" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-center">Clean Signal: No Major Risks Detected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Green Flag Decoder */}
                <div className="glass-panel p-8 rounded-[3rem] border-white/20 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent-emerald/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={18} className="text-accent-emerald" />
                            <span className="text-xs uppercase font-black tracking-widest text-accent-emerald/70">Green Flag Decoder</span>
                        </div>
                        <span className="text-[10px] font-black text-accent-emerald/40 uppercase tracking-widest">Growth Signals</span>
                    </div>
                    <div className="space-y-4 relative z-10">
                        {[(results?.grade?.breakdown?.benefits ?? 0) > 7 ? { phrase: "Premium Benefits", note: "Compensation & perks scored exceptionally high for this role tier." } : null,
                            (results?.grade?.breakdown?.growth ?? 0) > 7 ? { phrase: "High Growth Trajectory", note: "Strategic potential for career advancement and skill expansion." } : null,
                            results?.logistics?.work_arrangement?.remote_friendly === 'yes' ? { phrase: "Total Autonomy", note: "The role supports a fully remote work model with flexible boundaries." } : null,
                        ].filter(Boolean).slice(0, 2).map((flag, i) => (
                            <div key={i} className="pl-4 border-l-2 border-accent-emerald-20 space-y-1 group-f cursor-pointer" onClick={() => { if (flag) { navigator.clipboard.writeText(flag.note || ""); toast.success("Strength copied"); } }}>
                                <div className="flex items-center justify-between">
                                    <p className="text-[14px] font-serif italic text-foreground tracking-tight underline decoration-accent-emerald-10 decoration-2 underline-offset-4 group-hover-f:text-accent-emerald transition-colors">&ldquo;{flag?.phrase}&rdquo;</p>
                                    <Check size={12} className="text-accent-emerald" />
                                </div>
                                <p className="text-[12px] font-medium text-muted-foreground leading-relaxed transition-colors group-hover-f:text-foreground-70">{flag?.note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ── PHASE 2: GAP ANALYSIS ── */}
      <div className="space-y-8">
        <PhaseLabel number="02" title="Gap Analysis" sub="Deep Extraction & Analysis" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Plain English Summary */}
            <div className="lg:col-span-12 lg:col-span-5 glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 space-y-8 relative overflow-hidden group border-white/20 rounded-[3rem]">
                <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-3xl font-serif italic text-foreground">The Professional Verdict</h3>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 mt-1">Executive Summary Points</p>
                    </div>
                    <Zap size={24} className="text-primary/20" />
                </div>
                <div className="space-y-6 relative z-10">
                    {(grade?.plain_english_summary || []).slice(0, 5).map((point, i) => (
                        <div key={i} className="flex gap-4 group/p cursor-pointer" onClick={() => { navigator.clipboard.writeText(point); toast.success("Summary point copied"); }}>
                            <span className="text-[11px] font-black text-accent-emerald/40 mt-1 group-hover/p:text-accent-emerald transition-colors">{String(i+1).padStart(2, '0')}</span>
                            <p className="text-[13px] font-medium text-foreground/80 leading-relaxed group-hover/p:text-foreground transition-colors">
                                {point.split(/(\*\*.*?\*\*)/g).map((part, idx) => 
                                    part.startsWith('**') && part.endsWith('**') 
                                        ? <strong key={idx} className="text-accent-emerald font-black">{part.slice(2, -2)}</strong> 
                                        : part
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Vital Mandates Card [NEW POWER FEATURE] */}
            <div className="lg:col-span-12 lg:col-span-4 glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 space-y-10 relative overflow-hidden group border-white/20 rounded-[3rem]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-serif italic text-foreground">Vital Mandates</h3>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 mt-1">Non-Negotiable Qualifiers</p>
                    </div>
                    <ShieldCheck size={24} className="text-accent-blue/20" />
                </div>
                
                <div className="space-y-8 relative z-10">
                    <div className="space-y-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue/60 group-hover:text-accent-blue transition-colors">Education Threshold</span>
                         <p className="text-[14px] font-bold text-foreground leading-tight">
                            {results?.requirements?.education?.[0] || "Foundational Degree Preferred"}
                         </p>
                    </div>

                    <div className="space-y-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue/60 group-hover:text-accent-blue transition-colors">Core Agreements</span>
                         <div className="space-y-3">
                            {(results?.requirements?.agreements || []).slice(0, 3).map((agreement, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-accent-blue/40" />
                                    <p className="text-[12px] font-medium text-foreground/80 leading-snug">{agreement}</p>
                                </div>
                            ))}
                         </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 block mb-2">Practice Standard</span>
                        <p className="text-[12px] font-medium text-muted-foreground">This role demands <span className="text-foreground font-bold">{results?.requirements?.experience}</span> as the core practice baseline.</p>
                    </div>
                </div>
            </div>

            {/* Strategic Deficit (Keywords) */}
            <div className="lg:col-span-12 lg:col-span-3 glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-8 border-white/20 rounded-[3rem]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SearchCheck size={18} className="text-primary" />
                        <span className="text-xs uppercase font-black tracking-widest text-foreground/70">Strategic Deficit</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {(results?.resume_help?.keywords || []).slice(0, 12).map((word, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer" onClick={() => { navigator.clipboard.writeText(word); toast.success(`"${word}" copied`); }}>
                            <span className="text-[12px] font-bold text-foreground/80 tracking-tight">{word}</span>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={copyAllKeywords}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all"
                >
                    <Copy size={10} />
                    Copy Keywords
                </button>
                <p className="text-[10px] text-muted-foreground opacity-50 leading-relaxed italic pt-4 border-t border-white/5">
                    Keywords analyzed for ATS frequency and semantic weights.
                </p>
            </div>
        </div>

        {/* Bonus Pulse Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <BonusCard icon={Ghost} label="Ghost Job Risk" value={results?.bonus_pulse?.ghost_job_probability ?? 0} sub="Entity Urgency" color="red-400" />
             <BonusCard icon={Activity} label="Desperation Meter" value={results?.bonus_pulse?.desperation_meter ?? 0} sub="Market Sentiment" color="var(--accent-emerald)" />
             <BonusCard icon={Users} label="Interview Intensity" value={results?.bonus_pulse?.interview_difficulty ?? 0} sub="Friction Index" color="var(--accent-gold)" />
             <BonusCard icon={TrendingUp} label="Rarity Premium" value={results?.bonus_pulse?.skill_rarity ?? 0} sub="Arbitrage Score" color="var(--accent-blue)" />
        </div>
      </div>

      {/* ── PHASE 3: RESUME TAILOR ── */}
      <div className="space-y-6">
        <PhaseLabel number="03" title="Resume Tailor" sub="Elite Differentiation Suite" />
        
        {/* Row 1: Bias, Culture & Bullets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-6 flex flex-col gap-6">
                <BiasDetector bias={results?.deep_dive?.bias_analysis} />
                <CultureRadar radar={results?.deep_dive?.culture_radar} />
            </div>
            <div className="lg:col-span-6 flex flex-col">
                <ResumeBulletGenerator bullets={results?.resume_help?.bullets} />
            </div>
        </div>

        {/* Row 2: Interview Prep (Full Width Integrated) */}
        <div className="glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2 rounded-[3.5rem] border-white/20 relative group">
            <div className="absolute top-8 right-8 z-20">
                {(!jdText?.toLowerCase()?.includes('question') && !jdText?.toLowerCase()?.includes('interview')) && (
                    <LuminaInferenceBadge tooltip="Questions synthesized via Lumina Engine based on role requirements." />
                )}
            </div>
            <div className="p-8">
                <InterviewCoach 
                    questions={results?.interview_kit?.questions} 
                    interviewerQuestions={results?.interview_kit?.reverse_questions} 
                />
            </div>
        </div>

        {/* Row 3: Timeline & Archetype Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/20 p-8 rounded-[3rem] space-y-8 h-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Clock size={20} className="text-accent-blue" />
                        <span className="text-[12px] uppercase font-black tracking-widest text-foreground/70">Day-in-Life Simulation</span>
                    </div>
                    {(!jdText?.toLowerCase()?.includes('09:00') && !jdText?.toLowerCase()?.includes('schedule')) && (
                        <LuminaInferenceBadge tooltip="Daily routine inferred based on job title and market standards." />
                    )}
                </div>
                <LuminaTimeline data={results?.deep_dive?.day_in_life || []} />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                <IcebergAnalysis reality={results?.role_reality} archetype={results?.logistics?.archetype?.label} />
                <div className="glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/20 p-8 rounded-[2.5rem] flex-1 flex flex-col justify-center">
                    <RecruiterLens insights={results?.recruiter_lens || []} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const PhaseLabel = ({ number, title, sub }: { number: string, title: string, sub: string }) => (
    <div className="flex items-center gap-6 px-4">
        <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-accent-emerald tracking-[0.5em] leading-none mb-2">Protocol {number}</span>
            <div className="flex items-baseline gap-4">
                <h2 className="text-3xl font-serif italic text-foreground leading-none tracking-tight">{title}</h2>
                <div className="h-px w-32 bg-gradient-to-r from-foreground/20 to-transparent" />
                <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em]">{sub}</span>
            </div>
        </div>
    </div>
);

const BonusCard = ({ icon: Icon, label, value, sub, color }: { icon: LucideIcon, label: string, value: number, sub: string, color: string }) => (
  <div className="glass-panel bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/20 p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-700">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40 group-hover:text-primary transition-colors" style={{ color: color.startsWith('var') ? color : '' }}>
            <Icon size={18} className={!color.startsWith('var') ? `text-${color}` : ''} />
        </div>
        <div className="text-right">
            <span className="text-2xl font-display font-black tracking-tighter text-foreground block">{value}%</span>
            <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1 opacity-60 leading-none">{sub}</h4>
        </div>
      </div>
      
      <div className="space-y-2.5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80 block leading-none">{label}</span>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${value}%` }} 
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full" 
              style={{ backgroundColor: color.startsWith('var') ? color : '' }} 
            />
        </div>
      </div>
  </div>
);
