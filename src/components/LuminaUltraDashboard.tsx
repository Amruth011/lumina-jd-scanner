import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, Target, TrendingUp, Clock, Ghost, Scale, 
  BrainCircuit, Star, Zap, UserCheck, MessageSquare,
  LayoutDashboard, Heart, SearchCheck, Briefcase, ArrowRight,
  ShieldCheck, Info, Copy, Activity, Sparkles, Download, Check, Users
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
import { LucideIcon } from "lucide-react";
import { generateUnifiedReport } from "@/lib/pdfExporter";
import { toast } from "sonner";

interface LuminaUltraDashboardProps {
  results: DecodeResult;
  resumeResults?: ResumeGapResult | null;
}

export const LuminaUltraDashboard = ({ results, resumeResults }: LuminaUltraDashboardProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const grade = results?.grade || { 
    score: 0, 
    letter: '?', 
    summary: 'Intelligence Report Pending...', 
    breakdown: {}, 
    plain_english_summary: [] 
  };

  const copyAllKeywords = () => {
    if (results?.resume_help?.keywords) {
        navigator.clipboard.writeText(results.resume_help.keywords.join(", "));
        toast.success("Keywords copied to clipboard");
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

  return (
    <div className="space-y-12 pb-24">
      {/* ── HERO INTELLIGENCE (Priority Metrics) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Total Score & Grade */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="glass-panel p-8 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden group min-h-[400px]">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <LuminaGauge 
                    value={grade.score} 
                    label="Aggregate Score" 
                    size={220} 
                    color="var(--primary)" 
                />
                <div className="mt-8 text-center relative z-10 space-y-4">
                  <div>
                    <span className="text-[12px] font-black uppercase text-primary/60 tracking-widest block">Intelligence Index</span>
                    <p className="text-[13px] text-muted-foreground mt-2 max-w-[280px] leading-relaxed font-medium">Composite score based on market value, role clarity, and risk factors.</p>
                  </div>
                  
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-3 px-8 py-3 rounded-full bg-foreground text-background text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    <Download size={14} />
                    Export Premium PDF
                  </button>
                </div>
            </div>
            <JdVerdictCard grade={grade} />
          </div>

          {/* Salary Range Card */}
          <div 
            className="lg:col-span-4 glass-panel p-10 rounded-[3.5rem] flex flex-col justify-center space-y-10 border-accent-gold/10 relative overflow-hidden group cursor-pointer"
            onClick={handleCopySalary}
          >
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Star size={140} className="text-accent-gold" />
                </div>
                <div className="space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-60">Projected Value Range</span>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`w-3 h-1 rounded-full ${i <= 5 ? 'bg-accent-gold' : 'bg-white/10'}`} />
                                ))}
                            </div>
                            <span className="text-[10px] uppercase font-black text-accent-gold tracking-widest">Confidence 100%</span>
                        </div>
                    </div>
                    
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-4xl lg:text-5xl font-display font-black tracking-[-0.07em] text-foreground leading-none group-hover:text-accent-gold transition-colors">
                            {results?.logistics?.salary_range?.currency === 'INR' ? '₹' : '$'}
                            {(results?.logistics?.salary_range?.min ?? 0).toLocaleString()}
                        </span>
                        <span className="text-xl text-muted-foreground/20 font-black">-</span>
                        <span className="text-4xl lg:text-5xl font-display font-black text-accent-emerald tracking-[-0.07em] leading-none">
                            {(results?.logistics?.salary_range?.max ?? 0).toLocaleString()}
                        </span>
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

      {/* ── PHASE 1: TACTICAL PULSE ── */}
      <div className="space-y-8">
        <PhaseLabel number="01" title="Tactical Pulse" sub="Quick Scannable Wins" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Seniority & Logistics */}
            <div className="lg:col-span-3 glass-panel p-8 flex flex-col justify-between items-center group">
                <LuminaGauge 
                    value={results?.qualifiers?.seniority_level ?? 0} 
                    label="Seniority Bar" 
                    size={150} 
                    color="var(--accent-emerald)" 
                    subLabel={(results?.qualifiers?.seniority_level ?? 0) > 70 ? "Executive" : (results?.qualifiers?.seniority_level ?? 0) > 40 ? "Mid-Senior" : "Entry-Mid"}
                />
                <div className="w-full space-y-3 mt-8">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Work Arrangement</span>
                        <span className="text-[10px] font-black uppercase text-accent-emerald tracking-widest">
                            {results?.logistics?.work_arrangement?.remote_friendly === 'yes' ? 'Remote' : results?.logistics?.work_arrangement?.remote_friendly === 'partial' ? 'Hybrid' : 'On-Site'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Skill Spectrum */}
            <div className="lg:col-span-5 glass-panel p-8 flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Target size={16} className="text-accent-gold" />
                        <span className="text-xs uppercase font-black tracking-widest text-foreground/70">Skill Criticality Spectrum</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 flex-1">
                    {(results?.skills || []).slice(0, 6).map((s, i) => (
                        <div key={i} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-gold/20 transition-all cursor-default">
                            <span className="text-sm font-display font-bold text-foreground/90 truncate">{s?.skill || "Essential Focus"}</span>
                            <div className="flex items-center justify-between mt-1">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                    (s?.importance || 0) > 75 ? 'bg-red-400/10 text-red-400' : 'bg-accent-gold/10 text-accent-gold'
                                }`}>
                                    {(s?.importance || 0) > 75 ? 'Impact' : 'Strategic'}
                                </span>
                                <span className="text-[10px] font-black text-foreground/20">{s?.importance || 0}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Critical Vulnerabilities */}
            <div className="lg:col-span-4 glass-panel p-8 rounded-[2.5rem] border-red-500/10 space-y-6">
                <div className="flex items-center gap-3">
                    <ShieldAlert size={18} className="text-red-500" />
                    <span className="text-xs uppercase font-black tracking-widest text-red-500/70">Red Flag Decoder</span>
                </div>
                <div className="space-y-4">
                    {(results?.red_flags || []).slice(0, 3).map((flag, i) => (
                        <div key={i} className="pl-4 border-l-2 border-red-500/20 space-y-1 group cursor-pointer" onClick={() => { navigator.clipboard.writeText(flag.note); toast.success("Insight copied"); }}>
                            <div className="flex items-center justify-between">
                                <p className="text-[13px] font-serif italic text-foreground tracking-tight underline decoration-red-500/20 decoration-2 underline-offset-4 group-hover:text-red-500 transition-colors">&ldquo;{flag.phrase}&rdquo;</p>
                                <span className="text-xs font-black text-red-500/60">{flag.intensity}%</span>
                            </div>
                            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{flag.note}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* ── PHASE 2: POWER METRICS ── */}
      <div className="space-y-8">
        <PhaseLabel number="02" title="Power Features" sub="Deep Extraction & Analysis" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Plain English Summary */}
            <div className="lg:col-span-7 glass-panel p-10 space-y-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-3xl font-serif italic text-foreground">The Professional Verdict</h3>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 mt-1">Executive Summary Points</p>
                    </div>
                    <Zap size={24} className="text-primary/20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
                    {(grade?.plain_english_summary || []).slice(0, 6).map((point, i) => (
                        <div key={i} className="flex gap-4 group/p cursor-pointer" onClick={() => { navigator.clipboard.writeText(point); toast.success("Summary point copied"); }}>
                            <span className="text-[11px] font-black text-primary/40 mt-1 group-hover/p:text-primary transition-colors">{String(i+1).padStart(2, '0')}</span>
                            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed group-hover/p:text-foreground transition-colors">
                                {point.split('**').map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-primary font-black">{part}</strong> : part)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strategic Deficit (Keywords) */}
            <div className="lg:col-span-5 glass-panel p-8 space-y-8 border-primary/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SearchCheck size={18} className="text-primary" />
                        <span className="text-xs uppercase font-black tracking-widest text-foreground/70">Strategic Deficit</span>
                    </div>
                    <button 
                        onClick={copyAllKeywords}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                        <Copy size={10} />
                        Copy All
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {(results?.resume_help?.keywords || []).map((word, i) => (
                        <div key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer" onClick={() => { navigator.clipboard.writeText(word); toast.success(`"${word}" copied`); }}>
                            <span className="text-[12px] font-bold text-foreground/80 tracking-tight">{word}</span>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground opacity-50 leading-relaxed italic">
                    Keywords analyzed for ATS frequency and semantic weights. High-priority missing anchors.
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

      {/* ── PHASE 3: STRATEGIC DIFFERENTIATORS ── */}
      <div className="space-y-12">
        <PhaseLabel number="03" title="Strategic Intelligence" sub="Elite Differentiation Suite" />
        
        {/* Row 1: Bias & Bullets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-6 flex flex-col">
                <BiasDetector bias={results?.deep_dive?.bias_analysis} />
            </div>
            <div className="lg:col-span-6 flex flex-col">
                <ResumeBulletGenerator bullets={results?.resume_help?.bullets} />
            </div>
        </div>

        {/* Row 2: Interview Prep (Full Width Integrated) */}
        <div className="glass-panel p-2 rounded-[3.5rem] border-white/5">
            <div className="p-8">
                <InterviewCoach 
                    questions={results?.interview_kit?.questions} 
                    interviewerQuestions={results?.interview_kit?.reverse_questions} 
                />
            </div>
        </div>

        {/* Row 3: Timeline & Archetype Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 glass-panel p-8 rounded-[3rem] space-y-8 h-full">
                <div className="flex items-center gap-4">
                    <Clock size={20} className="text-accent-blue" />
                    <span className="text-[12px] uppercase font-black tracking-widest text-foreground/70">Day-in-Life Simulation</span>
                </div>
                <LuminaTimeline data={results?.deep_dive?.day_in_life || []} />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                <IcebergAnalysis reality={results?.role_reality} archetype={results?.logistics?.archetype?.label} />
                <div className="glass-panel p-8 rounded-[2.5rem] flex-1 flex flex-col justify-center">
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
            <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em] leading-none mb-1">Phase {number}</span>
            <div className="flex items-baseline gap-4">
                <h2 className="text-3xl font-serif italic text-foreground leading-none">{title}</h2>
                <div className="h-px w-24 bg-foreground/10" />
                <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">{sub}</span>
            </div>
        </div>
    </div>
);

const BonusCard = ({ icon: Icon, label, value, sub, color }: { icon: LucideIcon, label: string, value: number, sub: string, color: string }) => (
  <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between hover:bg-white/5 transition-all duration-700">
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
