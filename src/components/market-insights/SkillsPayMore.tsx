import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Zap, Target } from "lucide-react";

interface SkillImpact {
  skill: string;
  impact: number; // Percentage or dollar amount
  demand: "High" | "Medium" | "Low";
  trend: "Rising" | "Stable" | "Falling";
}

interface SkillsPayMoreProps {
  skills?: SkillImpact[];
}

export const SkillsPayMore = ({ skills = [] }: SkillsPayMoreProps) => {
  // Mock data if none provided
  const displaySkills = skills.length > 0 ? skills : [
    { skill: "System Design", impact: 15, demand: "High", trend: "Rising" },
    { skill: "AWS/Cloud", impact: 12, demand: "High", trend: "Stable" },
    { skill: "Kubernetes", impact: 10, demand: "Medium", trend: "Rising" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
            <Zap size={18} className="text-[#10B981]" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-[#10B981] leading-none">Skills that Pay More</h3>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#1E2A3A]/60 mt-1">High-Impact Competencies</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displaySkills.map((item, i) => (
          <motion.div
            key={item.skill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-[2.5rem] border-[#1E2A3A]/5 bg-white/40 hover:bg-white/60 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-black tracking-widest text-[#1E2A3A]/40">Skill Signature</span>
                <h4 className="text-xl font-display font-black text-[#1E2A3A] group-hover:text-[#10B981] transition-colors">{item.skill}</h4>
              </div>
              <div className="p-2 rounded-full bg-[#10B981]/10 text-[#10B981]">
                <DollarSign size={14} />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-2 bg-[#1E2A3A]/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.impact * 5}%` }}
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#10B981]/60"
                />
              </div>
              <span className="text-xs font-black text-[#10B981]">+{item.impact}% Premium</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1E2A3A]/5 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target size={10} className="text-[#1E2A3A]/40" />
                  <span className="text-[8px] uppercase font-black text-[#1E2A3A]/40">Demand</span>
                </div>
                <span className={`text-[10px] font-bold ${item.demand === 'High' ? 'text-orange-500' : 'text-[#1E2A3A]/60'}`}>
                  {item.demand} Intensity
                </span>
              </div>
              <div className="bg-[#1E2A3A]/5 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={10} className="text-[#1E2A3A]/40" />
                  <span className="text-[8px] uppercase font-black text-[#1E2A3A]/40">Trend</span>
                </div>
                <span className="text-[10px] font-bold text-[#10B981]">
                  {item.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
