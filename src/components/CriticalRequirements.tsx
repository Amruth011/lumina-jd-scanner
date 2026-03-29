import { motion } from "framer-motion";
import { GraduationCap, Clock, Users, FileWarning } from "lucide-react";
import type { JdRequirements } from "@/types/jd";

interface CriticalRequirementsProps {
  requirements: JdRequirements;
}

const Badge = ({ label, variant = "default", index = 0 }: { label: string; variant?: "education" | "experience" | "soft" | "warning" | "default"; index?: number }) => {
  const styles = {
    education: "bg-[hsl(var(--badge-gold)/0.15)] text-[hsl(var(--badge-gold))] border-[hsl(var(--badge-gold)/0.35)]",
    experience: "bg-accent/15 text-accent border-accent/30",
    soft: "bg-secondary text-secondary-foreground border-border",
    warning: "bg-destructive/15 text-destructive border-destructive/30",
    default: "bg-muted text-muted-foreground border-border",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 * index, type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-default ${styles[variant]}`}
    >
      {variant === "education" && <GraduationCap className="w-3 h-3 mr-1.5" />}
      {label}
    </motion.span>
  );
};

export const CriticalRequirements = ({ requirements }: CriticalRequirementsProps) => {
  const sections = [
    { icon: GraduationCap, title: "Education", items: requirements.education, variant: "education" as const },
    { icon: Clock, title: "Experience", items: requirements.experience ? [requirements.experience] : [], variant: "experience" as const },
    { icon: Users, title: "Soft Skills", items: requirements.soft_skills, variant: "soft" as const },
    { icon: FileWarning, title: "Agreements & Conditions", items: requirements.agreements, variant: "warning" as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-strong rounded-2xl p-6 glow-border"
    >
      <h3 className="font-display font-semibold text-lg text-foreground mb-5">
        Critical Requirements
      </h3>
      <div className="space-y-5">
        {sections.map((section, sIndex) => (
          section.items.length > 0 && (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * sIndex, duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <section.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{section.title}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item, i) => (
                  <Badge key={item} label={item} variant={section.variant} index={i} />
                ))}
              </div>
            </motion.div>
          )
        ))}
      </div>
    </motion.div>
  );
};
