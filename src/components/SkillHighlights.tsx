import React from "react";
import { Target, ShieldCheck, Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Skill, DecodeResult } from "@/types/jd";
import { scavengeSkills } from "@/lib/skillScavenger";

interface SkillHighlightsProps {
  skills: Skill[];
  results?: DecodeResult | null;
  rawJd?: string;
}

const SkillProgressBar = ({ skill, importance, color }: { skill: string, importance: number, color: string }) => (
  <div className="space-y-1.5 group">
    <div className="flex justify-between items-end px-1">
      <span className="text-[12px] font-bold text-foreground/80 group-hover:text-foreground transition-colors">{skill}</span>
      <span className="text-[10px] font-black text-muted-foreground/30 group-hover:text-foreground/40 transition-colors uppercase tracking-widest">{importance}%</span>
    </div>
    <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden p-0.5 border border-white/5">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${importance}%` }} 
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full rounded-full" 
        style={{ backgroundColor: color }} 
      />
    </div>
  </div>
);

export const SkillHighlights = ({ 
  skills, 
  results, 
  rawJd 
}: SkillHighlightsProps) => {
  const allSkills = scavengeSkills(skills || [], results, rawJd || "") || [];
  
  const requiredSkills = (allSkills || []).filter((s) => s && (s.importance ?? 0) >= 80);
  const niceToHaveSkills = (allSkills || []).filter((s) => s && (s.importance ?? 0) < 80 && (s.importance ?? 0) > 0);

  // Group required skills by category
  const groupedRequired = (requiredSkills || []).reduce((acc, skill) => {
    if (!skill || !skill.skill) return acc;
    const cat = skill.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel p-10 rounded-[3rem] space-y-12 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/20"
    >
      {/* Required Skills Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
             <Target size={18} className="text-primary" />
             <span className="text-xs uppercase font-black tracking-widest text-primary/60">Essential Requirements</span>
          </div>
          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{requiredSkills.length} Core Competencies</span>
        </div>

        {Object.keys(groupedRequired).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {Object.entries(groupedRequired).map(([category, categorySkills]) => (
              <div key={category} className="space-y-4">
                <div className="px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 w-fit flex items-center gap-2">
                    {category.toLowerCase().includes("ai") || category.toLowerCase().includes("gen") ? <Sparkles size={12} className="text-primary" /> : 
                     category.toLowerCase().includes("found") || category.toLowerCase().includes("core") ? <Brain size={12} className="text-primary" /> : 
                     category.toLowerCase().includes("infra") || category.toLowerCase().includes("cloud") || category.toLowerCase().includes("security") ? <ShieldCheck size={12} className="text-primary" /> :
                     <Target size={12} className="text-primary" />}
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">{category}</span>
                </div>
                <div className="space-y-4">
                  {categorySkills.map((skill, idx) => (
                    <SkillProgressBar key={idx} skill={skill?.skill || "Technical Skill"} importance={skill?.importance || 80} color="var(--primary)" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-8 py-12 text-center glass-panel rounded-[2rem] border-dashed border-foreground/5 opacity-40">
             <Brain size={32} className="mx-auto mb-3 text-primary/40" />
             <p className="text-[10px] font-black uppercase tracking-widest">No matching core competencies identified</p>
          </div>
        )}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent my-4" />

      {/* Nice-to-Have Skills Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
             <ShieldCheck size={18} className="text-accent-emerald" />
             <span className="text-xs uppercase font-black tracking-widest text-accent-emerald/60">Nice-to-Have Expansion</span>
          </div>
          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{niceToHaveSkills.length} Preferred Assets</span>
        </div>

        {niceToHaveSkills.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {niceToHaveSkills.map((skill, idx) => (
              <div 
                key={idx} 
                className="px-4 py-3 rounded-2xl bg-accent-emerald/5 border border-accent-emerald/10 hover:bg-accent-emerald/10 transition-all cursor-default group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-foreground/80 truncate">{skill.skill}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald/40 group-hover:scale-125 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-8 py-8 text-center glass-panel rounded-[2rem] border-dashed border-foreground/5 opacity-40">
             <p className="text-[10px] font-black uppercase tracking-widest">No secondary skills detected</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
