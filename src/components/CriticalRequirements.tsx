import { motion } from "framer-motion";
import { GraduationCap, Clock, Users, FileWarning } from "lucide-react";
import type { JdRequirements } from "@/types/jd";

interface CriticalRequirementsProps {
  requirements: JdRequirements;
}

const Badge = ({ label, variant = "default" }: { label: string; variant?: "education" | "experience" | "soft" | "warning" | "default" }) => {
  const styles = {
    education: "bg-[hsl(var(--badge-gold)/0.15)] text-[hsl(var(--badge-gold))] border-[hsl(var(--badge-gold)/0.35)] dark:shadow-[0_0_14px_hsl(var(--badge-gold)/0.25)]",
    experience: "bg-accent/15 text-accent border-accent/30",
    soft: "bg-secondary text-secondary-foreground border-border",
    warning: "bg-destructive/15 text-destructive border-destructive/30",
    default: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${styles[variant]}`}>
      {variant === "education" && <GraduationCap className="w-3 h-3 mr-1.5" />}
      {label}
    </span>
  );
};

export const CriticalRequirements = ({ requirements }: CriticalRequirementsProps) => {
  const sections = [
    {
      icon: GraduationCap,
      title: "Education",
      items: requirements.education,
      variant: "education" as const,
    },
    {
      icon: Clock,
      title: "Experience",
      items: requirements.experience ? [requirements.experience] : [],
      variant: "experience" as const,
    },
    {
      icon: Users,
      title: "Soft Skills",
      items: requirements.soft_skills,
      variant: "soft" as const,
    },
    {
      icon: FileWarning,
      title: "Agreements & Conditions",
      items: requirements.agreements,
      variant: "warning" as const,
    },
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
        {sections.map((section) => (
          section.items.length > 0 && (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-2.5">
                <section.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{section.title}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <Badge key={item} label={item} variant={section.variant} />
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </motion.div>
  );
};
