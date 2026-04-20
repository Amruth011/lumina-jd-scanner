import { useState, useEffect, lazy, Suspense } from "react";
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
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { scavengeSkills } from "@/lib/skillScavenger";
import type { DecodeResult, ResumeGapResult } from "@/types/jd";

const ApplicationTracker = lazy(() => import("@/components/ApplicationTracker").then(module => ({ default: module.ApplicationTracker })));

export type Tab = "decode" | "analysis" | "profile" | "generator" | "guide";

interface ScannerViewProps {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
};

export const ScannerView = ({ activeTab = "decode", onTabChange }: ScannerViewProps) => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { isScanning, results, decodeJD, wasCached } = useDecodeJD();
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
    if (tab === "profile" && !user) {
      toast.info(`Sign in to access your Tactical Profile.`);
      navigate("/auth");
      return;
    }
    if (onTabChange) onTabChange(tab);
  };

  const filteredSkills = results?.skills ? (priorityFilter ? results.skills.filter((s) => s.importance > 80) : results.skills) : [];

  const getAiInsight = (skills: DecodeResult["skills"] = []) => {
    const critical = (skills || []).filter((s) => s.importance > 80).slice(0, 3).map((s) => s.skill);
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
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                          wasCached 
                            ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"
                            : "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald"
                        }`}>
                          <Shield size={10} className={wasCached ? "animate-pulse" : ""} />
                          {wasCached ? "Consistency Verified" : "Strategic Intelligence Active"}
                        </div>
                      </div>
                      <h3 className="font-serif italic text-4xl md:text-5xl lg:text-7xl text-foreground tracking-[-0.04em] leading-[0.9] max-w-5xl mx-auto px-4 mt-4 text-balance">
                        {results.title}
                      </h3>
                    </motion.div>

                  </div>

                  {/* ── INTELLIGENCE ENGINE: THE DASHBOARD ── */}
                  {results && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-4"
                    >
                      <LuminaUltraDashboard results={results} resumeResults={gapResult} jdText={jdText} />
                      
                      <JdActionCta onCheckResume={() => handleTabSwitch("analysis")} />

                    </motion.div>
                  )}
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
              <>
                <ResumeGapAnalyzer
                  skills={scavengeSkills(results.skills, results, jdText)}
                  jobTitle={results.title}
                  jdText={jdText}
                  onResultChange={setGapResult}
                />
                {gapResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ATSScoreSimulator result={gapResult} />
                    <div className="flex justify-center mt-12">
                      <button 
                        onClick={() => handleTabSwitch("generator")}
                        className="group flex items-center gap-4 px-12 py-6 rounded-full bg-accent-blue text-white text-[13px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                      >
                        Generate Tailored Resume <Zap size={18} className="animate-pulse" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="py-16 text-center glass-panel rounded-[3rem] border border-dashed border-foreground/10">
                <Search size={48} className="mx-auto text-primary/40 mb-6" />
                <h3 className="text-3xl font-serif italic mb-4 text-foreground">Intelligence Required</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 font-medium">You must decode a Job Description before activating the Resume Intelligence engine.</p>
                <button 
                  onClick={() => handleTabSwitch("decode")}
                  className="px-8 py-3 rounded-full bg-primary text-background text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Return to Decoder
                </button>
              </div>
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
              <>
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
              </>
            ) : (
              <div className="py-16 text-center glass-panel rounded-[3rem] border border-dashed border-foreground/10">
                <Zap size={48} className="mx-auto text-primary/40 mb-6" />
                <h3 className="text-3xl font-serif italic mb-4 text-foreground">Signal Lost</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 font-medium">The Resume Generator requires a Job Description signal to structure its outputs.</p>
                <button 
                  onClick={() => handleTabSwitch("decode")}
                  className="px-8 py-3 rounded-full bg-primary text-background text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Return to Decoder
                </button>
              </div>
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
