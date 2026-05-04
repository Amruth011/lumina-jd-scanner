import React from "react";
import { motion } from "framer-motion";
import { Copy, Check, Star, Shield, Zap, Briefcase, Info, ListChecks, Target, Share2 } from "lucide-react";
import { DecodeResult, Skill } from "@/types/jd";
import { useLuminaToast } from "@/context/ToastContext";
import { generateShareUrl, copyToClipboard } from "@/lib/shareUtils";

interface StructuredOutputProps {
  results: DecodeResult;
}

export const StructuredOutput = ({ results }: StructuredOutputProps) => {
  const { toast } = useLuminaToast();
  const [copied, setCopied] = React.useState(false);

  const copyKeywords = () => {
    const keywords = results.skills.map(s => s.skill).join(", ");
    navigator.clipboard.writeText(keywords);
    setCopied(true);
    toast("Keywords copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const getImportanceColor = (score: number) => {
    if (score > 85) return "text-red-500 bg-red-500/5 border-red-500/10";
    if (score > 60) return "text-amber-500 bg-amber-500/5 border-amber-500/10";
    return "text-[#10B981] bg-[#10B981]/5 border-[#10B981]/10";
  };

  return (
    <div className="space-y-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-display font-bold uppercase tracking-widest border border-[#10B981]/20">
              Analysis Complete
            </span>
            <button 
              onClick={() => {
                const url = generateShareUrl({ title: results.title, score: results.grade.score });
                copyToClipboard(url);
              }}
              className="px-3 py-1 rounded-full bg-[#1E2A3A]/5 text-[#1E2A3A]/60 text-[10px] font-display font-bold uppercase tracking-widest border border-[#1E2A3A]/10 hover:bg-[#1E2A3A] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Share2 size={10} /> Share Result
            </button>
            <span className="text-[#1E2A3A]/40 font-mono text-[10px] uppercase">
              Model: Llama-3.3-Strategic
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#1E2A3A]">
            {results.title}
          </h2>
          <p className="text-xl text-[#1E2A3A]/60 font-body leading-relaxed italic">
            "{results.grade.summary}"
          </p>
        </div>

        <div className="bg-[#1E2A3A] text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-2 min-w-[180px]">
          <span className="text-6xl font-serif font-bold text-[#10B981]">{results.grade.score}</span>
          <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/40">JD Grade: {results.grade.letter}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Keywords Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#1E2A3A]/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-xl font-serif font-bold text-[#1E2A3A]">Strategic ATS Keywords</h3>
              </div>
              <button 
                onClick={copyKeywords}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1E2A3A]/5 hover:bg-[#10B981]/10 hover:text-[#10B981] transition-all text-xs font-display font-bold uppercase tracking-widest text-[#1E2A3A]/40"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy All"}
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {results.skills.map((skill, i) => (
                <motion.div
                  key={skill.skill}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 transition-all hover:scale-105 ${getImportanceColor(skill.importance)}`}
                >
                  <span className="text-xs font-display font-bold">{skill.skill}</span>
                  {skill.importance > 85 && <Star className="w-3 h-3 fill-current" />}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Requirements Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#1E2A3A]/5 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <ListChecks className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-xl font-serif font-bold text-[#1E2A3A]">Hard Requirements</h3>
              </div>
              <div className="space-y-3">
                {results.requirements.education.map((edu, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F4F5F7]">
                    <Shield className="w-4 h-4 text-[#10B981] mt-0.5" />
                    <span className="text-sm font-body text-[#1E2A3A]/80">{edu}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F4F5F7]">
                  <Briefcase className="w-4 h-4 text-[#10B981] mt-0.5" />
                  <span className="text-sm font-body text-[#1E2A3A]/80">{results.requirements.experience} experience</span>
                </div>
              </div>
            </div>

            {/* Red Flags Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#1E2A3A]/5 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-500" />
                <h3 className="text-xl font-serif font-bold text-[#1E2A3A]">Recruiter Signals</h3>
              </div>
              <div className="space-y-4">
                {results.red_flags.map((flag, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-display font-bold text-[#1E2A3A]">{flag.phrase}</span>
                      <span className="text-[10px] font-mono text-red-500">{flag.intensity}% Risk</span>
                    </div>
                    <div className="h-1.5 w-full bg-red-500/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${flag.intensity}%` }}
                        className="h-full bg-red-500/40"
                      />
                    </div>
                    {flag.note && <p className="text-[11px] text-[#1E2A3A]/40 font-body">{flag.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
          {/* Work Logistics */}
          <div className="bg-[#1E2A3A] p-8 rounded-[2.5rem] text-white space-y-6">
            <h3 className="text-xl font-serif font-bold text-[#10B981]">Work Dynamics</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/40">Arrangement</span>
                <p className="text-lg font-serif font-bold capitalize">
                  {results.logistics.work_arrangement.remote_friendly} Remote · {results.logistics.work_arrangement.office_presence} Presence
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/40">Estimated Salary</span>
                <p className="text-2xl font-serif font-bold text-[#10B981]">
                  {results.logistics.salary_range ? `${results.logistics.salary_range.currency}${results.logistics.salary_range.min.toLocaleString()} - ${results.logistics.salary_range.max.toLocaleString()}` : "Not Disclosed"}
                </p>
              </div>
            </div>
          </div>

          {/* Archetype */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#1E2A3A]/5 shadow-sm space-y-4">
             <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-xl font-serif font-bold text-[#1E2A3A]">Role Archetype</h3>
              </div>
              <div className="p-4 rounded-2xl bg-[#10B981]/5 border border-[#10B981]/10 space-y-2">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#10B981]">{results.logistics.archetype.label}</span>
                <p className="text-sm font-body text-[#1E2A3A]/70 leading-relaxed">
                  {results.logistics.archetype.description}
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
