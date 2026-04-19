import React from "react";
import { CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Skill } from "@/types/jd";
import { cn } from "@/lib/utils";

const commonPreferred = [
  "git", "aws", "azure", "gcp", "cloud", "spark", "hadoop", "big data", "tableau", "power bi", 
  "docker", "kubernetes", "jenkins", "terraform", "ci/cd", "rest", "api", "graphql", "sql", 
  "nosql", "mongodb", "postgresql", "redis", "kafka", "elastic", "linux", "jira", "agile", 
  "scrum", "devops", "mlops", "tensorflow", "pytorch", "pandas", "numpy", "scikit", "java", 
  "python", "javascript", "typescript", "react", "next.js", "node", "go", "rust", "distributed system",
  "microservice", "security", "encryption", "auth0", "firebase", "tailwind", "figma", "storybook"
];

interface SkillHighlightsProps {
  skills: Skill[];
}

export const SkillHighlights = ({ skills, results }: { skills: Skill[], results?: DecodeResult | null }) => {
  // Required skills are importance >= 80 to ensure "Preferred" skills drop into the next category
  const requiredSkills = (skills || []).filter((s) => s.importance >= 80);
  const niceToHaveSkills = (skills || []).filter((s) => s.importance < 80 && s.importance > 0);

  // Fallback: Scavenger for preferred skills from keywords if the AI missed them
  const finalNiceToHave = [...niceToHaveSkills];
  
  // -- MULTI-SOURCE SCAVENGER (Keywords, Bullets, and Highlights) --
  const identifiedSkills = (skills || []).map(s => s.skill.toLowerCase());
  const potentialSources = [
    ...(results?.resume_help?.keywords || []),
    ...(results?.resume_help?.bullets || []),
    ...(results?.jd_rewrite?.highlights?.map(h => h.text) || [])
  ];

  if (potentialSources.length > 0) {
    const existingNames = new Set(finalNiceToHave.map(s => s.skill.toLowerCase()));
    
    // Look for preferred tech mentioned anywhere in the AI analysis
    commonPreferred.forEach(pref => {
      const prefLower = pref.toLowerCase();
      
      // If we haven't already identified this skill, check if it appears in any source text
      const isAlreadyRequired = identifiedSkills.some(id => 
        id === prefLower || id.includes(prefLower) || prefLower.includes(id)
      );

      if (!isAlreadyRequired && !existingNames.has(prefLower)) {
        
        const isMentioned = potentialSources.some(source => {
          const sLower = (source || "").toLowerCase();
          // Match if the source contains the tech name as a whole word or significant part
          return sLower.includes(prefLower);
        });

        if (isMentioned) {
          finalNiceToHave.push({ 
            skill: pref, 
            importance: 50, 
            category: "Preferred" 
          });
          existingNames.add(prefLower);
        }
      }
    });
  }

  // Group required skills by category
  const groupedRequired = requiredSkills.reduce((acc, skill) => {
    const cat = skill.category || "Industry Knowledge";
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
          {finalNiceToHave.map((skill, idx) => (
            <motion.span 
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="px-5 py-2 rounded-full border border-accent-gold/20 text-accent-gold text-[13px] font-bold tracking-tight bg-accent-gold/5 hover:bg-accent-gold/10 transition-colors cursor-default"
            >
              {skill.skill}
            </motion.span>
          ))}
          {finalNiceToHave.length === 0 && (
            <p className="text-sm text-muted-foreground italic pl-1">All identified skills are classified as core requirements.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
