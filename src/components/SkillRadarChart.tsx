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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-strong rounded-2xl p-6 premium-card"
    >
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">
        Skill Radar
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={topSkills}>
          <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <Radar
            name="Importance"
            dataKey="importance"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
