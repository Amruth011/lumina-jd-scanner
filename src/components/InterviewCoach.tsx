import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ExternalLink, HelpCircle, MessageCircle, Sparkles, UserCheck, Copy, Check } from "lucide-react";
import type { InterviewQuestion } from "@/types/jd";
import { toast } from "sonner";

interface InterviewCoachProps {
  questions?: InterviewQuestion[];
  interviewerQuestions?: string[];
}

export const InterviewCoach = ({ questions, interviewerQuestions }: InterviewCoachProps) => {
  const [activeTab, setActiveTab] = useState<"prep" | "ask">("prep");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!questions && !interviewerQuestions) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("Question copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <BrainCircuit size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-foreground leading-none">Interview Simulation</h3>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-1 opacity-50">Prep Kit & Strategic Questions</p>
          </div>
        </div>

        <div className="flex bg-muted/40 p-1 rounded-xl border border-white/5">
            {[
                { id: "prep", icon: HelpCircle, label: "Your Prep" },
                { id: "ask", icon: MessageCircle, label: "Ask Them" }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "prep" | "ask")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all ${
                        activeTab === tab.id ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <tab.icon size={10} />
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "prep" ? (
          <motion.div
            key="prep"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {questions?.map((q, idx) => (
              <div 
                key={idx} 
                className="glass-panel p-6 rounded-3xl border-white/5 space-y-3 group hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => handleCopy(q.question, `prep-${idx}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    q.type === 'technical' ? 'bg-accent-blue/10 text-accent-blue' : 
                    q.type === 'behavioral' ? 'bg-accent-emerald/10 text-accent-emerald' : 
                    'bg-accent-gold/10 text-accent-gold'
                  }`}>
                    {q.type}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIndex === `prep-${idx}` ? <Check size={12} className="text-accent-emerald" /> : <Copy size={12} className="text-primary/40" />}
                  </div>
                </div>
                <p className="font-display font-bold text-sm text-foreground leading-relaxed transition-transform">
                  {q.question}
                </p>
                {q.target_answer && (
                   <div className="pt-2">
                     <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-serif italic text-muted-foreground leading-relaxed">
                        <span className="text-primary/60 not-italic font-display font-black uppercase text-[8px] tracking-widest mr-2">Strategy:</span>
                        {q.target_answer}
                     </div>
                   </div>
                )}
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
                <UserCheck size={16} className="text-accent-emerald" />
                <span className="text-xs font-display font-bold text-foreground">Reverse Interview Questions</span>
            </div>
            {interviewerQuestions?.map((q, idx) => (
              <div 
                key={idx} 
                className="flex gap-4 p-4 rounded-2xl bg-white/30 border border-white/5 group hover:bg-white/50 transition-all cursor-pointer"
                onClick={() => handleCopy(q, `ask-${idx}`)}
              >
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-primary/40 leading-none">{idx + 1}</span>
                    <div className="w-[1px] h-full bg-primary/10 mt-2" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-display font-medium text-foreground leading-snug">
                        {q}
                    </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIndex === `ask-${idx}` ? <Check size={14} className="text-accent-emerald" /> : <Copy size={14} className="text-primary/40" />}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
