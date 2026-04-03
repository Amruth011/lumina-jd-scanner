import { motion } from "framer-motion";
import { GraduationCap, Clock, Users, FileWarning, AlertTriangle, Zap } from "lucide-react";
import type { JdRequirements } from "@/types/jd";

interface CriticalRequirementsProps {
  requirements: JdRequirements;
}

const sectionConfig = {
  education: {
    icon: GraduationCap,
    title: "Education",
    chipStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    iconColor: "text-amber-500",
  },
  experience: {
    icon: Clock,
    title: "Experience",
    chipStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    iconColor: "text-blue-500",
  },
  soft_skills: {
    icon: Users,
    title: "Soft Skills",
    chipStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    iconColor: "text-emerald-500",
  },
  agreements: {
    icon: AlertTriangle,
    title: "Agreements & Conditions",
    chipStyle: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    iconColor: "text-red-500",
  },
};

export const CriticalRequirements = ({ requirements }: CriticalRequirementsProps) => {
  const sections = [
    { key: "education" as const, items: requirements.education },
    { key: "experience" as const, items: requirements.experience ? [requirements.experience] : [] },
    { key: "soft_skills" as const, items: requirements.soft_skills },
    { key: "agreements" as const, items: requirements.agreements },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-strong rounded-2xl p-6 glow-border"
    >
      <div className="flex items-center gap-2 mb-5">
        <motion.div
          whileHover={{ rotate: 15 }}
          className="p-2 rounded-lg bg-amber-500/10"
        >
          <Zap className="w-5 h-5 text-amber-500" />
        </motion.div>
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            Critical Requirements
          </h3>
          <p className="text-xs text-muted-foreground">Must-have qualifications extracted from the JD</p>
        </div>
      </div>

      <div className="space-y-5">
        {sections.map((section, sIndex) => {
          const config = sectionConfig[section.key];
          if (section.items.length === 0) return null;

          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * sIndex, duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <config.icon className={`w-4 h-4 ${config.iconColor}`} />
                <span className="text-sm font-semibold text-foreground">{config.title}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.03 * i, type: "spring", stiffness: 300 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-default ${config.chipStyle}`}
                  >
                    <config.icon className="w-3 h-3" />
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
