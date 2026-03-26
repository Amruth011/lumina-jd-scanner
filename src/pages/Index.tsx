import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Filter } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlassTextArea } from "@/components/GlassTextArea";
import { DecodeButton } from "@/components/DecodeButton";
import { SkillRadarChart } from "@/components/SkillRadarChart";
import { SkillProgressBars } from "@/components/SkillProgressBars";
import { CriticalRequirements } from "@/components/CriticalRequirements";
import { WinningStrategy } from "@/components/WinningStrategy";
import { ResumeGapAnalyzer } from "@/components/ResumeGapAnalyzer";
import { ApplicationTracker } from "@/components/ApplicationTracker";
import type { DecodeResult } from "@/types/jd";

const Index = () => {
  const [jdText, setJdText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<DecodeResult | null>(null);
  const [priorityFilter, setPriorityFilter] = useState(false);

  const filteredSkills = results
    ? priorityFilter
      ? results.skills.filter((s) => s.importance > 80)
      : results.skills
    : [];

  const getAiInsight = (skills: DecodeResult["skills"]) => {
    const critical = skills
      .filter((s) => s.importance > 80)
      .slice(0, 3)
      .map((s) => s.skill);
    if (critical.length === 0) return "All skills have moderate importance — a well-rounded generalist role.";
    return `Focus on ${critical.join(", ")} for this role; the rest are secondary infrastructure skills.`;
  };

  const handleDecode = async () => {
    if (jdText.trim().length < 20) {
      toast.error("Please paste a job description (min 20 characters).");
      return;
    }

    setIsScanning(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("decode-jd", {
        body: { jdText },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResults({
        title: data.title,
        skills: data.skills,
        requirements: data.requirements || { education: [], experience: "", soft_skills: [], agreements: [] },
        winning_strategy: data.winning_strategy || [],
      });
      toast.success(`Decoded: ${data.title}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to decode JD. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-xl text-foreground">
            Lumina <span className="text-primary">JD</span>
          </h1>
        </motion.div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-12 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10 mt-8"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3 glow-text">
            Decode Any Job Description
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Paste a JD below and let AI extract, categorize, and score every skill requirement.
          </p>
        </motion.div>

        <GlassTextArea value={jdText} onChange={setJdText} isScanning={isScanning} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-8"
        >
          <DecodeButton
            onClick={handleDecode}
            isLoading={isScanning}
            disabled={jdText.trim().length < 20}
          />
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="mt-12 max-w-6xl mx-auto"
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display font-semibold text-2xl text-foreground text-center mb-4"
              >
                {results.title}
              </motion.h3>

              {/* Priority Filter Toggle */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setPriorityFilter(!priorityFilter)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 glass glow-border ${
                    priorityFilter
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Priority Filter
                  <span
                    className={`inline-block w-8 h-4 rounded-full relative transition-colors duration-300 ${
                      priorityFilter ? "bg-primary/50" : "bg-muted/50"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${
                        priorityFilter ? "left-4 bg-primary" : "left-0.5 bg-muted-foreground"
                      }`}
                    />
                  </span>
                </button>
              </div>

              {/* Skills row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkillRadarChart skills={filteredSkills} />
                <SkillProgressBars skills={filteredSkills} priorityMode={priorityFilter} />
              </div>

              {/* AI Insight Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 glass-strong rounded-2xl p-5 glow-border max-w-3xl mx-auto"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm text-foreground mb-1">
                      AI Insight
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {getAiInsight(results.skills)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Consultant Mode Section */}
              <div className="mt-8 space-y-6">
                <CriticalRequirements requirements={results.requirements} />
                <WinningStrategy steps={results.winning_strategy} />
              </div>

              {/* Resume Gap Analyzer */}
              <div className="mt-6">
                <ResumeGapAnalyzer skills={results.skills} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
