import React from "react";
import { motion } from "framer-motion";
import { Download, FileText, FileCode, Type, ArrowRight } from "lucide-react";

interface DownloadPanelProps {
  onDownload: (format: "pdf" | "docx" | "txt") => void;
}

export const DownloadPanel = ({ onDownload }: DownloadPanelProps) => {
  const formats = [
    { id: "pdf", label: "PDF Document", sub: "ATS Optimized", icon: <FileText className="w-6 h-6" />, color: "text-red-500", bg: "bg-red-500/10" },
    { id: "docx", label: "Word Doc", sub: "Fully Editable", icon: <FileCode className="w-6 h-6" />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "txt", label: "Plain Text", sub: "Cleanest Signature", icon: <Type className="w-6 h-6" />, color: "text-[#1E2A3A]", bg: "bg-[#F4F5F7]" },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Download className="w-6 h-6 text-[#10B981]" />
        <h3 className="text-2xl font-serif font-bold text-[#1E2A3A]">Export Intelligence</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formats.map((format) => (
          <motion.button
            key={format.id}
            whileHover={{ y: -5 }}
            onClick={() => onDownload(format.id)}
            className="flex flex-col items-center gap-4 p-8 bg-white rounded-[2.5rem] border border-[#1E2A3A]/5 shadow-sm group transition-all hover:shadow-xl hover:shadow-[#1E2A3A]/5"
          >
            <div className={`w-16 h-16 rounded-[1.5rem] ${format.bg} ${format.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {format.icon}
            </div>
            <div className="text-center">
              <span className="block text-lg font-serif font-bold text-[#1E2A3A]">{format.label}</span>
              <span className="block text-[10px] font-display font-bold uppercase tracking-widest text-[#1E2A3A]/40 mt-1">{format.sub}</span>
            </div>
            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 text-[#10B981]" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
