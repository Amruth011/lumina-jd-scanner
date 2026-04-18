import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, Target, TrendingUp, Clock, Ghost, Scale, 
  BrainCircuit, Star, Zap, UserCheck, MessageSquareQuote,
  LayoutDashboard, Heart, SearchCheck, Briefcase
} from "lucide-react";
import type { DecodeResult } from "@/types/jd";
import { LuminaGauge } from "./LuminaGauge";
import { LuminaRadar } from "./LuminaRadar";
import { LuminaTimeline } from "./LuminaTimeline";
import { JdVerdictCard } from "./JdVerdictCard";
import { RecruiterLens } from "./RecruiterLens";
import { RoleDistribution } from "./RoleDistribution";
import { InterviewCoach } from "./InterviewCoach";
import { BonusInsights } from "./BonusInsights";
import { IcebergAnalysis } from "./IcebergAnalysis";

import { LucideIcon } from "lucide-react";

interface LuminaUltraDashboardProps {
  results: DecodeResult;
}

export const LuminaUltraDashboard = ({ results }: LuminaUltraDashboardProps) => {
  if (!results.grade) return null;

  return (
    <div className="space-y-24 pb-32">
      {/* ── SECTION A: THE VERDICT ── */}
      <div className="space-y-8">
          <JdVerdictCard grade={results.grade} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plain English Summary */}
            <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                   <Target size={18} className="text-primary" />
                 </div>
                 <h3 className="text-lg font-serif italic text-foreground">Plain English Summary</h3>
               </div>
               <div className="space-y-4">
                 {results.grade.plain_english_summary.map((point, i) => (
                    <div key={i} className="flex gap-4 group">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed font-display">
                        {point}
                      </p>
                    </div>
                 ))}
               </div>
            </div>

            {/* Red Flags Decoded */}
            <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-red-400/10 border border-red-400/20">
                   <ShieldAlert size={18} className="text-red-400" />
                 </div>
                 <h3 className="text-lg font-serif italic text-foreground">Red Flags Decoded</h3>
               </div>
               <div className="space-y-6">
                 {results.red_flags.map((flag, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-display font-bold text-foreground">{flag.phrase}</span>
                        <span className="text-[10px] font-black text-red-400/60">{flag.intensity}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${flag.intensity}%` }}
                          className="h-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]"
                        />
                      </div>
                      {flag.note && <p className="text-[10px] italic text-muted-foreground/60">{flag.note}</p>}
                    </div>
                 ))}
               </div>
            </div>
          </div>
      </div>

      {/* ── SECTION B: DO I QUALIFY? ── */}
      <div className="space-y-8">
        <SectionHeader icon={UserCheck} title="Do I Qualify?" sub="Skills, Seniority & Experience" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex flex-col items-center">
             <LuminaGauge 
                value={results.qualifiers.seniority_level} 
                label="Seniority Level" 
                size={160} 
                subLabel="Mid-Level"
                color="var(--accent-gold)"
             />
           </div>
           <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex flex-col items-center">
             <LuminaGauge 
                value={results.qualifiers.must_have_percent} 
                label="Must-Have Match" 
                size={160} 
                color="var(--accent-emerald)"
             />
           </div>
           <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex flex-col justify-center gap-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 px-2">Experience Weighting</span>
              <div className="space-y-6 px-2">
                 <ProgressBlock label="Professional" value={results.qualifiers.experience.professional} color="var(--accent-blue)" />
                 <ProgressBlock label="Project Proof" value={results.qualifiers.experience.project_proof} color="var(--accent-emerald)" />
              </div>
           </div>
           <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex flex-col items-center justify-center gap-2">
             <div className="w-24 h-24 rounded-full border-[8px] border-white/5 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="var(--primary)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (results.qualifiers.education.skills_first_percent / 100) * 251.2} strokeLinecap="round" />
                </svg>
                <span className="text-xl font-black">{results.qualifiers.education.skills_first_percent}%</span>
             </div>
             <span className="text-[10px] uppercase font-black text-center tracking-widest text-muted-foreground mt-2">Skills-First Approach</span>
           </div>
        </div>
      </div>

      {/* ── SECTION C: WORK LOGISTICS ── */}
      <div className="space-y-8">
        <SectionHeader icon={Briefcase} title="What's the Job Like?" sub="Compensation & Environment" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Estimated Salary Range</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-display font-black">
                     {results.logistics.salary_range?.currency === 'INR' ? '₹' : '$'}
                     {results.logistics.salary_range?.min.toLocaleString()} 
                   </span>
                   <span className="text-muted-foreground font-black opacity-20">—</span>
                   <span className="text-4xl font-display font-black text-accent-emerald">
                     {results.logistics.salary_range?.max.toLocaleString()}
                   </span>
                </div>
                <p className="text-[10px] italic text-muted-foreground/60">{results.logistics.salary_range?.note}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <LogicBadge label="Remote Friendly" value={results.logistics.work_arrangement.remote_friendly} color="blue" />
                 <LogicBadge label="Flexible Hours" value={results.logistics.work_arrangement.flexible_hours ? 'yes' : 'no'} color="emerald" />
              </div>
           </div>

           <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Role Archetype</span>
                 <div className="px-3 py-1 bg-accent-gold/10 rounded-full border border-accent-gold/20 flex items-center gap-2">
                    <Zap size={10} className="text-accent-gold" />
                    <span className="text-[9px] font-black text-accent-gold uppercase tracking-widest">{results.logistics.archetype.label}</span>
                 </div>
              </div>
              <p className="text-sm font-serif italic text-foreground leading-relaxed">
                 "{results.logistics.archetype.description}"
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                 <div>
                    <span className="text-[9px] uppercase font-black text-muted-foreground opacity-40 block mb-1">Focus</span>
                    <span className="text-xs font-display font-bold">{results.logistics.archetype.primary_focus}</span>
                 </div>
                 <div>
                    <span className="text-[9px] uppercase font-black text-muted-foreground opacity-40 block mb-1">Primary Tool</span>
                    <span className="text-xs font-display font-bold">{results.logistics.archetype.primary_tool}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

       {/* ── SECTION D: THE REALITY ── */}
       <div className="space-y-8">
        <SectionHeader icon={BrainCircuit} title="Deeper Analysis" sub="Tech Depth & Behavioral Competencies" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-8 flex flex-col items-center">
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 self-start">Role Dimensions</span>
              <LuminaRadar data={[
                { label: "Technical Depth", value: results.role_reality.dimensions.technical_depth },
                { label: "Research Autonomy", value: results.role_reality.dimensions.research_autonomy },
                { label: "Client Interaction", value: results.role_reality.dimensions.client_interaction },
                { label: "Strategic Impact", value: results.role_reality.dimensions.strategic_impact },
                { label: "Legacy Maintenance", value: results.role_reality.dimensions.legacy_maintenance },
              ]} size={320} />
           </div>
           <div className="space-y-6">
              <IcebergAnalysis reality={results.role_reality} />
           </div>
        </div>
      </div>

       {/* ── SECTION H: COMPANY DEEP DIVE ── */}
       <div className="space-y-8">
        <SectionHeader icon={Heart} title="Company Deep Dive" sub="Culture, Daily Life & Bias" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center">
                 <LuminaGauge value={results.deep_dive.bias_analysis.inclusivity_score} label="Inclusivity Score" color="var(--primary)" size={180} />
                 <div className="w-full mt-4 space-y-4">
                    {results.deep_dive.bias_analysis.tonal_map.map((t, i) => (
                      <div key={i} className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl">
                        <span className="text-[10px] uppercase font-black text-muted-foreground opacity-40">{t.category}</span>
                        <span className="text-xs font-display font-bold text-foreground">{t.tone}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="lg:col-span-2 glass-panel p-10 rounded-[3rem] border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                 <TrendingUp size={16} className="text-accent-emerald" />
                 <h4 className="text-sm font-serif italic">A Day in the Life</h4>
              </div>
              <LuminaTimeline data={results.deep_dive.day_in_life} />
           </div>
        </div>
      </div>

      {/* ── SECTION G: RECRUITER LENS & KIT ── */}
      <div className="space-y-8">
        <RecruiterLens insights={results.recruiter_lens} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <InterviewCoach questions={results.interview_kit.questions} interviewerQuestions={results.interview_kit.reverse_questions} />
           <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
                   <Star size={18} className="text-accent-blue" />
                 </div>
                 <h3 className="text-lg font-serif italic text-foreground">Resume Accelerator</h3>
              </div>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-40">Keywords to Exploit</span>
                    <div className="flex flex-wrap gap-2">
                       {results.resume_help.keywords.map((k, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg bg-accent-blue/10 text-accent-blue text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">{k}</span>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-3">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-40">AI-Optimized Bullets</span>
                    {results.resume_help.bullets.map((b, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4 group hover:bg-white/10 transition-all">
                          <Zap size={12} className="text-accent-gold flex-shrink-0 mt-1" />
                          <p className="text-xs font-serif italic text-foreground/80 leading-relaxed group-hover:text-foreground">{b}</p>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

       {/* ── SECTION I: BONUS PULSE ── */}
       <div className="space-y-8">
        <SectionHeader icon={TrendingUp} title="Competitive Edge" sub="Market Demand & Difficulty" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <BonusCard icon={Ghost} label="Ghost Job Risk" value={results.bonus_pulse.ghost_job_probability} sub="Probability" color="red-400" />
           <BonusCard icon={Scale} label="Desperation Meter" value={results.bonus_pulse.desperation_meter} sub="They Eagerly Need You" color="accent-emerald" />
           <BonusCard icon={Star} label="Interview Difficulty" value={results.bonus_pulse.interview_difficulty} sub="Hardcore Mode" color="accent-gold" />
           <BonusCard icon={TrendingUp} label="Skill Rarity" value={results.bonus_pulse.skill_rarity} sub="The 1% Elite" color="accent-blue" />
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

const ProgressBlock = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase text-foreground">{label}</span>
            <span className="text-xl font-black">{value}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1 }} className="h-full" style={{ backgroundColor: color }} />
        </div>
    </div>
);

const LogicBadge = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
        <span className="text-[9px] uppercase font-black text-muted-foreground opacity-40">{label}</span>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${value === 'no' ? 'bg-red-400' : 'bg-accent-emerald'}`} />
            <span className="text-xs font-display font-black uppercase tracking-widest">{value}</span>
        </div>
    </div>
);

const BonusCard = ({ icon: Icon, label, value, sub, color }: { icon: LucideIcon, label: string, value: number, sub: string, color: string }) => (
    <div className="glass-panel p-6 rounded-[2rem] border-white/5 space-y-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color}`}>
            <Icon size={18} />
        </div>
        <div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">{value}%</span>
                <span className="text-[9px] uppercase font-black text-muted-foreground opacity-40">{sub}</span>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mt-1">{label}</h4>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className={`h-full bg-${color}`} />
        </div>
    </div>
);
