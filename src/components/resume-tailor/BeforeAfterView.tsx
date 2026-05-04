import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, History, Zap } from "lucide-react";

interface ComparisonPair {
  label: string;
  before: string;
  after: string;
}

interface BeforeAfterViewProps {
  pairs: ComparisonPair[];
}

export const BeforeAfterView = ({ pairs }: BeforeAfterViewProps) => {
  return (
    <div className="space-y-12">
      <div className="flex items-center gap-3">
        <Zap className="w-6 h-6 text-[#10B981]" />
        <h3 className="text-2xl font-serif font-bold text-[#1E2A3A]">Intelligence Audit</h3>
      </div>

      <div className="space-y-8">
        {pairs.map((pair, i) => (
          <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#1E2A3A]/5 rounded-[3rem] border border-[#1E2A3A]/5 overflow-hidden shadow-sm">
            <div className="bg-white p-10 space-y-4">
              <div className="flex items-center gap-2 text-[#1E2A3A]/40">
                <History className="w-4 h-4" />
                <span className="text-[10px] font-display font-bold uppercase tracking-widest">Original {pair.label}</span>
              </div>
              <p className="text-sm text-[#1E2A3A]/60 font-body leading-relaxed">
                {pair.before}
              </p>
            </div>

            <div className="bg-[#10B981]/5 p-10 space-y-4 relative">
              <div className="flex items-center gap-2 text-[#10B981]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-display font-bold uppercase tracking-widest">Optimized {pair.label}</span>
              </div>
              <p className="text-sm text-[#1E2A3A] font-body font-medium leading-relaxed">
                {pair.after}
              </p>
              
              <div className="absolute top-10 right-10">
                <div className="px-2 py-1 rounded-md bg-[#10B981] text-white text-[8px] font-black uppercase tracking-widest">
                  ATS Verified
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
