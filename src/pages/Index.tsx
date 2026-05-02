import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, BrainCircuit, ShieldCheck, Target, FileText, Check, Star, CheckCircle2, BarChart3, Zap } from "lucide-react";
import { LuminaLogo } from "@/components/LuminaLogo";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { Roadmap3D } from "@/components/Roadmap3D";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
export type Tab = "decode" | "analysis" | "profile" | "generator" | "guide";

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="font-mono text-sm md:text-base text-foreground/80">
      {displayedText}
      <span className={`inline-block w-2 h-4 md:h-5 ml-1 bg-accent-emerald align-middle ${!isTyping ? 'animate-blink' : ''}`}></span>
    </span>
  );
};

const AnimatedCounter = ({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = Math.max(1, Math.floor(end / (duration * 60))); 
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const ScoreRing = ({ score, colorClass, isTeal = false }: { score: number, colorClass: string, isTeal?: boolean }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative w-32 h-32 flex items-center justify-center rounded-full ${isTeal ? 'shadow-[0_0_40px_rgba(16,185,129,0.2)]' : ''}`}>
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="64" cy="64" r={radius} className="stroke-muted" strokeWidth="6" fill="transparent" />
        <motion.circle 
          cx="64" cy="64" r={radius} 
          className={colorClass} 
          strokeWidth="6" fill="transparent" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-4xl font-serif text-foreground">{score}</span>
    </div>
  );
};

const BarMetric = ({ label, score, isTeal = false, delay = 0 }: { label: string, score: number, isTeal?: boolean, delay?: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold text-ui-label text-foreground">
      <span>{label}</span>
      <span>{score}%</span>
    </div>
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${score}%` }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        className={`h-full rounded-full ${isTeal ? 'bg-accent-emerald' : 'bg-destructive'}`}
      />
    </div>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("decode");
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent-emerald/20 selection:text-foreground">
      <GlobalNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating Ambient Mesh Blobs ($1B Tier) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mesh-bg opacity-40">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-accent-emerald/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-accent-emerald/5 rounded-full blur-[140px] animate-float-slower" />
      </div>

      {/* ── SECTION 1 — HERO ── */}
      <section className="relative z-10 pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="space-y-8 flex flex-col items-center w-full">
          
          <h1 className="text-7xl md:text-[140px] font-serif leading-[0.85] tracking-tight text-foreground max-w-5xl">
            Land in the <span className="italic text-accent-emerald">top 0.1%</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-foreground/60 font-medium max-w-3xl mx-auto leading-relaxed mt-6">
            The ultimate ATS Optimization Engine. Built to surgically extract job requirements and perfectly tailor your career narrative.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link to={user ? "/dashboard" : "/auth"} className="group relative px-10 py-5 bg-foreground text-background rounded-full text-sm font-bold uppercase tracking-[0.15em] hover:bg-foreground/90 transition-all hover:scale-[1.02] active:scale-95 shadow-soft">
              <span className="flex items-center gap-2">
                Deploy Engine <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-accent-emerald" />
              </span>
            </Link>
            <Link to="/auth" className="px-10 py-5 bg-white text-foreground border border-border rounded-full text-sm font-bold uppercase tracking-[0.15em] hover:bg-muted/50 transition-all hover:scale-[1.02] active:scale-95 shadow-soft">
              Try with Sample Resume
            </Link>
          </div>

          {/* $1B Hero Terminal Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mt-24 text-left relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-emerald/30 to-accent-blue/10 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000" />
            <div className="macos-window p-6 md:p-12 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-6">
                <div className="w-3 h-3 rounded-full bg-accent-red/80" />
                <div className="w-3 h-3 rounded-full bg-accent-amber/80" />
                <div className="w-3 h-3 rounded-full bg-accent-emerald/80" />
                <span className="ml-4 text-xs font-mono text-white/40">lumina_engine_v3.sh</span>
              </div>
              <div className="flex font-mono text-sm md:text-base overflow-x-auto">
                <div className="flex flex-col text-white/20 select-none pr-8 border-r border-white/10 text-right">
                  <span>01</span><span>02</span><span>03</span>
                </div>
                <div className="pl-8 text-white/80 whitespace-pre-wrap leading-loose">
                  <span className="text-accent-blue">const</span> <span className="text-accent-emerald">target_role</span> = <span className="text-accent-amber">"Senior AI Engineer"</span>;<br/>
                  <span className="text-accent-blue">await</span> Lumina.<span className="text-accent-emerald">analyze</span>(&#123;<br/>
                  &nbsp;&nbsp;input: <TypewriterText text='"Paste complete Job Description for objective-grade analysis extraction..."' />
                  <br/>&#125;);
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* ── 3D ROADMAP (MOVED TO TOP) ── */}
      <Roadmap3D />

      {/* ── SECTION 2 — STATS STRIP ── */}
      <section className="relative z-10 bg-background py-24 px-6 overflow-hidden border-y border-border/40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:divide-x divide-border/40 relative z-10">
          <div className="space-y-2">
            <div className="text-6xl md:text-8xl font-serif italic text-foreground"><AnimatedCounter end={25} suffix="s" /></div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-foreground/50">Avg. Processing Time</div>
          </div>
          <div className="space-y-2">
            <div className="text-6xl md:text-8xl font-serif italic text-accent-emerald"><AnimatedCounter end={65} suffix="+" /></div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-foreground/50">Avg. ATS Score Lift</div>
          </div>
          <div className="space-y-2">
            <div className="text-6xl md:text-8xl font-serif italic text-foreground"><AnimatedCounter end={4} /></div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-foreground/50">Intelligence Modules</div>
          </div>
          <div className="space-y-2">
            <div className="text-6xl md:text-8xl font-serif italic text-accent-emerald"><AnimatedCounter end={100} suffix="%" /></div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-foreground/50">JD-Specific Tailoring</div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — BEFORE & AFTER ── */}
      <section className="relative z-10 py-32 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <span className="badge-pill bg-white border border-border text-foreground shadow-sm mb-6">Real Results</span>
          <h2 className="text-5xl md:text-7xl font-serif text-foreground tracking-tight mb-4">See the difference instantly</h2>
          <p className="text-foreground/60 font-medium text-xl">One resume. One JD. The gap is everything.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative">
          {/* BEFORE CARD */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bento-card w-full max-w-md p-10 flex flex-col items-center">
            <h3 className="text-xs font-bold font-display uppercase tracking-widest text-foreground/40 mb-8">Standard Resume</h3>
            <ScoreRing score={28} colorClass="stroke-destructive" />
            <div className="w-full mt-10 space-y-6">
              <BarMetric label="ATS Compatibility" score={28} delay={0.2} />
              <BarMetric label="Keyword Match" score={19} delay={0.4} />
              <BarMetric label="Impact Bullets" score={22} delay={0.6} />
            </div>
          </motion.div>

          {/* ARROW */}
          <div className="w-16 h-16 rounded-full bg-accent-emerald text-white flex items-center justify-center shadow-soft z-10 md:-mx-8 hidden md:flex shrink-0">
            <ArrowRight size={24} />
          </div>

          {/* AFTER CARD */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bento-card w-full max-w-md p-10 flex flex-col items-center glow-border-teal">
            <div className="flex justify-between items-center w-full mb-8">
              <h3 className="text-xs font-bold font-display uppercase tracking-widest text-foreground">Lumina Optimised</h3>
              <span className="badge-pill bg-accent-emerald/10 text-accent-emerald font-bold">+65 pts</span>
            </div>
            <ScoreRing score={93} colorClass="stroke-accent-emerald" isTeal={true} />
            <div className="w-full mt-10 space-y-6">
              <BarMetric label="ATS Compatibility" score={93} isTeal={true} delay={0.3} />
              <BarMetric label="Keyword Match" score={89} isTeal={true} delay={0.5} />
              <BarMetric label="Impact Bullets" score={96} isTeal={true} delay={0.7} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 4 — BENTO BOX FEATURES ── */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-20 text-center md:text-left">
          <span className="badge-pill bg-white border border-border text-foreground shadow-sm mb-6">Capabilities</span>
          <h2 className="text-5xl md:text-7xl font-serif text-foreground tracking-tight mb-6">Everything you need to get hired</h2>
          <p className="text-foreground/60 font-medium text-xl max-w-2xl">Not just keyword stuffing — real, strategic career intelligence built into an ultra-fast platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[300px]">
          
          {/* Bento Large Card 1 */}
          <div className="bento-card p-10 md:col-span-4 bg-gradient-to-br from-white to-background flex flex-col justify-between group">
            <div className="space-y-4 max-w-lg">
              <div className="w-14 h-14 rounded-2xl bg-foreground text-white flex items-center justify-center shadow-soft mb-6 group-hover:scale-110 transition-transform duration-500">
                <BrainCircuit size={28} />
              </div>
              <h3 className="text-4xl font-serif text-foreground">Strategic JD Decoder</h3>
              <p className="text-foreground/60 text-lg font-medium leading-relaxed">Extracts hidden metrics, ATS keywords, and implicit requirements the human eye misses. Powered by Llama-3.3.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {['RAG Intelligence', 'Vector Matching', 'NLP Analysis'].map(tag => (
                <span key={tag} className="px-4 py-1.5 rounded-full bg-accent-emerald/10 text-accent-emerald text-xs font-bold border border-accent-emerald/20">{tag}</span>
              ))}
            </div>
          </div>

          {/* Bento Card 2 - Teal Dominant */}
          <div className="bento-card p-10 md:col-span-2 bg-accent-emerald text-white flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
             <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-6 backdrop-blur-md">
                <Target size={28} />
              </div>
              <h3 className="text-4xl font-serif">Gap Analysis</h3>
              <p className="text-white/80 text-lg font-medium leading-relaxed">Instantly spot what's missing before the recruiter does.</p>
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="bento-card p-10 md:col-span-2 group">
            <div className="w-12 h-12 rounded-2xl bg-foreground text-white flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500"><FileText size={24} /></div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Resume Tailor</h3>
            <p className="text-foreground/60 text-base font-medium leading-relaxed mb-8">Rewrites bullets to perfectly match the target role's phrasing.</p>
            <div className="text-xs font-mono p-4 bg-muted rounded-xl line-through text-destructive border border-border">Led team of 5 developers</div>
          </div>

          {/* Bento Card 4 */}
          <div className="bento-card p-10 md:col-span-2 group flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-emerald/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><BarChart3 size={24} /></div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Market Insights</h3>
              <p className="text-foreground/60 text-base font-medium leading-relaxed">Strategic calibration using current industry data.</p>
            </div>
          </div>

          {/* Bento Card 5 */}
          <div className="bento-card p-10 md:col-span-2 group glow-border-teal bg-gradient-to-br from-white to-accent-emerald/5">
            <div className="w-12 h-12 rounded-2xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform"><ShieldCheck size={24} /></div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Genuine ATS Score</h3>
            <p className="text-foreground/60 text-base font-medium leading-relaxed">Real before/after metrics. No fake vanity numbers. Just hard math.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — TESTIMONIALS ── */}
      <section className="relative z-10 py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-8xl font-serif tracking-tight text-foreground mb-4">Trusted by the 0.1%</h2>
            <p className="text-foreground/60 font-medium text-xl">The secret weapon of top candidates globally.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "Lumina caught 3 critical keyword gaps I missed. I tailored my resume and got the interview at Stripe 2 days later.", name: "Alex K.", role: "Senior Software Engineer", lift: "+42 pts" },
              { text: "The Gap Analysis is brutal but exactly what you need. It forces you to write objective-grade bullets.", name: "Priya S.", role: "Data Scientist", lift: "+58 pts" },
              { text: "Used this for campus placements. The JD Decoder feels like having the recruiter's rubric in advance.", name: "Rahul M.", role: "AI Fresher", lift: "+71 pts" }
            ].map((t, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-border/50 hover:border-accent-emerald/30 shadow-soft hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-2">
                <div className="flex gap-1 mb-8 text-accent-emerald">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                <p className="text-xl font-medium leading-relaxed mb-10 text-foreground/90">"{t.text}"</p>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-emerald/10 text-accent-emerald flex items-center justify-center font-bold font-display text-lg border border-accent-emerald/20">{t.name[0]}</div>
                    <div>
                      <div className="font-bold font-display tracking-wider text-sm text-foreground">{t.name}</div>
                      <div className="text-xs text-foreground/50">{t.role}</div>
                    </div>
                  </div>
                  <div className="text-accent-emerald font-serif italic text-3xl">{t.lift}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — FINAL CTA (MASSIVE CONTRAST) ── */}
      <section className="relative z-10 py-40 px-6 max-w-6xl mx-auto text-center">
        <div className="premium-card p-16 md:p-32 bg-foreground text-white text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
          {/* Subtle glow behind the CTA */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent-emerald/20 to-transparent opacity-50" />
          
          <h2 className="text-6xl md:text-[100px] font-serif leading-[0.9] tracking-tight mb-8 relative z-10">
            Ready to land <br/> <span className="italic text-accent-emerald">more interviews?</span>
          </h2>
          <p className="text-white/60 font-medium text-xl max-w-2xl mx-auto mb-16 relative z-10">
            Join the career strategists already using Lumina to surgically bypass ATS filters and get in front of real recruiters.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center relative z-10">
            <Link to={user ? "/dashboard" : "/auth"} className="w-full sm:w-auto px-12 py-6 bg-accent-emerald text-white rounded-full text-sm font-bold uppercase tracking-[0.15em] hover:bg-accent-emerald/90 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              Deploy Engine Now
            </Link>
            <Link to="/auth" className="w-full sm:w-auto px-12 py-6 bg-white/10 text-white border border-white/20 rounded-full text-sm font-bold uppercase tracking-[0.15em] hover:bg-white/20 transition-all">
              View Sample Analysis
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-xs font-bold font-display text-white/40 uppercase tracking-widest mt-16 relative z-10">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent-emerald"/> Free tier available</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent-emerald"/> Results in 25s</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-accent-emerald"/> No data sold</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center">
            <LuminaLogo size={120} className="object-contain" />
          </div>
          <p className="text-foreground/40 text-[10px] font-black font-display uppercase tracking-[0.4em] text-center md:text-left">
            Built for the top 0.1% of career strategists
          </p>
          <div className="flex gap-12 text-foreground/60 text-[10px] font-bold font-display uppercase tracking-widest">
            <a href="#" className="hover:text-accent-emerald transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent-emerald transition-colors">Terms</a>
            <a href="#" className="hover:text-accent-emerald transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
