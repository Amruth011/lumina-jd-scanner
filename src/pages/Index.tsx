import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Filter, LayoutDashboard, Search, LogOut, LogIn, Loader2, Save, BookmarkCheck, CheckCircle2, RefreshCw, Lock, ArrowRight, Zap } from "lucide-react";
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
import { ATSKeywordScanner } from "@/components/ATSKeywordScanner";
import { ATSScoreSimulator } from "@/components/ATSScoreSimulator";
import { ResumeBuilder } from "@/components/ResumeBuilder";
import type { DecodeResult, ResumeGapResult } from "@/types/jd";
import { ThemeToggle } from "@/components/ThemeToggle";


const ApplicationTracker = lazy(() => import("@/components/ApplicationTracker").then(module => ({ default: module.ApplicationTracker })));

type Tab = "decode" | "applications";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { isScanning, results, decodeJD, wasCached } = useDecodeJD();
  const [activeTab, setActiveTab] = useState<Tab>("decode");
  const [jdText, setJdText] = useState("");
  const [priorityFilter, setPriorityFilter] = useState(false);
  const [savingJd, setSavingJd] = useState(false);
  const [savedJdId, setSavedJdId] = useState<string | null>(null);
  const [userResumeText, setUserResumeText] = useState("");
  const [gapResult, setGapResult] = useState<ResumeGapResult | null>(null);

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

  const handleForceRedecode = async () => {
    await decodeJD(jdText, true);
  };

  const tabClass = (tab: Tab) =>
    `relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
      activeTab === tab
        ? "text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  const displayName = user?.email || user?.phone || "User";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-3.5 md:px-12 border-b border-border/60 backdrop-blur-xl bg-background/70">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
          <h1 className="font-display font-bold text-xl text-foreground tracking-tight">
            Lumina<span className="text-gradient-primary ml-0.5">JD</span>
          </h1>
        </motion.div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-muted/40 rounded-full p-1 backdrop-blur-sm border border-border/40">
          {[
            { key: "decode" as Tab, icon: Search, label: "Decoder" },
            { key: "applications" as Tab, icon: LayoutDashboard, label: "Applications" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => handleTabSwitch(tab.key)} className={tabClass(tab.key)}>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-primary rounded-full shadow-lg"
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in
            </motion.button>
          )}
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-12 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "decode" ? (
            <motion.div
              key="decode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-center mb-10 mt-16 md:mt-28 max-w-4xl mx-auto"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-8 tracking-wider uppercase shine-effect"
                >
                  <Zap className="w-3.5 h-3.5" /> 
                  AI-Powered ATS Optimization Engine
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <h2 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 tracking-tight leading-[0.95]">
                    Beat the ATS.
                    <br />
                    <span className="text-gradient-primary">Land the Interview.</span>
                  </h2>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-lg md:text-xl font-normal max-w-2xl mx-auto leading-relaxed mb-8"
                >
                  95% of Fortune 500 companies use ATS filters. Paste any job description and let AI instantly extract the exact keywords, skills, and metrics you need to rank #1.
                </motion.p>

                <SoundWave />
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center items-center gap-8 text-sm font-medium text-muted-foreground mb-14"
                >
                  {["100% Free & Private", "Instant Gap Analysis", "AI Resume Snippets"].map((text, i) => (
                    <span key={text} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {text}
                    </span>
                  ))}
                </motion.div>
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
                  isDecoded={!!results}
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
                    className="mt-16 max-w-6xl mx-auto"
                  >
                    {/* Results header */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="text-center mb-8"
                    >
                      <h3 className="font-display font-bold text-3xl md:text-5xl text-gradient-primary mb-2">
                        {results.title}
                      </h3>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "80px" }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-4"
                      />
                      {/* Cache indicator + Re-decode */}
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                          <Lock className="w-3 h-3" />
                          {wasCached ? "Locked Score (Cached)" : "Score Locked"}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleForceRedecode}
                          disabled={isScanning}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-full border border-border transition-all disabled:opacity-40"
                          title="Re-analyze with fresh AI decode (will update the cached skills)"
                        >
                          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                          Re-decode
                        </motion.button>
                      </div>
                      {/* Save JD Button */}
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveJd}
                        disabled={savingJd || !!savedJdId}
                        className={`mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                          savedJdId
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-primary/30"
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
                      className="flex justify-center mb-8"
                    >
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPriorityFilter(!priorityFilter)}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                          priorityFilter
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                            : "bg-muted/40 text-foreground border-border hover:bg-muted/60"
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                        Priority Filter
                        <span
                          className={`inline-flex items-center w-10 h-5.5 rounded-full p-0.5 relative transition-colors duration-300 ${
                            priorityFilter ? "bg-white/30" : "bg-foreground/10"
                          }`}
                        >
                          <motion.span
                            animate={{ x: priorityFilter ? 18 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
                            style={{ width: 18, height: 18 }}
                          />
                        </span>
                      </motion.button>
                    </motion.div>

                    {/* Skills row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SkillRadarChart skills={filteredSkills} />
                      <SkillProgressBars skills={filteredSkills} priorityMode={priorityFilter} />
                    </div>

                    {/* ATS Keyword Scanner */}
                    <div className="mt-6">
                      <ATSKeywordScanner skills={filteredSkills} aiInsight={getAiInsight(results.skills)} />
                    </div>

                    {/* Consultant Mode Section */}
                    <div className="mt-8 space-y-6">
                      <CriticalRequirements requirements={results.requirements} />
                      <WinningStrategy steps={results.winning_strategy} />
                    </div>

                    {/* Resume Gap Analyzer */}
                    <div className="mt-6">
                      <ResumeGapAnalyzer
                        skills={results.skills}
                        jobTitle={results.title}
                        onResumeTextChange={setUserResumeText}
                        onResultChange={setGapResult}
                      />
                    </div>

                    {/* ATS Score Simulator */}
                    {gapResult && (
                      <div className="mt-6">
                        <ATSScoreSimulator result={gapResult} />
                      </div>
                    )}

                    {/* ATS Resume Generator */}
                    {gapResult && (
                      <div className="mt-6">
                        <ResumeBuilder
                          resumeText={userResumeText}
                          skills={results.skills}
                          deductions={gapResult.deductions}
                          jobTitle={results.title}
                          gapResult={gapResult}
                        />
                      </div>
                    )}
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-6 px-6 md:px-12">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">LuminaJD</span>
            <span>·</span>
            <span>Built for job seekers who refuse to settle.</span>
          </div>
          <span className="text-[10px] text-muted-foreground/50">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
