import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, Target, TrendingUp, Clock, Ghost, Scale, 
  BrainCircuit, Star, Zap, UserCheck, MessageSquareQuote,
  LayoutDashboard, Heart, SearchCheck, Briefcase, ArrowRight,
  ShieldCheck, Info
} from "lucide-react";
import type { DecodeResult } from "@/types/jd";
import { LuminaGauge } from "./LuminaGauge";
import { LuminaRadar } from "./LuminaRadar";
import { LuminaTimeline } from "./LuminaTimeline";
import { JdVerdictCard } from "./JdVerdictCard";
import { RecruiterLens } from "./RecruiterLens";
import { InterviewCoach } from "./InterviewCoach";
import { IcebergAnalysis } from "./IcebergAnalysis";
import { LucideIcon } from "lucide-react";

interface LuminaUltraDashboardProps {
  results: DecodeResult;
}

export const LuminaUltraDashboard = ({ results }: LuminaUltraDashboardProps) => {
  // Safe extraction of grade with defaults
  const grade = results?.grade || { 
    score: 0, 
    letter: '?', 
    summary: 'Intelligence Report Pending...', 
    breakdown: {}, 
    plain_english_summary: [] 
  };

  return (
    <div className="space-y-10 pb-20">
      {/* ── PHASE 1: ELITE TACTICAL HEADER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Total Score Card */}
         <div className="lg:col-span-4 glass-panel p-10 rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <LuminaGauge 
                value={grade.score} 
                label="Aggregate Score" 
                size={200} 
                color="var(--primary)" 
            />
            <div className="mt-8 text-center relative z-10">
              <span className="text-[12px] font-black uppercase text-primary/60 tracking-widest block">Intelligence Index</span>
              <p className="text-[13px] text-muted-foreground mt-2 max-w-[240px] leading-relaxed font-medium">Composite measure of clarity, risk, and compensation competitiveness.</p>
            </div>
         </div>

         {/* Required vs Preferred Skills */}
         <div className="lg:col-span-5 glass-panel p-10 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between h-full bg-gradient-to-br from-white/[0.01] to-transparent">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Target size={18} className="text-accent-gold" />
                    <span className="text-xs uppercase font-black tracking-widest text-foreground/70">Skill Criticality Spectrum</span>
                </div>
                <p className="text-xs text-muted-foreground opacity-60 font-medium">Highest priority requirements extracted from JD semantics.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                {(results?.skills || []).slice(0, 8).map((s, i) => (
                    <div key={i} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-500">
                        <span className="text-[14px] font-display font-bold text-foreground/90 truncate">{s.skill}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`px-2.5 py-1 rounded-lg text-[12px] font-black uppercase tracking-widest ${
                              s.importance > 80 ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 
                              s.importance > 50 ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20' :
                              'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                          }`}>
                              {s.importance > 80 ? 'Impact' : s.importance > 50 ? 'Strategic' : 'Support'}
                          </span>
                          <span className="text-xs font-black text-foreground/20">{s.importance}%</span>
                        </div>
                    </div>
                ))}
            </div>
         </div>

         {/* Seniority & Logistics Overlay */}
         <div className="lg:col-span-3 glass-panel p-10 rounded-[2.5rem] border-white/5 flex flex-col items-center justify-between h-full">
            <div className="flex-1 flex items-center">
                <LuminaGauge 
                    value={results?.qualifiers?.seniority_level ?? 0} 
                    label="Seniority Bar" 
                    size={160} 
                    color="var(--accent-emerald)" 
                    subLabel={(results?.qualifiers?.seniority_level ?? 0) > 70 ? "Executive" : (results?.qualifiers?.seniority_level ?? 0) > 40 ? "Mid-Senior" : "Entry-Mid"}
                />
            </div>
            
            <div className="w-full space-y-4 mt-6">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Work Mode</span>
                <span className="text-xs font-black uppercase text-accent-emerald tracking-widest">
                  {results?.logistics?.work_arrangement?.remote_friendly === 'yes' ? 'Remote' : results?.logistics?.work_arrangement?.remote_friendly === 'partial' ? 'Hybrid' : 'On-Site'}
                </span>
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 ring-1 ring-accent-gold/20">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Market Comp</span>
                <span className="text-xs font-black uppercase text-accent-gold tracking-widest">Top 0.1%</span>
              </div>
            </div>
         </div>
      </div>

      {/* ── PHASE 2: VERDICT & INTELLIGENCE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
         <div className="lg:col-span-8 flex flex-col">
            <div className="glass-panel p-10 lg:p-14 rounded-[3rem] border-white/5 space-y-10 relative overflow-hidden flex-1 font-display bg-gradient-to-br from-white/[0.01] to-transparent">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <MessageSquareQuote size={180} />
                </div>
                <div className="space-y-3 relative z-10">
                    <h2 className="text-4xl font-serif italic text-foreground tracking-tight">The Professional Verdict</h2>
                    <p className="text-xs uppercase font-black tracking-[0.3em] text-muted-foreground opacity-50">High-fidelity analysis of technical and cultural expectations.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
                    {(grade.plain_english_summary || []).slice(0, 6).map((point, i) => (
                        <div key={i} className="flex gap-6 group">
                            <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-primary/5 text-primary text-[13px] font-black flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-700 transform group-hover:rotate-6">
                                {i + 1}
                            </span>
                            <p className="text-[15px] font-medium text-foreground/90 leading-relaxed group-hover:text-foreground transition-colors">
                                {point.split('**').map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-primary font-black uppercase tracking-[0.05em] mx-0.5">{part}</strong> : part)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
         </div>

         <div className="lg:col-span-4 flex flex-col h-full">
            <JdVerdictCard grade={grade} />
         </div>
      </div>

      {/* ── PHASE 3/4: RISK & REWARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
         {/* Strategic Insights Section */}
         <div className="lg:col-span-5 glass-panel p-10 rounded-[3rem] border-white/5 space-y-10 bg-gradient-to-br from-red-500/[0.03] to-transparent flex flex-col h-full">
             <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-500">
                      <ShieldAlert size={20} />
                    </div>
                    <h3 className="text-3xl font-serif italic text-foreground">Critical Vulnerabilities</h3>
                </div>
                <p className="text-xs uppercase font-black tracking-widest text-red-500/50">Language deconstruction & hidden risks</p>
             </div>
             
             <div className="space-y-8 flex-1">
                {(results?.red_flags || []).map((flag, i) => (
                    <div key={i} className="space-y-4 group relative">
                        <div className="flex items-center justify-between">
                            <div className="px-5 py-2.5 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-400 text-[14px] font-serif italic">
                                &ldquo;{flag.phrase}&rdquo;
                            </div>
                            <div className="text-right">
                              <span className="text-[12px] uppercase font-black text-red-500/60 block mb-1">Impact</span>
                              <span className="text-sm font-black text-red-500">{flag.intensity}%</span>
                            </div>
                        </div>
                        <div className="pl-5 border-l-2 border-red-400/20">
                            <p className="text-[14px] font-medium text-foreground/70 leading-relaxed italic">
                                {flag.note}
                            </p>
                        </div>
                    </div>
                ))}
             </div>
         </div>

         <div className="lg:col-span-7 space-y-6 flex flex-col">
             {/* Salary Range Card */}
             <div className="glass-panel p-10 rounded-[3rem] border-white/5 space-y-8 bg-gradient-to-br from-accent-emerald/[0.03] to-transparent flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <span className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-60">Projected Value Range</span>
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl lg:text-7xl font-display font-black tracking-tighter text-foreground">
                                {results?.logistics?.salary_range?.currency === 'INR' ? '₹' : '$'}
                                {(results?.logistics?.salary_range?.min ?? 0).toLocaleString()}
                            </span>
                            <span className="text-3xl text-muted-foreground/20 font-black">-</span>
                            <span className="text-5xl lg:text-7xl font-display font-black text-accent-emerald tracking-tighter">
                                {(results?.logistics?.salary_range?.max ?? 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="p-5 rounded-[2rem] bg-accent-gold/10 border border-accent-gold/20 text-right">
                        <span className="text-xs font-black uppercase text-accent-gold block mb-3 opacity-60">Confidence</span>
                        <div className="flex gap-2 justify-end">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-5 h-2 rounded-full ${i <= 4 ? 'bg-accent-gold' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-4">
                    <div className="h-6 w-full bg-white/5 rounded-full p-1 border border-white/5 relative">
                        <div className="h-full bg-gradient-to-r from-primary/20 via-accent-emerald/60 to-primary/20 rounded-full">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-4 border-accent-emerald shadow-[0_0_20px_rgba(var(--accent-emerald-rgb),0.8)] z-20" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 px-4">
                        <div className="space-y-1.5">
                          <span className="text-xs font-black uppercase text-muted-foreground/40 block">Market Floor</span>
                          <span className="text-[13px] font-bold">Safe Standard</span>
                        </div>
                        <div className="space-y-1.5 text-center font-display">
                          <span className="text-xs font-black uppercase text-foreground/60 block">Competitiveness</span>
                          <span className="text-[13px] font-black text-accent-emerald tracking-widest uppercase">Elite Top Tier</span>
                        </div>
                        <div className="space-y-1.5 text-right">
                          <span className="text-xs font-black uppercase text-muted-foreground/40 block">Market Ceiling</span>
                          <span className="text-[13px] font-bold">Aggressive Alpha</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* Secondary Visualization Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="glass-panel p-10 rounded-[2.5rem] flex flex-col items-center justify-between space-y-10 h-full border-white/5">
                     <span className="text-xs uppercase font-black text-muted-foreground opacity-50 self-start tracking-[0.2em]">Operational Distribution</span>
                     <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            {(results?.logistics?.responsibility_mix || []).reduce((acc, item, i) => {
                                const offset = acc.total;
                                acc.total += item.percent;
                                acc.elements.push(
                                    <circle
                                        key={i}
                                        cx="50" cy="50" r="40"
                                        fill="transparent"
                                        stroke={i === 0 ? 'var(--primary)' : i === 1 ? 'var(--accent-emerald)' : i === 2 ? 'var(--accent-gold)' : 'var(--accent-blue)'}
                                        strokeWidth="15"
                                        strokeDasharray={`${item.percent * 2.51} 251`}
                                        strokeDashoffset={-offset * 2.51}
                                        className="transition-all duration-1000 ease-out opacity-80"
                                    />
                                );
                                return acc;
                            }, { total: 0, elements: [] as React.ReactNode[] }).elements}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-black font-display tracking-tighter text-foreground">100%</span>
                            <span className="text-xs font-black uppercase text-primary/40 tracking-widest">Focus</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 gap-2.5 w-full pt-4">
                        {(results?.logistics?.responsibility_mix || []).map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-crosshair">
                                <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(currentColor,0.5)]" style={{ backgroundColor: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--accent-emerald)' : i === 2 ? 'var(--accent-gold)' : 'var(--accent-blue)' }} />
                                <span className="text-xs font-black uppercase tracking-widest text-foreground/80 truncate">{item.label}</span>
                                <span className="text-xs font-black ml-auto text-foreground/40">{item.percent}%</span>
                            </div>
                        ))}
                     </div>
                </div>
                <div className="flex flex-col h-full">
                  <IcebergAnalysis reality={results?.role_reality} archetype={results?.logistics?.archetype?.label} />
                </div>
             </div>
         </div>
      </div>

      {/* ── PHASE 5: OPERATIONAL DEEP DIVE ── */}
      <div className="space-y-8">
        <div className="flex items-center gap-8 pl-4">
            <h2 className="text-3xl font-serif italic whitespace-nowrap text-foreground/90">The Execution Layer</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 glass-panel p-10 lg:p-12 rounded-[3.5rem] border-white/5 space-y-10 flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Clock size={22} className="text-accent-blue" />
                        <span className="text-xs uppercase font-black tracking-[0.3em] text-foreground/70">Day-in-Life Simulation</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <LuminaTimeline data={results?.deep_dive?.day_in_life || []} />
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
                <div className="glass-panel p-10 rounded-[3rem] space-y-10 flex-1 border-white/5">
                    <div className="flex items-center gap-4">
                        <Heart size={20} className="text-red-400" />
                        <span className="text-xs uppercase font-black tracking-[0.3em] text-foreground/70">Cultural DNA Radar</span>
                    </div>
                    <div className="space-y-8">
                        {Object.entries(results?.deep_dive?.culture_radar || {}).map(([key, val]) => (
                            <div key={key} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black uppercase tracking-widest text-foreground/60 capitalize">{key.replace('_', ' ')}</span>
                                    <span className="text-xs font-black text-primary">{(val as number)}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <div className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]" style={{ width: `${(val as number)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-10 rounded-[3rem] bg-accent-blue/5 border-accent-blue/10 flex flex-col justify-center">
                    <RecruiterLens insights={results?.recruiter_lens || []} />
                </div>
            </div>
        </div>
      </div>

      {/* ── PHASE 6: BONUS INTELLIGENCE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <BonusCard icon={Ghost} label="Ghost Job Risk" value={results?.bonus_pulse?.ghost_job_probability ?? 0} sub="Entity Score" color="red-400" />
         <BonusCard icon={Scale} label="Desperation Meter" value={results?.bonus_pulse?.desperation_meter ?? 0} sub="Urgency Ratio" color="var(--accent-emerald)" />
         <BonusCard icon={Star} label="Entry Friction" value={results?.bonus_pulse?.interview_difficulty ?? 0} sub="Hardcore Mode" color="var(--accent-gold)" />
         <BonusCard icon={TrendingUp} label="Rarity Premium" value={results?.bonus_pulse?.skill_rarity ?? 0} sub="Skill Arbitrage" color="var(--accent-blue)" />
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, sub }: { icon: LucideIcon, title: string, sub: string }) => (
  <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-6">
    <div className="flex items-center gap-5">
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-primary">
        <Icon size={22} />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-4xl font-serif italic text-foreground tracking-tight">{title}</h2>
        <p className="text-xs uppercase font-black tracking-[0.3em] text-muted-foreground opacity-50">{sub}</p>
      </div>
    </div>
  </div>
);

const BonusCard = ({ icon: Icon, label, value, sub, color }: { icon: LucideIcon, label: string, value: number, sub: string, color: string }) => (
  <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between hover:bg-white/5 transition-all duration-700 min-h-[180px]">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-[1.2rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40 group-hover:text-primary transition-colors" style={{ color: color.startsWith('var') ? color : '' }}>
            <Icon size={20} className={!color.startsWith('var') ? `text-${color}` : ''} />
        </div>
        <div className="text-right">
            <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-4xl font-display font-black tracking-tighter text-foreground">{value}%</span>
            </div>
            <h4 className="text-[12px] font-black uppercase text-muted-foreground tracking-[0.2em] mt-1 opacity-60">{sub}</h4>
        </div>
      </div>
      
      <div className="space-y-3">
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/80 block">{label}</span>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${value}%` }} 
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full shadow-[0_0_10px_rgba(currentColor,0.4)]" 
              style={{ backgroundColor: color.startsWith('var') ? color : '' }} 
            />
        </div>
      </div>
  </div>
);
