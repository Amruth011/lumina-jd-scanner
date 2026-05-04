import React from "react";
import { motion } from "framer-motion";
import { Search, BrainCircuit, Zap, FileText, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  icon: "decode" | "analysis" | "generator" | "history";
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  const getIcon = () => {
    switch (icon) {
      case "decode": return <BrainCircuit className="w-12 h-12 text-[#10B981]" />;
      case "analysis": return <Search className="w-12 h-12 text-[#10B981]" />;
      case "generator": return <Zap className="w-12 h-12 text-[#10B981]" />;
      case "history": return <FileText className="w-12 h-12 text-[#10B981]" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6 bg-white/30 backdrop-blur-sm rounded-[3rem] border border-[#1E2A3A]/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)]"
    >
      <div className="w-24 h-24 rounded-[2rem] bg-[#10B981]/10 flex items-center justify-center mb-2">
        {getIcon()}
      </div>
      
      <div className="space-y-2 max-w-sm">
        <h3 className="text-3xl font-serif font-bold text-[#1E2A3A]">{title}</h3>
        <p className="text-[#1E2A3A]/60 font-body leading-relaxed">{description}</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAction}
        className="px-8 py-3.5 bg-[#10B981] text-[#1E2A3A] font-bold rounded-full text-sm shadow-xl flex items-center gap-2"
      >
        {actionLabel} <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};
