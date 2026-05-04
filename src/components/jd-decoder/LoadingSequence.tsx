import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Search, ShieldCheck, Database, Terminal, Sparkles, CheckCircle2 } from "lucide-react";

export const LoadingSequence = ({ onComplete }: { onComplete?: () => void }) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { icon: <Search className="w-5 h-5" />, text: "Scanning semantic structures...", duration: 800 },
    { icon: <BrainCircuit className="w-5 h-5" />, text: "Extracting high-priority ATS keywords...", duration: 1000 },
    { icon: <Database className="w-5 h-5" />, text: "Mapping role intelligence profile...", duration: 900 },
    { icon: <ShieldCheck className="w-5 h-5" />, text: "Verifying recruiter lens alignment...", duration: 800 },
    { icon: <Sparkles className="w-5 h-5" />, text: "Finalizing strategic insights...", duration: 700 },
  ];

  useEffect(() => {
    let currentStep = 0;
    const timeouts: NodeJS.Timeout[] = [];

    const runStep = () => {
      if (currentStep < steps.length) {
        const timeout = setTimeout(() => {
          currentStep++;
          setStep(currentStep);
          runStep();
        }, steps[currentStep].duration);
        timeouts.push(timeout);
      } else {
        if (onComplete) onComplete();
      }
    };

    runStep();
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 space-y-12">
      <div className="relative">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-32 h-32 rounded-[2.5rem] border-2 border-[#10B981]/20 border-t-[#10B981] flex items-center justify-center relative"
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-[#10B981]/5 blur-2xl animate-pulse" />
          <BrainCircuit className="w-12 h-12 text-[#10B981]" />
        </motion.div>
        
        {/* Orbiting particles */}
        {[0, 72, 144, 216, 288].map((degree, i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: [degree, degree + 360],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-md w-full bg-[#060D14] rounded-2xl border border-white/5 p-6 font-mono text-[13px] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
          <Terminal className="w-4 h-4 text-[#10B981]" />
          <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Lumina Intelligence Engine v2.0</span>
        </div>

        <div className="space-y-3 min-h-[160px]">
          <AnimatePresence mode="popLayout">
            {steps.slice(0, step + 1).map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <span className={i === step ? "text-[#10B981]" : "text-white/20"}>
                  {i === step ? <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>●</motion.div> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
                <span className={i === step ? "text-white" : "text-white/40"}>
                  {s.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: `${(step / steps.length) * 100}%` }}
            className="h-full bg-[#10B981]"
          />
        </div>
      </div>
    </div>
  );
};
