import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Filter, LayoutDashboard, Search, LogOut, LogIn, Loader2, Save, BookmarkCheck, CheckCircle2, RefreshCw, ArrowRight, Shield, Zap, BarChart3, Briefcase, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDecodeJD } from "@/hooks/useDecodeJD";
import { GlassTextArea } from "@/components/GlassTextArea";
import { DecodeButton } from "@/components/DecodeButton";
import { LuminaUltraDashboard } from "./LuminaUltraDashboard";
import { SkillRadarChart } from "@/components/SkillRadarChart";
import { SkillProgressBars } from "@/components/SkillProgressBars";
import { CriticalRequirements } from "@/components/CriticalRequirements";
import { WinningStrategy } from "@/components/WinningStrategy";
import { ResumeGapAnalyzer } from "@/components/ResumeGapAnalyzer";
import { ATSKeywordScanner } from "@/components/ATSKeywordScanner";
import { ATSScoreSimulator } from "@/components/ATSScoreSimulator";
import { ResumeEnhancer } from "@/components/ResumeEnhancer";
import { MasterVault } from "@/components/MasterVault";
import { ResumeGenerator } from "@/components/ResumeGenerator";
import { JdVerdictCard } from "@/components/JdVerdictCard";
import { RecruiterLens } from "@/components/RecruiterLens";
import { RoleDistribution } from "@/components/RoleDistribution";
import { InterviewCoach } from "@/components/InterviewCoach";
import { BonusInsights } from "@/components/BonusInsights";
import { IcebergAnalysis } from "@/components/IcebergAnalysis";
import type { DecodeResult, ResumeGapResult } from "@/types/jd";

const ApplicationTracker = lazy(() => import("@/components/ApplicationTracker").then(module => ({ default: module.ApplicationTracker })));

type Tab = "decode" | "vault" | "applications";

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
    if ((tab === "applications" || tab === "vault") && !user) {
      toast.info(`Sign in to access your ${tab === "vault" ? "Master Vault" : "application tracker"}.`);
      navigate("/auth");
      return;
    }
    setActiveTab(tab);
  };

  const filteredSkills = results ? priorityFilter ? results.skills.filter((s) => s.importance > 80) : results.skills : [];

  const getAiInsight = (skills: DecodeResult["skills"]) => {
    const critical = skills.filter((s) => s.importance > 80).slice(0, 3).map((s) => s.skill);
    if (critical.length === 0) return "All skills have moderate importance — a well-rounded generalist role.";
    return `Focus on ${critical.join(", ")} for this role; the rest are secondary infrastructure skills.`;
  };

  const handleDecode = async () => { 
    console.log("Decoding started for Lumina 2.0...");
    await decodeJD(jdText); 
  };
  
  const handleForceRedecode = async () => { 
    console.log("Force rebooting Total Intelligence engine...");
    await decodeJD(jdText, true); 
  };

  const displayName = user?.email || user?.phone || "User";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-24">
      {/* Tab Navigation Internal */}
      <div className="flex justify-center mb-12">
        <nav className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-3xl backdrop-blur-3xl border border-white/5 shadow-2xl shadow-black/10">
          {[
            { key: "decode" as Tab, icon: Search, label: "JD Decoder" },
            { key: "vault" as Tab, icon: LayoutDashboard, label: "Master Vault" },
            { key: "applications" as Tab, icon: Briefcase, label: "Pipeline" },
          ].map((tab) => (
            <button 
              key={tab.key} 
              onClick={() => handleTabSwitch(tab.key)} 
              className={`relative flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-display font-bold transition-all duration-500 ${
                activeTab === tab.key
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTabScanner"
                  className="absolute inset-0 bg-foreground rounded-2xl shadow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.key ? 'text-background' : 'text-primary/40'}`} />
                <span className="hidden sm:inline tracking-tight">{tab.label}</span>
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
                      <div className="flex justify-center mb-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                          wasCached 
                            ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue shadow-[0_0_15px_rgba(var(--accent-blue-rgb),0.1)]"
                            : "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald shadow-[0_0_15px_rgba(var(--accent-emerald-rgb),0.1)]"
                        }`}>
                          <Shield size={10} className={wasCached ? "animate-pulse" : ""} />
                          {wasCached ? "Consistency Verified (Cached)" : "Strategic Intelligence Active"}
                        </div>
                      </div>
                      <h3 className="font-serif italic text-4xl md:text-5xl lg:text-7xl text-foreground tracking-[-0.04em] leading-[0.9] max-w-5xl mx-auto px-4 mt-4 text-balance">
                        {results.title}
                      </h3>
                      <div className="section-divider w-24 mx-auto mt-10 opacity-60" />
                    </motion.div>

                  </div>

                  {/* ── INTELLIGENCE ENGINE: THE DASHBOARD ── */}
                  {results && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-32"
                    >
                      <LuminaUltraDashboard results={results} />
                      
                      <div className="section-divider max-w-sm mx-auto opacity-20" />

                      <div className="space-y-16">
                        <ResumeGapAnalyzer
                          skills={results.skills}
                          jobTitle={results.title}
                          onResumeTextChange={setUserResumeText}
                          onResultChange={setGapResult}
                        />

                        {gapResult && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <ATSScoreSimulator result={gapResult} />
                          </motion.div>
                        )}

                        <ResumeGenerator
                          jdTitle={results.title}
                          jdSkills={results.skills}
                        />

                        {gapResult && (
                          <ResumeEnhancer
                            resumeText={userResumeText}
                            skills={results.skills}
                            deductions={gapResult.deductions}
                            jobTitle={results.title}
                            gapResult={gapResult}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {gapResult && (
                    <ResumeEnhancer
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
        ) : activeTab === "applications" ? (
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
        ) : (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <MasterVault />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
