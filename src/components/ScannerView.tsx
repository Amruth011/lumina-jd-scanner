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

const ApplicationTracker = lazy(() => import("@/components/ApplicationTracker").then(module => ({ default: module.ApplicationTracker })));

type Tab = "decode" | "applications";

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
};

export const ScannerView = () => {
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
        user_id: user.id, title: results.title, raw_text: jdText, skills_json: results.skills,
      }).select("id").single();
      if (error) throw error;
      setSavedJdId(data.id);
      toast.success("JD saved to your history!");
    } catch (err) { console.error(err); toast.error("Failed to save JD."); }
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
    `relative flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-display font-bold transition-all duration-300 ${
      activeTab === tab
        ? "text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`;

  const displayName = user?.email || user?.phone || "User";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-24">
      {/* Tab Navigation Internal */}
      <div className="flex justify-center mb-12">
        <nav className="flex items-center gap-0.5 bg-background/20 rounded-full p-1 backdrop-blur-3xl border border-white/40 shadow-xl shadow-black/5">
          {[
            { key: "decode" as Tab, icon: Search, label: "Decoder" },
            { key: "applications" as Tab, icon: LayoutDashboard, label: "Applications" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => handleTabSwitch(tab.key)} className={tabClass(tab.key)}>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTabScanner"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
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
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "decode" ? (
          <motion.div
            key="decode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
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
                  className="mt-16 w-full mx-auto space-y-8"
                >
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
                    >
                      <h3 className="font-serif italic text-4xl md:text-5xl lg:text-7xl text-foreground tracking-[-0.04em] leading-[0.9] max-w-5xl mx-auto px-4 mt-4 text-balance">
                        {results.title}
                      </h3>
                      <div className="section-divider w-24 mx-auto mt-10 opacity-60" />
                    </motion.div>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleForceRedecode}
                        disabled={isScanning}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-display font-bold uppercase tracking-[0.1em] bg-muted/40 text-muted-foreground border border-border/40 hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                        Engine Reboot
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98, y: 0 }}
                        onClick={handleSaveJd}
                        disabled={savingJd || !!savedJdId}
                        className={`relative overflow-hidden inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl text-[13px] font-display font-bold uppercase tracking-[0.1em] transition-all shadow-xl ${
                          savedJdId
                            ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 shadow-inner"
                            : "bg-foreground text-background hover:opacity-90 liquid-glass-refractive shadow-foreground/5"
                        } disabled:opacity-50`}
                      >
                        <div className="liquid-water-layer opacity-10" />
                        {savingJd ? <Loader2 className="w-4 h-4 animate-spin" /> : savedJdId ? <BookmarkCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {savedJdId ? "Archived" : "Archive Intelligence"}
                      </motion.button>
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex justify-center pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98, y: 1 }}
                      onClick={() => setPriorityFilter(!priorityFilter)}
                      className={`relative overflow-hidden flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-display font-bold uppercase tracking-[0.1em] transition-all duration-500 border shadow-sm ${
                        priorityFilter
                          ? "bg-foreground text-background border-transparent liquid-glass-refractive"
                          : "bg-background/40 text-muted-foreground border-border/60 hover:text-foreground hover:border-border"
                      }`}
                    >
                      <div className="liquid-water-layer opacity-10" />
                      <Filter className="w-4 h-4" />
                      Critical Skills Only
                      <div className={`inline-flex items-center w-9 h-4.5 rounded-full p-0.5 transition-colors duration-500 border ${
                        priorityFilter ? "bg-accent-emerald border-accent-emerald/20" : "bg-muted/30 border-border/50"
                      }`}>
                        <motion.span
                          animate={{ x: priorityFilter ? 18 : 0 }}
                          transition={{ type: "spring", stiffness: 600, damping: 30 }}
                          className={`w-3.5 h-3.5 rounded-full ${priorityFilter ? "bg-white shadow-md" : "bg-muted-foreground/30"} shadow-sm`}
                        />
                      </div>
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkillRadarChart skills={filteredSkills} />
                    <SkillProgressBars skills={filteredSkills} priorityMode={priorityFilter} />
                  </div>

                  <ATSKeywordScanner skills={filteredSkills} aiInsight={getAiInsight(results.skills)} />

                  <div className="space-y-6">
                    <CriticalRequirements requirements={results.requirements} />
                    <WinningStrategy steps={results.winning_strategy} />
                  </div>

                  <ResumeGapAnalyzer
                    skills={results.skills}
                    jobTitle={results.title}
                    onResumeTextChange={setUserResumeText}
                    onResultChange={setGapResult}
                  />

                  {gapResult && <ATSScoreSimulator result={gapResult} />}

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
          >
            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
              <ApplicationTracker />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
