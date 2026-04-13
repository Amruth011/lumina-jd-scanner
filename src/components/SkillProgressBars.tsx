import { motion } from "framer-motion";
import type { Skill } from "@/types/jd";

interface SkillProgressBarsProps {
  skills: Skill[];
  priorityMode?: boolean;
}

const getSemanticTier = (importance: number) => {
  if (importance > 85) return { gradient: "from-accent-blue to-accent-blue/60", label: "Critical", labelClass: "text-accent-blue bg-accent-blue/10 border-accent-blue/10" };
  if (importance >= 70) return { gradient: "from-accent-emerald to-accent-emerald/60", label: "Core", labelClass: "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/10" };
  if (importance >= 50) return { gradient: "from-accent-violet to-accent-violet/60", label: "Supporting", labelClass: "text-accent-violet bg-accent-violet/10 border-accent-violet/10" };
  return { gradient: "from-muted-foreground/40 to-muted-foreground/20", label: "", labelClass: "" };
};

export const SkillProgressBars = ({ skills, priorityMode }: SkillProgressBarsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="premium-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Skills Breakdown
        </h3>
        <span className="text-[10px] font-mono font-bold text-muted-foreground/40 uppercase tracking-tighter">{skills.length} skills total</span>
      </div>
      <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
        {skills.map((skill, i) => {
          const tier = getSemanticTier(skill.importance);
          return (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-bold text-foreground/90 tracking-tight">{skill.skill}</span>
                <span className="text-[10px] text-muted-foreground/70 flex items-center gap-2 font-mono font-bold">
                  {tier.label && (
                    <span className={`text-[9px] font-bold uppercase tracking-[0.12em] px-2.5 py-0.5 rounded-full border shadow-sm ${tier.labelClass}`}>
                      {tier.label}
                    </span>
                  )}
                  {skill.importance}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.importance}%` }}
                  transition={{ duration: 0.8, delay: 0.08 * i, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${tier.gradient} shadow-[0_0_10px_rgba(0,0,0,0.05)]`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
