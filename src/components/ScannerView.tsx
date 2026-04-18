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

type Tab = "decode" | "analysis" | "generator" | "vault" | "applications" | "guide";

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
      {/* Tab Navigation Internal */}
      <div className="flex justify-center mb-12">
        <nav className="flex items-center gap-1.5 bg-muted/40 p-2 rounded-3xl backdrop-blur-3xl border border-foreground/10 shadow-2xl shadow-black/10 overflow-x-auto max-w-full no-scrollbar">
          {[
            { key: "decode" as Tab, icon: Search, label: "JD Decoder" },
            { key: "analysis" as Tab, icon: ShieldCheck, label: "Resume Analysis" },
            { key: "generator" as Tab, icon: Zap, label: "Resume Generator" },
            { key: "vault" as Tab, icon: LayoutDashboard, label: "Master Vault" },
            { key: "applications" as Tab, icon: Briefcase, label: "Pipeline" },
            { key: "guide" as Tab, icon: Info, label: "How It Works" },
          ].map((tab) => (
            <button 
              key={tab.key} 
              onClick={() => handleTabSwitch(tab.key)} 
              className={`relative flex items-center gap-2 px-6 py-3 rounded-2xl text-[12px] font-display font-bold transition-all duration-500 whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
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
                <span className="hidden lg:inline tracking-tight">{tab.label}</span>
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
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
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
                      
                      <div className="flex flex-col items-center gap-8 py-20">
                         <div className="section-divider max-w-sm w-full opacity-20" />
                         <button 
                           onClick={() => setActiveTab("analysis")}
                           className="group flex items-center gap-4 px-12 py-6 rounded-full bg-foreground text-background text-[13px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                         >
                           Continue to Resume Analysis <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                         </button>
                      </div>
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
                  skills={results.skills}
                  jobTitle={results.title}
                  onResumeTextChange={setUserResumeText}
                  onResultChange={setGapResult}
                />
                {gapResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ATSScoreSimulator result={gapResult} />
                    <div className="flex justify-center mt-12">
                      <button 
                        onClick={() => setActiveTab("generator")}
                        className="group flex items-center gap-4 px-12 py-6 rounded-full bg-accent-blue text-white text-[13px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                      >
                        Generate Tailored Resume <Zap size={18} className="animate-pulse" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="py-24 text-center glass-panel rounded-[3rem] border border-dashed border-foreground/10">
                <Search size={48} className="mx-auto text-muted-foreground/20 mb-6" />
                <h3 className="text-3xl font-serif italic mb-4">Intelligence Required</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">You must decode a Job Description before activating the Resume Intelligence engine.</p>
                <button 
                  onClick={() => setActiveTab("decode")}
                  className="px-8 py-4 rounded-full bg-foreground text-background text-[12px] font-black uppercase tracking-widest"
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
              <div className="py-24 text-center glass-panel rounded-[3rem] border border-dashed border-foreground/10">
                <Zap size={48} className="mx-auto text-muted-foreground/20 mb-6" />
                <h3 className="text-3xl font-serif italic mb-4">Signal Lost</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">The Resume Generator requires a Job Description signal to structure its outputs.</p>
                <button 
                  onClick={() => setActiveTab("decode")}
                  className="px-8 py-4 rounded-full bg-foreground text-background text-[12px] font-black uppercase tracking-widest"
                >
                  Return to Decoder
                </button>
              </div>
            )}
          </motion.div>
        ) : activeTab === "applications" ? (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
              <ApplicationTracker />
            </Suspense>
          </motion.div>
        ) : activeTab === "guide" ? (
          <motion.div
            key="guide"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-20 pb-20"
          >
            <div className="glass-panel p-10 lg:p-20 rounded-[4rem] border border-foreground/5 bg-gradient-to-br from-primary/5 to-transparent">
              <h2 className="text-5xl font-serif italic text-foreground mb-4">Tactical Operations Guide</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mb-12">Learn how to leverage Lumina's total intelligence engine to secure your next career milestone.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "JD Deconstruction", desc: "Our engine deconstructs generic job text into high-fidelity tactical requirements and hidden risks." },
                  { title: "Resume Alignment", desc: "The gap analyzer performs a semantic cross-reference to identify exactly where your experience misaligns." },
                  { title: "Generative Export", desc: "Generate a Silicon Valley grade resume tailored specifically to the decoded JD signatures." },
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-background/50 border border-foreground/10 hover:border-primary/40 transition-colors">
                    <span className="text-[40px] font-serif italic text-primary/20 block mb-4">0{i+1}</span>
                    <h4 className="text-xl font-display font-bold mb-3">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <MasterVault />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
