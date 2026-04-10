import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Filter, LayoutDashboard, Search, LogOut, LogIn, Loader2, Save, BookmarkCheck, CheckCircle2, RefreshCw, ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";
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

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
};

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

  useEffect(() => { setSavedJdId(null); }, [results]);

  const handleSaveJd = async () => {
    if (!user) { toast.info("Sign in to save your decoded JDs."); navigate("/auth"); return; }
    if (!results) return;
    setSavingJd(true);
    try {
      const { data, error } = await supabase.from("jd_vault").insert({
        user_id: user.id, title: results.title, raw_text: jdText, skills_json: results.skills as any,
      }).select("id").single();
      if (error) throw error;
      setSavedJdId(data.id);
      toast.success("JD saved to your history!");
    } catch (err: any) { console.error(err); toast.error("Failed to save JD."); }
    finally { setSavingJd(false); }
  };

  const handleTabSwitch = (tab: Tab) => {
    if (tab === "applications" && !user) { toast.info("Sign in to access your application tracker."); navigate("/auth"); return; }
    setActiveTab(tab);
  };

  const filteredSkills = results ? priorityFilter ? results.skills.filter((s) => s.importance > 80) : results.skills : [];

  const getAiInsight = (skills: DecodeResult["skills"]) => {
    const critical = skills.filter((s) => s.importance > 80).slice(0, 3).map((s) => s.skill);
    if (critical.length === 0) return "All skills have moderate importance — a well-rounded generalist role.";
    return `Focus on ${critical.join(", ")} for this role; the rest are secondary infrastructure skills.`;
  };

  const handleDecode = async () => { await decodeJD(jdText); };
  const handleForceRedecode = async () => { await decodeJD(jdText, true); };

  const tabClass = (tab: Tab) =>
    `relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      activeTab === tab
        ? "text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`;

  const displayName = user?.email || user?.phone || "User";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden grain-overlay dot-grid-bg">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 md:px-12 border-b border-border/50 liquid-glass backdrop-blur-none bg-transparent">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-background" />
          </div>
          <h1 className="font-display font-bold text-xl text-foreground tracking-tight">
            Lumina<span className="text-muted-foreground font-normal ml-1">JD</span>
          </h1>
        </motion.div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-0.5 bg-muted/40 rounded-full p-0.5 backdrop-blur-sm border border-border/30">
          {[
            { key: "decode" as Tab, icon: Search, label: "Decoder" },
            { key: "applications" as Tab, icon: LayoutDashboard, label: "Applications" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => handleTabSwitch(tab.key)} className={tabClass(tab.key)}>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-foreground dark:bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* User actions */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-1.5"
        >
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-[100px] font-mono">
                {displayName}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-all specular-highlight premium-button-glow"
            >
              <LogIn className="w-3.5 h-3.5 fill-current" />
              Sign in
            </button>
          )}
        </motion.div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 px-4 md:px-8 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "decode" ? (
            <motion.div
              key="decode"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ── Hero Section ── */}
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="text-center mb-12 mt-16 md:mt-28 w-full mx-auto px-4"
              >
                <motion.div variants={fadeUp}>
                  <div className="badge-pill bg-foreground/5 border border-border/50 text-muted-foreground mb-8 mx-auto w-fit shine-effect">
                    <Sparkles className="w-3 h-3" />
                    The #1 ATS Optimization Engine
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <h2 className="text-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground mb-6">
                    Beat the ATS.
                    <br />
                    <span className="text-muted-foreground">Land the Interview.</span>
                  </h2>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <p className="text-body-refined text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10">
                    95% of Fortune 500 companies use an ATS. Paste a job description and our algorithm instantly detects the exact skills, keywords, and metrics you need to rank first.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-wrap justify-center items-center gap-8 text-xs font-medium text-muted-foreground mb-14">
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-foreground/40" /> 100% Private
                  </span>
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-foreground/40" /> Instant Analysis
                  </span>
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-foreground/40" /> AI Resume Snippets
                  </span>
                </motion.div>
              </motion.div>

              {/* ── Text Input ── */}
              <GlassTextArea value={jdText} onChange={setJdText} isScanning={isScanning} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mt-8"
              >
                <DecodeButton
                  onClick={handleDecode}
                  isLoading={isScanning}
                  disabled={jdText.trim().length < 20}
                  isDecoded={!!results}
                />
              </motion.div>

              {/* ── Results ── */}
              <AnimatePresence>
                {results && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-16 w-full mx-auto space-y-8 px-4"
                  >
                    {/* Results header */}
                    <div className="text-center space-y-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      >
                        <h3 className="text-display font-bold text-3xl md:text-4xl text-foreground">
                          {results.title}
                        </h3>
                        <div className="section-divider w-20 mx-auto mt-4" />
                      </motion.div>

                      <div className="flex items-center justify-center gap-3 flex-wrap">

                        <button
                          onClick={handleForceRedecode}
                          disabled={isScanning}
                          className="badge-pill bg-transparent border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all disabled:opacity-40"
                        >
                          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                          Re-decode
                        </button>
                      </div>

                      <button
                        onClick={handleSaveJd}
                        disabled={savingJd || !!savedJdId}
                        className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                          savedJdId
                            ? "bg-[hsl(var(--skill-core))]/10 text-[hsl(var(--skill-core))] border border-[hsl(var(--skill-core))]/20 shadow-inner"
                            : "bg-foreground text-background hover:opacity-90 specular-highlight premium-button-glow"
                        } disabled:opacity-50 active:scale-95`}
                      >
                        {savingJd ? <Loader2 className="w-4 h-4 animate-spin" /> : savedJdId ? <BookmarkCheck className="w-4 h-4" /> : <Save className="w-4 h-4 fill-current" />}
                        {savedJdId ? "Saved" : "Save Analysis"}
                      </button>
                    </div>

                    {/* Priority Filter */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => setPriorityFilter(!priorityFilter)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-500 border shadow-sm active:scale-95 ${
                          priorityFilter
                            ? "bg-foreground text-background border-transparent dark:bg-primary/20 dark:text-primary dark:border-primary/40 specular-highlight"
                            : "bg-transparent text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
                        }`}
                      >
                        <Filter className="w-3.5 h-3.5" />
                        Priority Filter
                        <span className={`inline-flex items-center w-10 h-5 rounded-full p-0.5 transition-colors duration-500 ${
                          priorityFilter ? "bg-emerald-500" : "bg-foreground/10 border border-border/50"
                        }`}>
                          <motion.span
                            animate={{ x: priorityFilter ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`w-4 h-4 rounded-full ${priorityFilter ? "bg-white shadow-lg" : "bg-muted-foreground/40"} shadow-sm`}
                          />
                        </span>
                      </button>
                    </div>

                    {/* Skills grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SkillRadarChart skills={filteredSkills} />
                      <SkillProgressBars skills={filteredSkills} priorityMode={priorityFilter} />
                    </div>

                    {/* ATS Keyword Scanner */}
                    <ATSKeywordScanner skills={filteredSkills} aiInsight={getAiInsight(results.skills)} />

                    {/* Requirements & Strategy */}
                    <div className="space-y-6">
                      <CriticalRequirements requirements={results.requirements} />
                      <WinningStrategy steps={results.winning_strategy} />
                    </div>

                    {/* Resume Gap Analyzer */}
                    <ResumeGapAnalyzer
                      skills={results.skills}
                      jobTitle={results.title}
                      onResumeTextChange={setUserResumeText}
                      onResultChange={setGapResult}
                    />

                    {/* ATS Score Simulator */}
                    {gapResult && <ATSScoreSimulator result={gapResult} />}

                    {/* Resume Builder */}
                    {gapResult && (
                      <ResumeBuilder
                        resumeText={userResumeText}
                        skills={results.skills}
                        deductions={gapResult.deductions}
                        jobTitle={results.title}
                        gapResult={gapResult}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="applications"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
            >
              <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
                <ApplicationTracker />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border/30 py-8 px-6 md:px-12">
        <div className="w-full mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/90">
            <div className="w-5 h-5 rounded bg-foreground/5 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-muted-foreground/80" />
            </div>
            Lumina JD
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono">
            Built for job seekers who refuse to be filtered out.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
