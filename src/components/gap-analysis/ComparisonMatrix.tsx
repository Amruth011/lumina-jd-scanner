import React from "react";
import { motion } from "framer-motion";
import { Check, X, AlertTriangle, HelpCircle } from "lucide-react";

interface ComparisonItem {
  skill: string;
  required: boolean;
  present: boolean;
  evidence?: string;
}

interface ComparisonMatrixProps {
  items: ComparisonItem[];
}

export const ComparisonMatrix = ({ items }: ComparisonMatrixProps) => {
  return (
    <div className="bg-white rounded-[3rem] border border-[#1E2A3A]/5 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-[#1E2A3A]/5 bg-[#F4F5F7]/50">
        <h3 className="text-2xl font-serif font-bold text-[#1E2A3A]">Semantic Comparison Matrix</h3>
        <p className="text-sm text-[#1E2A3A]/40 font-body">Mapping job requirements to your resume evidence.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E2A3A]/5">
              <th className="p-6 text-[10px] font-display font-bold uppercase tracking-widest text-[#1E2A3A]/40">Competency</th>
              <th className="p-6 text-[10px] font-display font-bold uppercase tracking-widest text-[#1E2A3A]/40 text-center">Status</th>
              <th className="p-6 text-[10px] font-display font-bold uppercase tracking-widest text-[#1E2A3A]/40">Resume Evidence / Gap Note</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <motion.tr 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-[#1E2A3A]/5 last:border-0 hover:bg-[#10B981]/5 transition-colors group"
              >
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1E2A3A]">{item.skill}</span>
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#1E2A3A]/30">
                      {item.required ? "Essential" : "Preferred"}
                    </span>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="flex justify-center">
                    {item.present ? (
                      <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shadow-sm">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : item.required ? (
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shadow-sm">
                        <X className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-sm">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-6">
                  <p className={`text-sm font-body ${item.present ? "text-[#1E2A3A]/80" : "text-red-500/60 italic"}`}>
                    {item.present ? item.evidence : "No semantic match found in your resume."}
                  </p>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
