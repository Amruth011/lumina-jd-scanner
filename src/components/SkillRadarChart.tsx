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
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Skill Radar
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground/50">{topSkills.length} skills</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={topSkills}>
          <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Inter" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
          />
          <Radar
            name="Importance"
            dataKey="importance"
            stroke="hsl(var(--foreground))"
            fill="hsl(var(--foreground))"
            fillOpacity={0.08}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
