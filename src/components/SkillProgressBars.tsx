import { motion } from "framer-motion";
import type { Skill } from "@/types/jd";

interface SkillProgressBarsProps {
  skills: Skill[];
}

const categoryColors: Record<string, string> = {
  Languages: "from-blue-500 to-cyan-400",
  Frameworks: "from-violet-500 to-purple-400",
  Tools: "from-emerald-500 to-teal-400",
  Databases: "from-amber-500 to-orange-400",
  Cloud: "from-sky-500 to-blue-400",
  "Soft Skills": "from-pink-500 to-rose-400",
  Other: "from-slate-500 to-gray-400",
};

const getGradient = (category: string) =>
  categoryColors[category] || categoryColors.Other;

export const SkillProgressBars = ({ skills }: SkillProgressBarsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-strong rounded-2xl p-6 glow-border"
    >
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        Skills Breakdown
      </h3>
      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.skill}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-foreground">
                {skill.skill}
              </span>
              <span className="text-xs text-muted-foreground">
                {skill.category} · {skill.importance}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted/50 overflow-hidden glass">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.importance}%` }}
                transition={{ duration: 0.8, delay: 0.15 * i, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${getGradient(skill.category)}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
