import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, ChevronRight } from "lucide-react";

export const TooltipTour = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("lumina_dashboard_tour_complete");
    const hasFinishedWelcome = localStorage.getItem("lumina_onboarding_complete");
    
    if (hasFinishedWelcome && !hasSeenTour) {
      setTimeout(() => setIsVisible(true), 1500); // Wait for dashboard to load
    }
  }, []);

  const finishTour = () => {
    localStorage.setItem("lumina_dashboard_tour_complete", "true");
    setIsVisible(false);
  };

  const tips = [
    {
      title: "JD Decoder",
      text: "Paste any job description here to extract high-priority keywords and hidden requirements.",
      target: "decode-tab"
    },
    {
      title: "Gap Analysis",
      text: "See exactly how your resume stacks up against the JD and what's missing.",
      target: "analysis-tab"
    },
    {
      title: "Resume Tailor",
      text: "Use our AI engine to rewrite your resume bullets for a 90%+ match score.",
      target: "generator-tab"
    },
    {
      title: "Market Insights",
      text: "Get real-time data on salary ranges and interview difficulty for this specific role.",
      target: "guide-tab"
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className="bg-[#1E2A3A] text-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[#10B981]/20 w-[320px] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#10B981]" />
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#10B981]">
                  Feature Tour ({currentTip + 1}/{tips.length})
                </span>
              </div>
              <button onClick={finishTour} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-xl font-bold">{tips[currentTip].title}</h4>
              <p className="text-sm text-white/60 font-body leading-relaxed">
                {tips[currentTip].text}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-1.5">
                {tips.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentTip ? "w-4 bg-[#10B981]" : "w-1.5 bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <button 
                onClick={() => {
                  if (currentTip < tips.length - 1) {
                    setCurrentTip(currentTip + 1);
                  } else {
                    finishTour();
                  }
                }}
                className="flex items-center gap-1 text-xs font-display font-bold text-[#10B981] hover:translate-x-1 transition-transform"
              >
                {currentTip === tips.length - 1 ? "Finish" : "Next"} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
