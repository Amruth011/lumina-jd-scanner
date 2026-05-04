import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface UsageMeterProps {
  label: string;
  used: number;
  total: number;
  color?: string;
}

export const UsageMeter = ({ label, used, total, color = "#10B981" }: UsageMeterProps) => {
  const percentage = Math.min((used / total) * 100, 100);
  const isCritical = percentage > 85;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <Zap size={10} className={isCritical ? "text-orange-500" : `text-[${color}]`} />
          <span className="text-[9px] font-display font-bold uppercase tracking-widest text-[#1E2A3A]/40">{label}</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#1E2A3A]">
          {used}<span className="text-[#1E2A3A]/20">/{total}</span>
        </span>
      </div>
      <div className="h-1 w-full bg-[#1E2A3A]/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full rounded-full transition-colors ${isCritical ? 'bg-orange-500' : ''}`}
          style={{ backgroundColor: !isCritical ? color : undefined }}
        />
      </div>
    </div>
  );
};
