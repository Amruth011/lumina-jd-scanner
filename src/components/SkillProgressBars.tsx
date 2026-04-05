import { motion } from "framer-motion";
import type { Skill } from "@/types/jd";

interface SkillProgressBarsProps {
  skills: Skill[];
  priorityMode?: boolean;
}

const getSemanticTier = (importance: number) => {
  if (importance > 85) return { gradient: "from-[hsl(var(--skill-critical))] to-[hsl(var(--skill-critical)/0.7)]", label: "Critical", labelClass: "text-[hsl(var(--skill-critical))] bg-[hsl(var(--skill-critical)/0.1)] border border-[hsl(var(--skill-critical)/0.2)]" };
  if (importance >= 70) return { gradient: "from-[hsl(var(--skill-core))] to-[hsl(var(--skill-core)/0.7)]", label: "Core", labelClass: "text-[hsl(var(--skill-core))] bg-[hsl(var(--skill-core)/0.1)] border border-[hsl(var(--skill-core)/0.2)]" };
  if (importance >= 50) return { gradient: "from-[hsl(var(--skill-supporting))] to-[hsl(var(--skill-supporting)/0.7)]", label: "Supporting", labelClass: "text-[hsl(var(--skill-supporting))] bg-[hsl(var(--skill-supporting)/0.1)] border border-[hsl(var(--skill-supporting)/0.2)]" };
  return { gradient: "from-[hsl(var(--skill-muted))] to-[hsl(var(--skill-muted)/0.7)]", label: "", labelClass: "" };
};

export const SkillProgressBars = ({ skills, priorityMode }: SkillProgressBarsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-strong rounded-2xl p-6 premium-card"
    >
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        Skills Breakdown
      </h3>
      <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-2">
        {skills.map((skill, i) => {
          const tier = getSemanticTier(skill.importance);
          return (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-foreground">
                  {skill.skill}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {tier.label && (
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${tier.labelClass}`}>
                      {tier.label}
                    </span>
                  )}
                  <span className="font-mono text-xs">{skill.importance}%</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.importance}%` }}
                  transition={{ duration: 0.8, delay: 0.15 * i, ease: "easeOut" }}
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
