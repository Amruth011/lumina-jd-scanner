import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { Skill } from "@/types/jd";

interface SkillRadarChartProps {
  skills: Skill[];
}

export const SkillRadarChart = ({ skills }: SkillRadarChartProps) => {
  const topSkills = skills.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="premium-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-tag text-muted-foreground/60">
          Skill Radar
        </h3>
        <span className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-widest">{topSkills.length} SKILLS</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={topSkills}>
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "Outfit", fontWeight: 700, letterSpacing: "-0.01em" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, opacity: 0.6, fontFamily: "JetBrains Mono", fontWeight: 600 }}
          />
          <Radar
            name="Importance"
            dataKey="importance"
            stroke="var(--accent-blue)"
            fill="var(--accent-blue)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
