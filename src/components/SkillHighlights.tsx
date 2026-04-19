import React from "react";
import { CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Skill } from "@/types/jd";
import { cn } from "@/lib/utils";

const commonPreferred = [
  // AI & Agentic Stack
  "rag", "langchain", "agentic", "semantic search", "generative ai", "genai", "llm", "google agent",
  // Data Science Libraries (often required vs just "Python")
  "pandas", "numpy", "scikit", "scikit-learn", "matplotlib", "seaborn", "tableau", "power bi",
  // Machine Learning Foundations
  "linear regression", "logistic regression", "decision trees", "hypothesis testing", "eda", "data cleaning", "preprocessing",
  // Infrastructure & Cloud
  "git", "aws", "azure", "gcp", "cloud", "spark", "pyspark", "hadoop", "big data", 
  "docker", "kubernetes", "jenkins", "terraform", "ci/cd", 
  // Database & Modern Stack
  "sql", "nosql", "mongodb", "postgresql", "redis", "kafka", "elastic", "linux", "jira", "agile", 
  "scrum", "devops", "mlops", "tensorflow", "pytorch", "java", 
  "python", "javascript", "typescript", "react", "next.js", "node", "go", "rust"
];

interface SkillHighlightsProps {
  skills: Skill[];
}

export const SkillHighlights = ({ 
  skills, 
  results, 
  rawJd 
}: { 
  skills: Skill[], 
  results?: DecodeResult | null,
  rawJd?: string
}) => {
  // Required skills are importance >= 80 to ensure "Preferred" skills drop into the next category
  const requiredSkills = (skills || []).filter((s) => s.importance >= 80);
  const niceToHaveSkills = (skills || []).filter((s) => s.importance < 80 && s.importance > 0);

  // -- MULTI-SOURCE SCAVENGER (Keywords, Bullets, Highlights, AND Raw JD) --
  const identifiedSkills = (skills || []).map(s => s.skill.toLowerCase());
  const finalRequired = [...requiredSkills];
  const finalNiceToHave = [...niceToHaveSkills];
  
  const potentialSources = [
    ...(results?.resume_help?.keywords || []),
    ...(results?.resume_help?.bullets || []),
    ...(results?.jd_rewrite?.highlights?.map(h => h.text) || []),
    ...(rawJd ? [rawJd] : [])
  ];

  if (potentialSources.length > 0) {
    const existingRequiredNames = new Set(finalRequired.map(s => s.skill.toLowerCase()));
    const existingNiceNames = new Set(finalNiceToHave.map(s => s.skill.toLowerCase()));
    
    // Pattern to detect "Must-Have" intensity
    const requiredPatterns = ["essential", "required", "must have", "proficiency in", "solid understanding", "foundational knowledge", "must-to-have", "mandatory", "expected"];

    commonPreferred.forEach(pref => {
      const prefLower = pref.toLowerCase();
      
      // Check if we already have this skill in either category
      const isAlreadyHandled = 
        identifiedSkills.some(id => id === prefLower || id.includes(prefLower)) ||
        existingRequiredNames.has(prefLower) || 
        existingNiceNames.has(prefLower);

      if (!isAlreadyHandled) {
        let isMentioned = false;
        let isHighIntensity = false;

        potentialSources.forEach(source => {
          const sLower = (source || "").toLowerCase();
          
          // Use regex with word boundaries for precision, especially for short words like "R"
          const wordRegex = new RegExp(`\\b${prefLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (wordRegex.test(sLower)) {
            isMentioned = true;
            
            // Intensity check: check the surroundings of the match (approx 100 chars)
            if (requiredPatterns.some(p => sLower.includes(p))) {
              // Simple check: if a required pattern exists in the same source string
              isHighIntensity = true;
            }
          }
        });

        if (isMentioned) {
          if (isHighIntensity) {
            finalRequired.push({ 
              skill: pref, 
              importance: 90, 
              category: "Technical" 
            });
            existingRequiredNames.add(prefLower);
          } else {
            finalNiceToHave.push({ 
              skill: pref, 
              importance: 50, 
              category: "Preferred" 
            });
            existingNiceNames.add(prefLower);
          }
        }
      }
    });
  }

  // Final cleanup: remove duplicates from niceToHave if they got promoted to required
  const cleanedNiceToHave = finalNiceToHave.filter(s => 
    !finalRequired.some(rs => rs.skill.toLowerCase() === s.skill.toLowerCase())
  );

  // Group required skills by category
  const groupedRequired = finalRequired.reduce((acc, skill) => {
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
          {cleanedNiceToHave.map((skill, idx) => (
            <motion.span 
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="px-5 py-2 rounded-full border border-accent-gold/20 text-accent-gold text-[13px] font-bold tracking-tight bg-accent-gold/5 hover:bg-accent-gold/10 transition-colors cursor-default"
            >
              {skill.skill}
            </motion.span>
          ))}
          {cleanedNiceToHave.length === 0 && (
            <p className="text-sm text-muted-foreground italic pl-1">All identified skills are classified as core requirements.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
