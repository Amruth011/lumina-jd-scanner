import { motion } from "framer-motion";
import type { Skill } from "@/types/jd";

interface SkillProgressBarsProps {
  skills: Skill[];
  priorityMode?: boolean;
}

const getSemanticTier = (importance: number) => {
  if (importance > 85) return { gradient: "from-[hsl(190,100%,40%)] to-[hsl(195,90%,55%)]", label: "Critical", labelClass: "text-[hsl(var(--skill-critical))] bg-[hsl(var(--skill-critical)/0.08)]" };
  if (importance >= 70) return { gradient: "from-[hsl(160,64%,36%)] to-[hsl(155,55%,48%)]", label: "Core", labelClass: "text-[hsl(var(--skill-core))] bg-[hsl(var(--skill-core)/0.08)]" };
  if (importance >= 50) return { gradient: "from-[hsl(258,70%,55%)] to-[hsl(265,65%,68%)]", label: "Supporting", labelClass: "text-[hsl(var(--skill-supporting))] bg-[hsl(var(--skill-supporting)/0.08)]" };
  return { gradient: "from-[hsl(215,16%,47%)] to-[hsl(215,12%,58%)]", label: "", labelClass: "" };
};

export const SkillProgressBars = ({ skills, priorityMode }: SkillProgressBarsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="premium-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Skills Breakdown
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground/50">{skills.length} total</span>
      </div>
      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
        {skills.map((skill, i) => {
          const tier = getSemanticTier(skill.importance);
          return (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-mono">
                  {tier.label && (
                    <span className={`text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${tier.labelClass}`}>
                      {tier.label}
                    </span>
                  )}
                  {skill.importance}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.importance}%` }}
                  transition={{ duration: 0.8, delay: 0.08 * i, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${tier.gradient}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
