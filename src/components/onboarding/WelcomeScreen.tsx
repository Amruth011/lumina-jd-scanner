import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, ArrowRight, X, Sparkles } from "lucide-react";
import { useSession } from "@/context/SessionContext";

export const WelcomeScreen = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const { updateSession } = useSession();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("lumina_onboarding_complete");
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("lumina_onboarding_complete", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const steps = [
    {
      title: "Welcome to Lumina",
      description: "Let's get you ready to land your dream role. It takes less than 30 seconds to set up your first analysis.",
      icon: <Sparkles className="w-12 h-12 text-[#10B981]" />,
      button: "Let's Go"
    },
    {
      title: "Upload Your Resume",
      description: "Drop your current resume here. Our AI will extract your core skills and achievements.",
      icon: <Upload className="w-12 h-12 text-[#10B981]" />,
      button: "Upload & Continue"
    },
    {
      title: "Find Your Target JD",
      description: "Paste the job description you're targeting. We'll decode the hidden ATS requirements.",
      icon: <FileText className="w-12 h-12 text-[#10B981]" />,
      button: "Start Analyzing"
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#060D14]/90 backdrop-blur-xl">
      <motion.button 
        whileHover={{ rotate: 90 }}
        onClick={completeOnboarding}
        className="absolute top-8 right-8 text-white/40 hover:text-white"
      >
        <X className="w-8 h-8" />
      </motion.button>

      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="bg-white rounded-[2.5rem] p-12 text-center space-y-8 shadow-[0_50px_100px_-20px_rgba(16,185,129,0.3)]"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#10B981]/10 mb-4">
              {currentStep.icon}
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-serif font-bold text-[#1E2A3A]">
                {currentStep.title}
              </h2>
              <p className="text-lg text-[#1E2A3A]/60 font-body leading-relaxed px-8">
                {currentStep.description}
              </p>
            </div>

            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (step < steps.length) {
                    setStep(step + 1);
                  } else {
                    completeOnboarding();
                  }
                }}
                className="px-12 py-5 bg-[#10B981] text-[#1E2A3A] font-bold rounded-full text-lg shadow-xl flex items-center gap-3 mx-auto"
              >
                {currentStep.button} <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-3 pt-8">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i + 1 === step ? "w-12 bg-[#10B981]" : "w-3 bg-[#1E2A3A]/10"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
