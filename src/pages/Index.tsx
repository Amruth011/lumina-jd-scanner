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
import type { Skill } from "@/types/jd";

const Index = () => {
  const [jdText, setJdText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<{ title: string; skills: Skill[] } | null>(null);

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

      setResults({ title: data.title, skills: data.skills });
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
              className="mt-12 max-w-5xl mx-auto"
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display font-semibold text-2xl text-foreground text-center mb-8"
              >
                {results.title}
              </motion.h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkillRadarChart skills={results.skills} />
                <SkillProgressBars skills={results.skills} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
