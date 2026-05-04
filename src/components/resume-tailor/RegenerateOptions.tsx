import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Target, Zap, Shield, Sparkles } from "lucide-react";

interface RegenerateOptionsProps {
  onRegenerate: (strategy: string) => void;
  isRegenerating: boolean;
}

export const RegenerateOptions = ({ onRegenerate, isRegenerating }: RegenerateOptionsProps) => {
  const strategies = [
    { id: "metrics", label: "Aggressive Metrics", desc: "Focuses on quantifying every bullet point.", icon: <Zap className="w-4 h-4" /> },
    { id: "balanced", label: "Balanced Professional", desc: "A clean mix of hard and soft skills.", icon: <Shield className="w-4 h-4" /> },
    { id: "keywords", label: "Keyword Extraction", desc: "Maximized for ATS keyword parsing.", icon: <Target className="w-4 h-4" /> },
    { id: "creative", label: "Creative Narrative", desc: "Focuses on storytelling and impact.", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <RefreshCw className={`w-6 h-6 text-[#10B981] ${isRegenerating ? "animate-spin" : ""}`} />
        <h3 className="text-2xl font-serif font-bold text-[#1E2A3A]">Refine Strategy</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {strategies.map((strat) => (
          <button
            key={strat.id}
            disabled={isRegenerating}
            onClick={() => onRegenerate(strat.id)}
            className="flex items-start gap-4 p-6 bg-white border border-[#1E2A3A]/5 rounded-[2rem] text-left hover:bg-[#10B981]/5 hover:border-[#10B981]/20 transition-all group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4F5F7] flex items-center justify-center text-[#1E2A3A]/40 group-hover:bg-[#10B981]/10 group-hover:text-[#10B981] transition-colors">
              {strat.icon}
            </div>
            <div>
              <span className="block text-sm font-bold text-[#1E2A3A]">{strat.label}</span>
              <span className="block text-xs text-[#1E2A3A]/40 font-body mt-1">{strat.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
