import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, Play, Zap, Palette, BarChart3, Shield, 
  Search, LayoutDashboard, LogIn, LogOut, CheckCircle2, 
  Loader2, Filter, Save, BookmarkCheck, RefreshCw, Star
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDecodeJD } from "@/hooks/useDecodeJD";
import { BlurText } from "@/components/BlurText";
import { HlsVideo } from "@/components/HlsVideo";
import { ThemeToggle } from "@/components/ThemeToggle";
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

const NAV_LINKS = ["Home", "Services", "Work", "Process", "Pricing"];
const PARTNERS = ["Stripe", "Vercel", "Linear", "Notion", "Figma"];

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isScanning, results, decodeJD } = useDecodeJD();
  const [activeTab, setActiveTab] = useState<"decode" | "applications">("decode");
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
      toast.success("JD saved to history!");
    } catch (err) { toast.error("Failed to save."); }
    finally { setSavingJd(false); }
  };

  const handleDecode = async () => { 
    await decodeJD(jdText);
    const decoderSection = document.getElementById('scanner-results');
    if (decoderSection) decoderSection.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredSkills = results ? priorityFilter ? results.skills.filter((s) => s.importance > 80) : results.skills : [];

  return (
    <div className="min-h-screen bg-black text-white font-body overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* ── Navbar ── */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-3 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg p-1.5">
             <Zap className="text-black w-6 h-6 fill-current" />
          </div>
          <span className="font-heading italic text-2xl tracking-tight hidden sm:block">Lumina</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 liquid-glass rounded-full px-1.5 py-1 pointer-events-auto">
          {NAV_LINKS.map(link => (
            <button key={link} className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors">
              {link}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => navigate("/auth")}
            className="bg-white text-black rounded-full px-5 py-2 text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            Get Started
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-[1000px] flex flex-col pt-[150px] overflow-visible">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay loop muted playsInline 
            className="absolute left-0 w-full h-[80%] object-cover opacity-60 mix-blend-screen overflow-hidden"
            style={{ top: '10%' }}
            poster="/images/hero_bg.jpeg"
          >
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="relative z-10 container max-w-5xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 liquid-glass rounded-full px-1 py-1 mb-8"
          >
            <span className="bg-white text-black rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">New</span>
            <span className="text-xs font-medium px-2">The future of JD decoding is here.</span>
          </motion.div>

          <BlurText 
            text="The Career You Deserve" 
            className="text-6xl md:text-8xl lg:text-[7rem] font-heading italic text-white leading-[0.8] tracking-[-0.04em] mb-8" 
          />

          <motion.p 
            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed mb-12"
          >
            Stunningly accurate. Blazing performance. Built by AI, refined by experts. This is ATS optimization, wildly reimagined.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="max-w-4xl mx-auto mb-20"
          >
            {/* Embedded Scanner Container */}
            <div className="liquid-glass rounded-3xl p-6 md:p-8 backdrop-blur-xl border border-white/5 shadow-2xl">
              <GlassTextArea value={jdText} onChange={setJdText} isScanning={isScanning} />
              <div className="flex justify-center mt-6">
                 <DecodeButton onClick={handleDecode} isLoading={isScanning} isDecoded={!!results} disabled={jdText.length < 20} />
              </div>
            </div>
          </motion.div>

          {/* Partners list */}
          <div className="mt-20 border-t border-white/5 pt-16">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-10">Trusted by top teams at</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
              {PARTNERS.map(p => (
                <span key={p} className="font-heading italic text-3xl md:text-4xl text-white/30 hover:text-white/80 transition-colors cursor-default select-none">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Start Section ── */}
      <section className="relative h-[800px] flex items-center justify-center overflow-hidden">
        <HlsVideo 
          src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
          overlayClassName="bg-black/30"
          className="container mx-auto"
        />
        <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 text-center max-w-3xl px-6">
          <div className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium inline-block mb-6">How It Works</div>
          <h2 className="text-5xl md:text-7xl font-heading italic leading-tight mb-8">You dream it.<br/>We rank it.</h2>
          <p className="text-lg text-white/60 font-light mb-10 mx-auto max-w-xl">
             Share the job description. Our AI handles the rest — keywords, skills, resume alignment, and ATS mapping. All in seconds, not hours.
          </p>
          <button className="liquid-glass-strong rounded-full px-8 py-3.5 text-sm font-bold flex items-center gap-2 mx-auto">
             Get Started Now <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Features Chess ── */}
      <section className="py-32 container mx-auto px-6 space-y-32">
        <div className="text-center max-w-xl mx-auto mb-20">
           <div className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium inline-block mb-4 uppercase tracking-widest">Capabilities</div>
           <h3 className="text-4xl md:text-5xl font-heading italic">Pro features.<br/>Zero complexity.</h3>
        </div>

        {/* Row 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h4 className="text-3xl md:text-4xl font-heading italic leading-tight">Designed to convert.<br/>Built to perform.</h4>
            <p className="text-white/60 font-light text-lg">
              Every keyword is intentional. Our AI studies what recruiters look for across thousands of hires — then builds your resume to outperform them all.
            </p>
            <button className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-bold">Learn more</button>
          </div>
          <div className="lg:w-1/2 liquid-glass rounded-2xl p-2 overflow-hidden">
            <img src="https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif" className="w-full rounded-xl" alt="Feature 1" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h4 className="text-3xl md:text-4xl font-heading italic leading-tight">It gets smarter.<br/>Automatically.</h4>
            <p className="text-white/60 font-light text-lg">
              Your profile evolves. AI monitors hidden ATS trends and keyword shifts — then updates your strategy in real time. No manual research. Ever.
            </p>
            <button className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-bold">See how it works</button>
          </div>
          <div className="lg:w-1/2 liquid-glass rounded-2xl p-2 overflow-hidden">
            <img src="https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif" className="w-full rounded-xl" alt="Feature 2" />
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-32 bg-white/5 border-y border-white/5 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-20">
             <div className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium inline-block mb-4 uppercase tracking-widest">Why Us</div>
             <h3 className="text-4xl md:text-5xl font-heading italic">The difference is everything.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="liquid-glass rounded-3xl p-8 space-y-6 flex flex-col items-start transition-transform hover:-translate-y-2 duration-500">
               <div className="liquid-glass-strong h-12 w-12 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5" />
               </div>
               <h5 className="text-xl font-heading italic">Seconds, Not Weeks</h5>
               <p className="text-sm text-white/50 leading-relaxed">Analysis to optimized resume at a pace that redefines fast. Because the best jobs leave early.</p>
            </div>

            <div className="liquid-glass rounded-3xl p-8 space-y-6 flex flex-col items-start transition-transform hover:-translate-y-2 duration-500">
               <div className="liquid-glass-strong h-12 w-12 rounded-full flex items-center justify-center">
                  <Palette className="w-5 h-5" />
               </div>
               <h5 className="text-xl font-heading italic">Obsessively Crafted</h5>
               <p className="text-sm text-white/50 leading-relaxed">Every detail considered. Every keyword refined. Strategy so precise, it feels inevitable.</p>
            </div>

            <div className="liquid-glass rounded-3xl p-8 space-y-6 flex flex-col items-start transition-transform hover:-translate-y-2 duration-500">
               <div className="liquid-glass-strong h-12 w-12 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
               </div>
               <h5 className="text-xl font-heading italic">Built to Convert</h5>
               <p className="text-sm text-white/50 leading-relaxed">Layouts informed by recruiter data. Decisions backed by ATS performance. Results you can measure.</p>
            </div>

            <div className="liquid-glass rounded-3xl p-8 space-y-6 flex flex-col items-start transition-transform hover:-translate-y-2 duration-500">
               <div className="liquid-glass-strong h-12 w-12 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5" />
               </div>
               <h5 className="text-xl font-heading italic">Secure by Default</h5>
               <p className="text-sm text-white/50 leading-relaxed">Privacy-first analysis. Your data is encrypted and never sold. Only local insights for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden py-32">
        <HlsVideo 
          src="https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8"
          desaturated
          overlayClassName="bg-black/40"
        />
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 w-full max-w-4xl px-6">
           <div className="liquid-glass rounded-[3rem] p-12 md:p-20 backdrop-blur-3xl border border-white/5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                <div className="space-y-2">
                   <div className="text-4xl md:text-5xl lg:text-6xl font-heading italic">2k+</div>
                   <div className="text-[10px] uppercase tracking-widest text-white/40">Users Hired</div>
                </div>
                <div className="space-y-2">
                   <div className="text-4xl md:text-5xl lg:text-6xl font-heading italic">99%</div>
                   <div className="text-[10px] uppercase tracking-widest text-white/40">Success Rate</div>
                </div>
                <div className="space-y-2">
                   <div className="text-4xl md:text-5xl lg:text-6xl font-heading italic">3.2x</div>
                   <div className="text-[10px] uppercase tracking-widest text-white/40">Interview Lift</div>
                </div>
                <div className="space-y-2">
                   <div className="text-4xl md:text-5xl lg:text-6xl font-heading italic">100%</div>
                   <div className="text-[10px] uppercase tracking-widest text-white/40">AI Driven</div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-32 container mx-auto px-6">
         <div className="text-center max-w-xl mx-auto mb-28">
             <div className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium inline-block mb-4 uppercase tracking-widest">What They Say</div>
             <h3 className="text-4xl md:text-5xl lg:text-6xl font-heading italic leading-tight">Don't take our<br/>word for it.</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="liquid-glass rounded-[2rem] p-10 space-y-8">
               <div className="flex text-emerald-400 gap-1"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
               <p className="text-lg font-light leading-relaxed text-white/80 italic">"A complete resume rebuild in five minutes. The result outperformed everything I'd spent months crafting before."</p>
               <div>
                  <div className="font-bold text-white">Sarah Chen</div>
                  <div className="text-xs text-white/40">Software Engineer, Luminary</div>
               </div>
            </div>

            <div className="liquid-glass rounded-[2rem] p-10 space-y-8">
               <div className="flex text-emerald-400 gap-1"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
               <p className="text-lg font-light leading-relaxed text-white/80 italic">"Interview calls tripled in one week. That's not a typo. The AI just knows how recruiters think better than I do."</p>
               <div>
                  <div className="font-bold text-white">Marcus Webb</div>
                  <div className="text-xs text-white/40">Senior PM, Arcline</div>
               </div>
            </div>

            <div className="liquid-glass rounded-[2rem] p-10 space-y-8">
               <div className="flex text-emerald-400 gap-1"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
               <p className="text-lg font-light leading-relaxed text-white/80 italic">"This didn't just fix my resume. It defined my value. World-class insights that land you in the top 1% of applicants."</p>
               <div>
                  <div className="font-bold text-white">Elena Voss</div>
                  <div className="text-xs text-white/40">UX Design Lead, Helix</div>
               </div>
            </div>
         </div>
      </section>

      {/* ── Results Anchor ── */}
      <div id="scanner-results" className="scroll-mt-32" />

      {/* ── Scanner Results Section (Conditional) ── */}
      <AnimatePresence>
        {results && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-32 container mx-auto px-6"
          >
             <div className="liquid-glass rounded-[4rem] p-8 md:p-16 border border-white/10 shadow-3xl">
                <div className="text-center mb-16">
                   <h3 className="text-4xl md:text-5xl font-heading italic mb-4">{results.title}</h3>
                   <div className="flex items-center justify-center gap-4">
                      <button onClick={handleSaveJd} disabled={savingJd || !!savedJdId} className="liquid-glass-strong rounded-full px-6 py-2.5 text-xs font-bold flex items-center gap-2">
                         {savingJd ? <Loader2 className="w-3 h-3 animate-spin" /> : savedJdId ? <BookmarkCheck className="w-3 h-3 text-emerald-400" /> : <Save className="w-3 h-3" />}
                         {savedJdId ? "Saved" : "Save Job Information"}
                      </button>
                      <button onClick={handleSaveJd} className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold">Download Strategy</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <SkillRadarChart skills={filteredSkills} />
                   <SkillProgressBars skills={filteredSkills} priorityMode={priorityFilter} />
                </div>

                <div className="mt-12 space-y-12">
                   <ATSKeywordScanner skills={filteredSkills} aiInsight="..." />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <CriticalRequirements requirements={results.requirements} />
                      <WinningStrategy steps={results.winning_strategy} />
                   </div>
                   <ResumeGapAnalyzer 
                     skills={results.skills} jobTitle={results.title} 
                     onResumeTextChange={setUserResumeText} onResultChange={setGapResult} 
                   />
                   {gapResult && <ATSScoreSimulator result={gapResult} />}
                   {gapResult && (
                      <ResumeBuilder 
                        resumeText={userResumeText} skills={results.skills} 
                        deductions={gapResult.deductions} jobTitle={results.title} 
                        gapResult={gapResult} 
                      />
                   )}
                </div>
             </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── CTA + Footer ── */}
      <section className="relative min-h-[900px] flex flex-col justify-end overflow-hidden pb-16">
        <HlsVideo 
          src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8"
          overlayClassName="bg-black/60"
        />
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-black to-transparent" />

        <div className="relative z-10 container mx-auto px-6 text-center mb-32">
           <BlurText 
             text="Your next move starts here." 
             className="text-5xl md:text-7xl lg:text-[6rem] font-heading italic leading-[0.85] text-white mb-10" 
           />
           <p className="text-lg text-white/50 max-w-xl mx-auto font-light mb-12 leading-relaxed">
             Stop guessing what recruiters want. See what AI-powered ATS optimization can do. No technical debt, no wasted applications. Just growth.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="liquid-glass-strong rounded-full px-12 py-5 text-base font-bold flex items-center gap-3 active:scale-95 transition-transform" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                 Boost Your Resume <ArrowUpRight className="w-5 h-5" />
              </button>
              <button className="bg-white text-black rounded-full px-12 py-5 text-base font-bold hover:bg-white/90 active:scale-95 transition-transform">
                 View Pricing
              </button>
           </div>
        </div>

        <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="text-white/40 text-xs font-light">© 2026 Lumina Studio. All rights reserved.</div>
           <div className="flex gap-12 text-white/40 text-xs uppercase tracking-widest font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
           </div>
        </footer>
      </section>

    </div>
  );
};

export default Index;
