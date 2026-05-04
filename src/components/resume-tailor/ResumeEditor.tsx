import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Save, RotateCcw, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ResumeEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
}

export const ResumeEditor = ({ initialContent, onSave }: ResumeEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Edit3 className="w-6 h-6 text-[#10B981]" />
          <h3 className="text-2xl font-serif font-bold text-[#1E2A3A]">Final Polish</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setContent(initialContent)}
            className="p-3 rounded-xl bg-[#F4F5F7] text-[#1E2A3A]/40 hover:text-[#1E2A3A] transition-all"
            title="Reset to AI Original"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCopy}
            className="p-3 rounded-xl bg-[#F4F5F7] text-[#1E2A3A]/40 hover:text-[#10B981] transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-[#10B981]/5 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[500px] bg-white border border-[#1E2A3A]/5 rounded-[3rem] p-12 text-lg font-body text-[#1E2A3A]/80 leading-relaxed outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]/40 transition-all shadow-sm relative z-10"
        />
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => onSave(content)}
          className="group flex items-center gap-4 px-12 py-6 rounded-full bg-[#1E2A3A] text-white text-[13px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#1E2A3A]/20"
        >
          Lock In Changes <Save size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
