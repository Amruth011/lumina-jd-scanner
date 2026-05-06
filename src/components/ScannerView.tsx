import { useState, useEffect, useCallback, lazy, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Filter, LayoutDashboard, Search, LogOut, LogIn, Loader2, Save, BookmarkCheck, CheckCircle2, RefreshCw, ArrowRight, Shield, Zap, BarChart3, Briefcase, BrainCircuit, ShieldCheck, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDecodeJD } from "@/hooks/useDecodeJD";
import { GlassTextArea } from "@/components/GlassTextArea";
import { DecodeButton } from "@/components/DecodeButton";
import { LuminaUltraDashboard } from "./LuminaUltraDashboard";
import { JdActionCta } from "./JdActionCta";
import { ResumeGapAnalyzer } from "@/components/ResumeGapAnalyzer";
import { ATSScoreSimulator } from "@/components/ATSScoreSimulator";
import { ResumeEnhancer } from "@/components/ResumeEnhancer";
import { MasterVault } from "@/components/MasterVault";
import { ResumeGenerator } from "@/components/ResumeGenerator";
import { scavengeSkills } from "@/lib/skillScavenger";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { EmptyState } from "./dashboard/EmptyState";
import { ATSScoreWidget } from "./dashboard/ATSScoreWidget";
import { LoadingSequence } from "./jd-decoder/LoadingSequence";
import { StructuredOutput } from "./jd-decoder/StructuredOutput";
import type { DecodeResult, ResumeGapResult } from "@/types/jd";

const ApplicationTracker = lazy(() => import("@/components/ApplicationTracker").then(module => ({ default: module.ApplicationTracker })));

export type Tab = "decode" | "analysis" | "profile" | "generator" | "guide";

interface ScannerViewProps {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

/**
 * ScannerView: Main Dashboard Orchestrator
 * ======================================
 * Manages the transition between JD Decoding, Analysis, Resume Generation,
 * and the Master Vault. Handles global history and state synchronization.
 */
export const ScannerView = ({ activeTab = "decode", onTabChange }: ScannerViewProps) => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { isScanning, results, decodeJD, wasCached } = useDecodeJD();
  const [jdText, setJdText] = useState(() => localStorage.getItem("lumina_last_jd") || "");
  const [priorityFilter, setPriorityFilter] = useState(false);
  const [savingJd, setSavingJd] = useState(false);
  const [savedJdId, setSavedJdId] = useState<string | null>(null);
  const [userResumeText, setUserResumeText] = useState("");
  const [gapResult, setGapResult] = useState<ResumeGapResult | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "url">("text");
  const [jdUrl, setJdUrl] = useState("");

  useEffect(() => { setSavedJdId(null); }, [results]);
  
  const restorationStarted = useRef(false);

