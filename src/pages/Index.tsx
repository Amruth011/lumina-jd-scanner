import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Filter, LayoutDashboard, Search, LogOut, LogIn, Loader2, Moon, Sun, Save, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDecodeJD } from "@/hooks/useDecodeJD";
import { GlassTextArea } from "@/components/GlassTextArea";
import { DecodeButton } from "@/components/DecodeButton";
import { SkillRadarChart } from "@/components/SkillRadarChart";
import { SkillProgressBars } from "@/components/SkillProgressBars";
import { CriticalRequirements } from "@/components/CriticalRequirements";
import { WinningStrategy } from "@/components/WinningStrategy";
import { ResumeGapAnalyzer } from "@/components/ResumeGapAnalyzer";
import type { DecodeResult } from "@/types/jd";
import { ThemeToggle } from "@/components/ThemeToggle";

const ApplicationTracker = lazy(() => import("@/components/ApplicationTracker").then(module => ({ default: module.ApplicationTracker })));

type Tab = "decode" | "applications";


const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { isScanning, results, decodeJD } = useDecodeJD();
  const [activeTab, setActiveTab] = useState<Tab>("decode");
  const [jdText, setJdText] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(false);
  const [savingJd, setSavingJd] = useState(false);
  const [savedJdId, setSavedJdId] = useState<string | null>(null);

  // Reset saved state when new decode happens
  useEffect(() => {
    setSavedJdId(null);
  }, [results]);

  const handleSaveJd = async () => {
    if (!user) {
      toast.info("Sign in to save your decoded JDs.");
      navigate("/auth");
      return;
    }
    if (!results) return;
    setSavingJd(true);
    try {
      const { data, error } = await supabase.from("jd_vault").insert({
        user_id: user.id,
        title: results.title,
        raw_text: jdText,
        skills_json: results.skills as any,
      }).select("id").single();
      if (error) throw error;
      setSavedJdId(data.id);
      toast.success("JD saved to your history!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save JD.");
    } finally {
      setSavingJd(false);
    }
  };

  const handleTabSwitch = (tab: Tab) => {
    if (tab === "applications" && !user) {
      toast.info("Sign in to access your application tracker.");
      navigate("/auth");
      return;
    }
    setActiveTab(tab);
  };

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
    await decodeJD(jdText);
  };

  const tabClass = (tab: Tab) =>
    `relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
      activeTab === tab
        ? "text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  const displayName = user?.email || user?.phone || "User";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 border-b border-border backdrop-blur-sm bg-background/80">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
          <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">
            Lumina <span className="text-gradient-primary drop-shadow-sm">JD</span>
          </h1>
        </motion.div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-muted/50 rounded-full p-1 backdrop-blur-sm">
          {[
            { key: "decode" as Tab, icon: Search, label: "Decoder" },
            { key: "applications" as Tab, icon: LayoutDashboard, label: "Applications" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => handleTabSwitch(tab.key)} className={tabClass(tab.key)}>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full shadow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* User info + actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-[120px]">
                {displayName}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/auth")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in
            </motion.button>
          )}
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-12 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === "decode" ? (
            <motion.div
              key="decode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-center mb-10 mt-8"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4 tracking-tight glow-text">
                    Decode Any Job Description
                  </h2>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-base max-w-lg mx-auto"
                >
                  Paste a JD below and let AI extract, categorize, and score every skill requirement.
                </motion.p>
              </motion.div>

              <GlassTextArea value={jdText} onChange={setJdText} isScanning={isScanning} />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
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
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mt-12 max-w-6xl mx-auto"
                  >
                    {/* Title with alignment note styling */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="text-center mb-6"
                    >
                      <h3 className="font-display font-bold text-3xl md:text-4xl text-foreground text-gradient-primary mb-1">
                        {results.title}
                      </h3>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "120px" }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-3"
                      />
                      {/* Save JD Button */}
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveJd}
                        disabled={savingJd || !!savedJdId}
                        className={`mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                          savedJdId
                            ? "bg-[hsl(var(--skill-core))]/15 text-[hsl(var(--skill-core))] border border-[hsl(var(--skill-core))]/30"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        } disabled:opacity-60`}
                      >
                        {savingJd ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : savedJdId ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {savedJdId ? "Saved to History" : "Save This Analysis"}
                      </motion.button>
                    </motion.div>

                    {/* Priority Filter Toggle */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex justify-center mb-6"
                    >
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPriorityFilter(!priorityFilter)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 glass ${
                          priorityFilter
                            ? "bg-primary/20 text-primary border-primary/40 shadow-md"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                        Priority Filter
                        <span
                          className={`inline-flex items-center w-11 h-6 rounded-full relative transition-colors duration-300 ${
                            priorityFilter ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <motion.span
                            animate={{ x: priorityFilter ? 22 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`w-4 h-4 rounded-full bg-background shadow-sm`}
                          />
                        </span>
                      </motion.button>
                    </motion.div>

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
                      className="mt-6 glass-strong rounded-2xl p-5 glow-border max-w-3xl mx-auto relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <div className="flex items-start gap-3 relative z-10">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="p-2 rounded-lg bg-primary/10"
                        >
                          <Brain className="w-5 h-5 text-primary" />
                        </motion.div>
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
                      <ResumeGapAnalyzer skills={results.skills} jobTitle={results.title} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="applications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-8"
            >
              <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                <ApplicationTracker />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
