import React from "react";
import { CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Skill, DecodeResult } from "@/types/jd";
import { cn } from "@/lib/utils";

import { scavengeSkills } from "@/lib/skillScavenger";

interface SkillHighlightsProps {
  skills: Skill[];
  results?: DecodeResult | null;
  rawJd?: string;
}

export const SkillHighlights = ({ 
  skills, 
  results, 
  rawJd 
}: SkillHighlightsProps) => {
  const allSkills = scavengeSkills(skills || [], results, rawJd || "") || [];
  
  const requiredSkills = (allSkills || []).filter((s) => s && s.importance >= 80);
  const niceToHaveSkills = (allSkills || []).filter((s) => s && s.importance < 80 && s.importance > 0);

  // Group required skills by category
  const groupedRequired = requiredSkills.reduce((acc, skill) => {
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
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20">
            <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
          </div>
          <div>
            <h3 className="text-3xl font-serif italic text-foreground tracking-tight">Required Skills</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 mt-0.5">Primary role expectations</p>
          </div>
        </div>

        <div className="space-y-10">
          {Object.entries(groupedRequired).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 pl-1">{category}</h4>
              <div className="flex flex-wrap gap-2.5">
                {items.map((skill, idx) => (
                  <motion.span 
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="px-5 py-2 rounded-full bg-accent-emerald/5 text-accent-emerald text-[13px] font-bold tracking-tight border border-accent-emerald/10 hover:bg-accent-emerald/10 transition-colors cursor-default"
                  >
                    {skill.skill}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(groupedRequired).length === 0 && (
            <p className="text-sm text-muted-foreground italic pl-1">No critical requirements detected.</p>
          )}
        </div>
      </div>

      {/* Nice to Have Skills Section */}
      <div className="space-y-8 pt-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-accent-gold/10 border border-accent-gold/20">
            <Star className="w-5 h-5 text-accent-gold fill-accent-gold/20" />
          </div>
          <div>
            <h3 className="text-3xl font-serif italic text-foreground tracking-tight">Nice to Have Skills</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 mt-0.5 max-w-[200px] leading-tight">Additional Pulsing Signals (Optional but beneficial)</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {niceToHaveSkills.map((skill, idx) => (
            <motion.span 
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="px-5 py-2 rounded-full border border-accent-gold/20 text-accent-gold text-[13px] font-bold tracking-tight bg-accent-gold/5 hover:bg-accent-gold/10 transition-colors cursor-default"
            >
              {skill.skill}
            </motion.span>
          ))}
          {niceToHaveSkills.length === 0 && (
            <p className="text-sm text-muted-foreground italic pl-1">All identified skills are classified as core requirements.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
