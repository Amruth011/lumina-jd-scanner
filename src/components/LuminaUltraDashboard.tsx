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
  const grade = results.grade || { score: 0, letter: '?', summary: 'Analyzing...', breakdown: {}, plain_english_summary: [] };

  return (
    <div className="space-y-24 pb-32">
      {/* ── PHASE 1: 3-COLUMN TACTICAL HEADER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Total Score */}
         <div className="lg:col-span-3 glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <LuminaGauge 
                value={grade.score} 
                label="Total Score" 
                size={180} 
                color="var(--primary)" 
            />
            <span className="text-[10px] font-black uppercase text-primary/60 mt-4 tracking-widest">Performance Potential</span>
         </div>

         {/* Required vs Preferred Skills */}
         <div className="lg:col-span-6 glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target size={16} className="text-accent-gold" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-foreground/60">Required vs Preferred</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {results.skills.slice(0, 8).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[11px] font-medium text-foreground/80 truncate pr-2">{s.skill}</span>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter ${
                            s.importance > 80 ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 
                            s.importance > 50 ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20' :
                            'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                        }`}>
                            {s.importance > 80 ? 'Required' : s.importance > 50 ? 'Preferred' : 'Nice to have'}
                        </span>
                    </div>
                ))}
            </div>
         </div>

         {/* Work Mode Gauge */}
         <div className="lg:col-span-3 glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center">
            <LuminaGauge 
                value={results.qualifiers.seniority_level} 
                label="Seniority Fit" 
                size={160} 
                color="var(--accent-emerald)" 
                subLabel={results.qualifiers.seniority_level > 70 ? "Senior" : results.qualifiers.seniority_level > 40 ? "Mid-Level" : "Junior"}
            />
            <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)]" />
                <span className="text-[10px] uppercase font-black text-foreground/80 tracking-widest">
                    {results.logistics.work_arrangement.remote_friendly === 'yes' ? 'Full Remote' : results.logistics.work_arrangement.remote_friendly === 'partial' ? 'Hybrid' : 'On-Site'}
                </span>
            </div>
         </div>
      </div>

      {/* ── PHASE 2: PLAIN ENGLISH SUMMARY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            <div className="glass-panel p-10 rounded-[3rem] border-white/5 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <MessageSquareQuote size={120} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-serif italic text-foreground tracking-tight">JD Decoded — Plain English Summary</h2>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50">Here's what this job description actually means, stripped of the corporate speak.</p>
                </div>
                <div className="space-y-6">
                    {grade.plain_english_summary.map((point, i) => (
                        <div key={i} className="flex gap-6 group items-start">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-500">
                                {i + 1}
                            </span>
                            <p className="text-[15px] font-medium text-foreground/90 leading-relaxed font-display transition-colors group-hover:text-foreground">
                                {point.split('**').map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-primary font-black uppercase tracking-tight mx-1">{part}</strong> : part)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
         </div>

         <div className="lg:col-span-4">
            <JdVerdictCard grade={grade} />
         </div>
      </div>

      {/* ── PHASE 3/4: RED FLAGS & STRATEGIC BREAKDOWN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Red Flags: What they wrote vs what they meant */}
         <div className="lg:col-span-5 glass-panel p-10 rounded-[3rem] border-white/5 space-y-10 border-l-red-500/20">
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <ShieldAlert size={20} className="text-red-400" />
                    <h3 className="text-2xl font-serif italic text-foreground">Red Flags Decoded</h3>
                </div>
                <p className="text-[10px] uppercase font-black tracking-widest text-red-400/60">What they wrote vs. what they meant</p>
             </div>
             
             <div className="space-y-8">
                {results.red_flags.map((flag, i) => (
                    <div key={i} className="space-y-4 group">
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1.5 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-bold font-display italic">
                                &ldquo;{flag.phrase}&rdquo;
                            </div>
                            <ArrowRight size={14} className="text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1 bg-red-400/40 rounded-full h-auto" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground group-hover:text-red-400 transition-colors">
                                    {flag.note}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase font-black text-red-400/40">Risk Intensity</span>
                                    <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-400" style={{ width: `${flag.intensity}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
         </div>

         <div className="lg:col-span-7 space-y-8">
             {/* Salary Range & Work Arrangement */}
             <div className="glass-panel p-10 rounded-[3rem] border-white/5 space-y-8">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Estimated Salary Range</span>
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl font-display font-black tracking-tighter">
                                {results.logistics.salary_range?.currency === 'INR' ? '₹' : '$'}
                                {results.logistics.salary_range?.min.toLocaleString()}
                            </span>
                            <span className="text-2xl text-muted-foreground/30 font-black">/</span>
                            <span className="text-5xl font-display font-black text-accent-emerald tracking-tighter">
                                {results.logistics.salary_range?.max.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <span className="text-[9px] font-black uppercase text-accent-gold">Market Confidence</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-3 h-1 rounded-full ${i <= 3 ? 'bg-accent-gold' : 'bg-white/5'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Salary Visualization Bar */}
                <div className="space-y-2">
                    <div className="h-4 w-full bg-white/5 rounded-2xl p-1 border border-white/5">
                        <div className="h-full bg-gradient-to-r from-primary/40 via-accent-emerald to-primary/40 rounded-xl relative">
                            <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-0.5 h-6 bg-white/20" />
                            <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-0.5 h-6 bg-white/20" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-accent-emerald shadow-lg" />
                        </div>
                    </div>
                    <div className="flex justify-between px-2">
                        <span className="text-[8px] font-black uppercase text-muted-foreground">Market Low</span>
                        <span className="text-[8px] font-black uppercase text-foreground">Competitive Median</span>
                        <span className="text-[8px] font-black uppercase text-muted-foreground">Top 1% Tier</span>
                    </div>
                </div>
             </div>

             {/* Dimensions Radar & Iceberg */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4">
                     <span className="text-[10px] uppercase font-black text-muted-foreground opacity-50 self-start">Responsibility Breakdown</span>
                     <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            {results.logistics.responsibility_mix.reduce((acc, item, i) => {
                                const offset = acc.total;
                                acc.total += item.percent;
                                acc.elements.push(
                                    <circle
                                        key={i}
                                        cx="50" cy="50" r="40"
                                        fill="transparent"
                                        stroke={i === 0 ? 'var(--primary)' : i === 1 ? 'var(--accent-emerald)' : i === 2 ? 'var(--accent-gold)' : 'var(--accent-blue)'}
                                        strokeWidth="12"
                                        strokeDasharray={`${item.percent * 2.51} 251`}
                                        strokeDashoffset={-offset * 2.51}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                );
                                return acc;
                            }, { total: 0, elements: [] as React.ReactNode[] }).elements}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-black font-display tracking-tighter">100%</span>
                            <span className="text-[8px] font-black uppercase text-muted-foreground">Focus</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full pt-4">
                        {results.logistics.responsibility_mix.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--accent-emerald)' : i === 2 ? 'var(--accent-gold)' : 'var(--accent-blue)' }} />
                                <span className="text-[9px] font-medium text-foreground/80 truncate">{item.label}</span>
                                <span className="text-[9px] font-black ml-auto">{item.percent}%</span>
                            </div>
                        ))}
                     </div>
                </div>
                <div className="space-y-6">
                    <IcebergAnalysis reality={results.role_reality} />
                </div>
             </div>
         </div>
      </div>

      {/* ── PHASE 5: TIMELINES & CULTURE ── */}
      <div className="space-y-12">
        <div className="flex items-center gap-4">
            <h2 className="text-3xl font-serif italic">Operational Deep Dive</h2>
            <div className="h-px flex-1 bg-white/5" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 glass-panel p-10 rounded-[3rem] border-white/5 space-y-8">
                <div className="flex items-center gap-3">
                    <Clock size={16} className="text-accent-blue" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-foreground/60">A Typical Day (Draft Simulation)</span>
                </div>
                <LuminaTimeline data={results.deep_dive.day_in_life} />
            </div>

            <div className="lg:col-span-4 space-y-8">
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center gap-3">
                        <Heart size={16} className="text-red-400" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-foreground/60">Cultural DNA Check</span>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(results.deep_dive.culture_radar).map(([key, val]) => (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-medium text-foreground capitalize">{key.replace('_', ' ')}</span>
                                    <span className="text-xs font-black">{val}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] bg-accent-blue/5 border-accent-blue/10">
                    <RecruiterLens insights={results.recruiter_lens} />
                </div>
            </div>
        </div>
      </div>

      {/* ── SECTION I: BONUS PULSE ── */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <BonusCard icon={Ghost} label="Ghost Job Risk" value={results.bonus_pulse.ghost_job_probability} sub="Probability" color="red-400" />
           <BonusCard icon={Scale} label="Desperation Meter" value={results.bonus_pulse.desperation_meter} sub="They Eagerly Need You" color="var(--accent-emerald)" />
           <BonusCard icon={Star} label="Difficulty" value={results.bonus_pulse.interview_difficulty} sub="Hardcore Mode" color="var(--accent-gold)" />
           <BonusCard icon={TrendingUp} label="Skill Rarity" value={results.bonus_pulse.skill_rarity} sub="The 1% Elite" color="var(--accent-blue)" />
        </div>
      </div>

    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, sub }: { icon: LucideIcon, title: string, sub: string }) => (
  <div className="flex items-center justify-between border-b border-white/5 pb-6">
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-primary">
        <Icon size={20} />
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-serif italic text-foreground">{title}</h2>
        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50">{sub}</p>
      </div>
    </div>
  </div>
);

const BonusCard = ({ icon: Icon, label, value, sub, color }: { icon: LucideIcon, label: string, value: number, sub: string, color: string }) => (
  <div className="glass-panel p-6 rounded-[2rem] border-white/5 space-y-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center" style={{ color: color.startsWith('var') ? color : '' }}>
          <Icon size={18} className={!color.startsWith('var') ? `text-${color}` : ''} />
      </div>
      <div>
          <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">{value}%</span>
              <span className="text-[9px] uppercase font-black text-muted-foreground opacity-40">{sub}</span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest mt-1">{label}</h4>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className="h-full" style={{ backgroundColor: color.startsWith('var') ? color : '' }} />
      </div>
  </div>
);
