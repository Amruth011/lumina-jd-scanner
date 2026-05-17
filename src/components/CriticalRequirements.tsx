import { motion } from "framer-motion";
import { GraduationCap, Clock, Users, AlertTriangle, Zap } from "lucide-react";
import type { JdRequirements } from "@/types/jd";

interface CriticalRequirementsProps {
  requirements: JdRequirements;
}

/**
 * CriticalRequirements displays qualification credentials including education,
 * years of experience, soft skills, and visa agreements dynamically as chips.
 */
const sectionConfig = {
  education: {
    icon: GraduationCap,
    title: "Education",
    chipStyle: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
    iconColor: "text-accent-amber",
    bgColor: "bg-accent-amber",
  },
  experience: {
    icon: Clock,
    title: "Experience",
    chipStyle: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
    iconColor: "text-accent-blue",
    bgColor: "bg-accent-blue",
  },
  soft_skills: {
    icon: Users,
    title: "Soft Skills",
    chipStyle: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20",
    iconColor: "text-accent-emerald",
    bgColor: "bg-accent-emerald",
  },
  agreements: {
    icon: AlertTriangle,
    title: "Agreements & Conditions",
    chipStyle: "bg-accent-red/10 text-accent-red border-accent-red/20",
    iconColor: "text-accent-red",
    bgColor: "bg-accent-red",
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="premium-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-11 h-11 rounded-xl bg-accent-amber/10 flex items-center justify-center border border-accent-amber/10 shadow-sm shadow-accent-amber/5">
          <Zap className="w-5 h-5 text-accent-amber" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg md:text-xl text-foreground tracking-tight">
            Critical Requirements
          </h3>
          <p className="text-tag text-muted-foreground/60">Must-have qualifications from the JD</p>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((section, sIndex) => {
          const config = sectionConfig[section.key];
          if (section.items.length === 0) return null;

          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * sIndex, duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${config.bgColor} opacity-50`} />
                <span className="text-tag text-muted-foreground/40">{config.title}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {section.items.map((item, i) => {
                  const displayValue = typeof item === 'object' && item !== null
                    ? Object.values(item).filter(v => typeof v !== 'object').join(' ')
                    : String(item || "");
                  
                  return (
                    <motion.span
                      key={`${section.key}-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.03 * i, type: "spring", stiffness: 300 }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-display font-bold border transition-all cursor-default shadow-sm ${config.chipStyle}`}
                    >
                      {displayValue}
                    </motion.span>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