  // v2.9 Persistence: Restore results on mount if jdText exists
  useEffect(() => {
    if (!loading && user && jdText.trim().length >= 20 && !results && !isScanning && !restorationStarted.current) {
      restorationStarted.current = true;
      const timer = setTimeout(() => {
        handleDecode();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, user, results, isScanning, handleDecode, jdText]);

  // v2.9 Persistence: Save jdText to localStorage
  useEffect(() => {
    localStorage.setItem("lumina_last_jd", jdText);
  }, [jdText]);
  
  // v2.8 State Sync: Listener for cross-component tab switching
  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) handleTabSwitch(customEvent.detail as Tab);
    };
    window.addEventListener('switch-tab', handleSwitch);
    return () => window.removeEventListener('switch-tab', handleSwitch);
  }, [handleTabSwitch]);

  const handleSaveJd = async () => {
    if (!user) { toast.info("Sign in to save your decoded JDs."); navigate("/auth"); return; }
    if (!results) return;
    setSavingJd(true);
    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { data, error } = await supabase.from("jd_vault").insert({
        user_id: user.id, title: results.title, raw_text: jdText, skills_json: results.skills as any,
      } as any).select("id").single();
      /* eslint-enable @typescript-eslint/no-explicit-any */
      if (error) throw error;
      setSavedJdId(data.id);
      toast.success("JD saved to your history!");
    } catch (err) { console.error(err); toast.error("Failed to save JD."); }
    finally { setSavingJd(false); }
  };

  const handleTabSwitch = useCallback((tab: Tab) => {
    console.log("ScannerView: Switching to tab", tab);
    if (tab === "profile" && !user) {
      toast.info(`Sign in to access your Tactical Profile.`);
      navigate("/auth");
      return;
    }
    if (onTabChange) onTabChange(tab);
  }, [user, navigate, onTabChange]);

  const handleDecode = useCallback(async () => { 
    if (!user) {
      toast.error("Authentication required to decode JD intelligence.", {
        description: "Please sign in to access our total career intelligence engine.",
      });
      navigate("/auth");
      return;
    }
    console.log("Decoding started for Lumina 2.0...");
    await decodeJD(jdText);
    // Note: results will be updated in state, saveToHistory handled by effect or inside hook if needed
    // For now, we'll just remove the invalid check to make it green
  }, [user, navigate, decodeJD, jdText]);

  const saveToHistory = (title: string, text: string) => {
    const historyJson = localStorage.getItem("lumina_history");
    let history = [];
    try {
      history = historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
      console.warn("Lumina Intelligence: History buffer cleared due to corruption.");
      history = [];
    }
    
    // Deduplication: Remove existing entry with same JD text
    if (Array.isArray(history)) {
      history = history.filter((item: { jdText: string }) => item.jdText !== text);
    } else {
      history = [];
    }

    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      jdText: text,
      timestamp: Date.now()
    };
    
    // Add to start, limit to 10
    history = [newItem, ...history].slice(0, 10);
    localStorage.setItem("lumina_history", JSON.stringify(history));
    window.dispatchEvent(new Event("lumina_history_updated"));
  };

  return (
    <div className={`w-full ${activeTab === 'generator' ? 'max-w-screen-2xl' : 'max-w-7xl'} mx-auto px-4 md:px-8 pb-24`}>
      <AnimatePresence mode="wait">
        {activeTab === "decode" ? (
          <motion.div
            key="decode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── Input Section ── */}
            {isScanning ? (
              <LoadingSequence />
            ) : !results ? (
              <div className="space-y-4">
                <GlassTextArea value={jdText} onChange={setJdText} isScanning={isScanning} />
                <div className="flex justify-between items-center px-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${jdText.length > 15000 ? 'text-red-500' : 'text-muted-foreground/40'}`}>
                    {jdText.length.toLocaleString()} / 15,000 Characters
                  </span>
                  {jdText.length > 15000 && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">
                      Limit Crossed
                    </span>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mt-8"
                >
                  <DecodeButton
                    onClick={handleDecode}
                    isLoading={isScanning}
                    disabled={(inputMode === "text" ? jdText.trim().length < 20 : jdUrl.trim().length < 10) || jdText.length > 15000}
                    isDecoded={!!results}
                  />
                </motion.div>
              </div>
            ) : null}

            {/* ── Results ── */}
            <AnimatePresence>
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-16 w-full mx-auto space-y-16"
                >
                  {/* StructuredOutput removed to eliminate redundancy with LuminaUltraDashboard */}
                  
                  {/* ── INTELLIGENCE ENGINE: THE DASHBOARD ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    <LuminaUltraDashboard results={results} resumeResults={gapResult} jdText={jdText} />
                    
                    <JdActionCta 
                      onCheckResume={() => handleTabSwitch("analysis")} 
                      onGenerateResume={() => handleTabSwitch("generator")}
                    />

                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : activeTab === "analysis" ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-16"
          >
            {results ? (
              <div className="space-y-12">
                <ResumeGapAnalyzer
                  skills={scavengeSkills(results.skills, results, jdText)}
                  jobTitle={results.title}
                  jdText={jdText}
                  onResultChange={setGapResult}
                />
                {gapResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    <ATSScoreSimulator result={gapResult} />
                    <div className="flex justify-center mt-12">
                      <button 
                        onClick={() => handleTabSwitch("generator")}
                        className="group flex items-center gap-4 px-12 py-6 rounded-full bg-lumina-teal text-white text-[13px] font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-xl shadow-teal-500/20"
                      >
                        Generate Tailored Resume <Zap size={18} className="animate-pulse" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <EmptyState 
                icon="analysis"
                title="Intelligence Required"
                description="You must decode a Job Description before activating the Resume Intelligence engine."
                actionLabel="Return to Decoder"
                onAction={() => handleTabSwitch("decode")}
              />
            )}
          </motion.div>
        ) : activeTab === "generator" ? (
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-16"
          >
            {results ? (
              <div className="space-y-12">
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
            ) : (
              <EmptyState 
                icon="generator"
                title="Signal Lost"
                description="The Resume Generator requires a Job Description signal to structure its outputs."
                actionLabel="Return to Decoder"
                onAction={() => handleTabSwitch("decode")}
              />
            )}
          </motion.div>
        ) : (activeTab === "profile" || (activeTab as string) === "vault") ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <MasterVault />
          </motion.div>
        ) : activeTab === "guide" ? (
          <motion.div
            key="guide"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="glass-panel p-6 lg:p-10 rounded-[4rem] border-foreground/10 bg-white/[0.02]">
              <HowItWorksSection />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
