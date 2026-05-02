import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, BrainCircuit, ShieldCheck, Target, FileText, Check, Star, CheckCircle2 } from "lucide-react";
import { LuminaLogo } from "@/components/LuminaLogo";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { ScannerView } from "@/components/ScannerView";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

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
    <span className="font-mono text-sm md:text-base text-primary/80">
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
      <span className="absolute text-4xl font-serif text-primary">{score}</span>
    </div>
  );
};

const BarMetric = ({ label, score, isTeal = false, delay = 0 }: { label: string, score: number, isTeal?: boolean, delay?: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold text-ui-label text-primary">
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
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent-emerald/20 selection:text-primary">
      <GlobalNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating Ambient Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-accent-emerald/5 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-accent-blue/5 rounded-full blur-[120px] animate-float-slower" />
      </div>

      {/* ── SECTION 1 — HERO ── */}
      <section className="relative z-10 pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-8 flex flex-col items-center w-full">
          
          <h1 className="text-7xl md:text-[120px] font-serif leading-[0.85] tracking-tight text-primary max-w-5xl">
            Land in the <span className="italic text-accent-emerald">top 0.1%</span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary/70 font-medium max-w-2xl mx-auto leading-relaxed">
            The #1 ATS Optimization Engine for Modern Career Strategists. Powered by Llama-3.3 Intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link to={user ? "/dashboard" : "/auth"} className="group relative px-8 py-4 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 shadow-soft">
              <span className="flex items-center gap-2">
                Deploy Engine <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-accent-emerald" />
              </span>
            </Link>
            <Link to="/auth" className="px-8 py-4 bg-white text-primary border border-border rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-muted/50 transition-all hover:scale-[1.02] active:scale-95 shadow-soft">
              Try with Sample Resume
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-xs font-bold font-display text-primary uppercase tracking-widest">1,240+ Scientists</span>
                <span className="text-[10px] text-primary/60 uppercase tracking-widest">Already Deployed</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-[10px] font-bold font-display text-primary/50 uppercase tracking-widest">
              <span className="flex items-center gap-1"><Check size={12} className="text-accent-emerald"/> No data sold</span>
              <span className="flex items-center gap-1"><Check size={12} className="text-accent-emerald"/> ~25s results</span>
              <span className="flex items-center gap-1"><Check size={12} className="text-accent-emerald"/> Free to start</span>
            </div>
          </div>

          {/* Hero Terminal Visual */}
          <div className="w-full max-w-4xl mt-16 text-left relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-emerald/20 to-accent-blue/20 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-primary rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-6">
                <div className="w-3 h-3 rounded-full bg-accent-red/80" />
                <div className="w-3 h-3 rounded-full bg-accent-amber/80" />
                <div className="w-3 h-3 rounded-full bg-accent-emerald/80" />
                <span className="ml-4 text-xs font-mono text-white/40">lumina_engine_v3.sh</span>
              </div>
              <div className="flex font-mono text-sm overflow-x-auto">
                <div className="flex flex-col text-white/20 select-none pr-6 border-r border-white/10 text-right">
                  <span>01</span><span>02</span><span>03</span>
                </div>
                <div className="pl-6 text-white/80 whitespace-pre-wrap">
                  <span className="text-accent-blue">const</span> <span className="text-accent-emerald">target_role</span> = <span className="text-accent-amber">"Senior AI Engineer"</span>;<br/>
                  <span className="text-accent-blue">await</span> Lumina.<span className="text-accent-emerald">analyze</span>(&#123;<br/>
                  &nbsp;&nbsp;input: <TypewriterText text='"Paste complete Job Description for objective-grade analysis extraction..."' />
                  <br/>&#125;);
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </section>

      {/* ── SECTION 2 — BEFORE & AFTER ── */}
      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="badge-pill bg-white border border-border text-primary shadow-sm mb-6">Real Results</span>
          <h2 className="text-5xl md:text-7xl font-serif text-primary tracking-tight mb-4">See the difference instantly</h2>
          <p className="text-primary/60 font-medium text-lg">One resume. One JD. The gap is everything.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative">
          
          {/* BEFORE CARD */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="premium-card w-full max-w-sm p-8 flex flex-col items-center">
            <h3 className="text-xs font-bold font-display uppercase tracking-widest text-primary/40 mb-8">Standard Resume</h3>
            <ScoreRing score={28} colorClass="stroke-destructive" />
            <div className="w-full mt-8 space-y-5">
              <BarMetric label="ATS Compatibility" score={28} delay={0.2} />
              <BarMetric label="Keyword Match" score={19} delay={0.4} />
              <BarMetric label="Impact Bullets" score={22} delay={0.6} />
            </div>
          </motion.div>

          {/* ARROW */}
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-soft z-10 md:-mx-6 hidden md:flex shrink-0">
            <ArrowRight size={20} />
          </div>

          {/* AFTER CARD */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="premium-card w-full max-w-sm p-8 flex flex-col items-center glow-border-teal transition-all duration-500">
            <div className="flex justify-between items-center w-full mb-8">
              <h3 className="text-xs font-bold font-display uppercase tracking-widest text-primary">Lumina Optimised</h3>
              <span className="badge-pill bg-accent-emerald/10 text-accent-emerald">+65 pts</span>
            </div>
            <ScoreRing score={93} colorClass="stroke-accent-emerald" isTeal={true} />
            <div className="w-full mt-8 space-y-5">
              <BarMetric label="ATS Compatibility" score={93} isTeal={true} delay={0.3} />
              <BarMetric label="Keyword Match" score={89} isTeal={true} delay={0.5} />
              <BarMetric label="Impact Bullets" score={96} isTeal={true} delay={0.7} />
            </div>
          </motion.div>
        </div>
        
        <p className="text-center text-[10px] uppercase tracking-widest text-primary/40 mt-12 font-display font-bold">Illustrative average improvement · Actual results vary</p>
      </section>

      {/* ── SECTION 3 — STATS STRIP ── */}
      <section className="relative z-10 bg-primary text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:divide-x divide-white/10">
          <div className="space-y-2">
            <div className="text-5xl md:text-7xl font-serif italic text-accent-emerald"><AnimatedCounter end={25} suffix="s" /></div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-white/50">Avg. Processing Time</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-7xl font-serif italic"><AnimatedCounter end={65} suffix="+" /></div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-white/50">Avg. ATS Score Lift</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-7xl font-serif italic"><AnimatedCounter end={4} /></div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-white/50">Intelligence Modules</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-7xl font-serif italic"><AnimatedCounter end={100} suffix="%" /></div>
            <div className="text-xs font-bold font-display uppercase tracking-widest text-white/50">JD-Specific Tailoring</div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — HOW IT WORKS ── */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="badge-pill bg-white border border-border text-primary shadow-sm mb-6">3 Steps</span>
          <h2 className="text-5xl md:text-7xl font-serif text-primary tracking-tight mb-4">Dead simple. Effortlessly powerful.</h2>
          <p className="text-primary/60 font-medium text-lg">No forms. No questionnaires. Paste and go.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: "01", title: "Paste Resume & Job Description", desc: "Feed the engine your target role and current profile. We handle the rest." },
            { num: "02", title: "AI Runs the Intelligence Analysis", desc: "Deep gap analysis, keyword extraction, and ATS compliance check." },
            { num: "03", title: "Download & Apply with Confidence", desc: "Export your perfectly tailored PDF/DOCX and dominate the application." }
          ].map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="premium-card p-10 group hover:-translate-y-2 transition-transform duration-300 glow-border-teal"
            >
              <div className="text-7xl font-serif italic text-primary/5 mb-8 group-hover:text-accent-emerald/20 transition-colors duration-500">{step.num}</div>
              <h3 className="text-xl font-bold text-primary mb-3">{step.title}</h3>
              <p className="text-primary/60 font-medium leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5 — AUDIENCE SEGMENTS ── */}
      <section className="relative z-10 py-16 px-6 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold font-display uppercase tracking-widest text-primary/40 block mb-8">Who uses Lumina</span>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {["Engineering Freshers", "AI/ML Job Seekers", "Data Science Roles", "Campus Placements", "IT Professionals", "Mid-Career Switchers", "Fintech & Banking", "MBA Candidates"].map((segment, i) => (
              <span key={i} className="px-5 py-2.5 rounded-full border border-border text-sm font-medium text-primary hover:border-accent-emerald hover:text-accent-emerald hover:bg-accent-emerald/5 transition-colors cursor-default">
                {segment}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — FEATURES GRID ── */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="badge-pill bg-white border border-border text-primary shadow-sm mb-6">Features</span>
          <h2 className="text-5xl md:text-7xl font-serif text-primary tracking-tight mb-4">Everything you need to get hired</h2>
          <p className="text-primary/60 font-medium text-lg max-w-2xl">Not just keyword stuffing — real, strategic career intelligence.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Main Large Card */}
          <div className="premium-card p-10 md:col-span-3 bg-gradient-to-br from-white to-background flex flex-col justify-between group">
            <div className="space-y-4 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-soft mb-6">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-3xl font-serif text-primary">JD Decoder</h3>
              <p className="text-primary/60 font-medium leading-relaxed">Extracts hidden metrics, ATS keywords, and implicit requirements the human eye misses.</p>
            </div>
            <div className="mt-12 flex flex-wrap gap-2">
              {['RAG', 'LLMs', 'LangChain', 'Python', 'FastAPI'].map(tag => (
                <span key={tag} className="badge-pill bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">{tag}</span>
              ))}
            </div>
          </div>

          {/* Medium Card */}
          <div className="premium-card p-10 md:col-span-2 bg-primary text-white flex flex-col justify-between group">
             <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-3xl font-serif">Gap Analysis</h3>
              <p className="text-white/60 font-medium leading-relaxed">Instantly spot what's missing before the recruiter does.</p>
            </div>
            <div className="mt-12 p-4 rounded-2xl bg-black/20 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs text-accent-red">
                <span className="w-2 h-2 rounded-full bg-accent-red" /> Missing: Distributed Systems
              </div>
              <ArrowRight size={14} className="text-white/20 ml-2" />
              <div className="flex items-center gap-2 text-xs text-accent-emerald">
                <span className="w-2 h-2 rounded-full bg-accent-emerald" /> Action: Highlight Kafka exp.
              </div>
            </div>
          </div>

          {/* Bottom Row - 3 Cards */}
          <div className="premium-card p-8 md:col-span-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-6"><FileText size={20} /></div>
            <h3 className="text-xl font-bold text-primary mb-2">Resume Tailor</h3>
            <p className="text-primary/60 text-sm font-medium leading-relaxed mb-6">Rewrites your bullets to perfectly match the target role's exact phrasing.</p>
            <div className="text-xs font-mono p-3 bg-muted rounded-lg line-through text-destructive">Led team of 5 developers</div>
            <div className="text-xs font-mono p-3 bg-accent-emerald/10 rounded-lg text-accent-emerald mt-2 border border-accent-emerald/20">Managed cross-functional engineering pod (5 FTEs)</div>
          </div>

          <div className="premium-card p-8 md:col-span-1 group">
            <div className="w-10 h-10 rounded-xl bg-accent-amber/10 text-accent-amber border border-accent-amber/20 flex items-center justify-center mb-6"><BarChart3 size={20} /></div>
            <h3 className="text-xl font-bold text-primary mb-2">Market Insights</h3>
            <p className="text-primary/60 text-sm font-medium leading-relaxed">Strategic calibration using current industry data.</p>
          </div>

          <div className="premium-card p-8 md:col-span-2 group glow-border-teal">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 flex items-center justify-center mb-6"><ShieldCheck size={20} /></div>
            <h3 className="text-xl font-bold text-primary mb-2">Genuine ATS Score</h3>
            <p className="text-primary/60 text-sm font-medium leading-relaxed">Real before/after metrics. No fake vanity numbers. Just hard math against the JD.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 7 — TESTIMONIALS ── */}
      <section className="relative z-10 py-24 px-6 bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-serif tracking-tight mb-4">Trusted by the 0.1%</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "Lumina caught 3 critical keyword gaps I missed. I tailored my resume and got the interview at Stripe 2 days later.", name: "Alex K.", role: "Senior Software Engineer", lift: "+42 pts" },
              { text: "The Gap Analysis is brutal but exactly what you need. It forces you to write objective-grade bullets.", name: "Priya S.", role: "Data Scientist", lift: "+58 pts" },
              { text: "Used this for campus placements. The JD Decoder feels like having the recruiter's rubric in advance.", name: "Rahul M.", role: "AI Fresher", lift: "+71 pts" }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex gap-1 mb-6 text-accent-amber">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                </div>
                <p className="text-lg font-medium leading-relaxed mb-8">"{t.text}"</p>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-emerald text-primary flex items-center justify-center font-bold font-display">{t.name[0]}</div>
                    <div>
                      <div className="font-bold font-display tracking-wider text-sm">{t.name}</div>
                      <div className="text-xs text-white/50">{t.role}</div>
                    </div>
                  </div>
                  <div className="text-accent-emerald font-serif italic text-2xl">{t.lift}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8 — FINAL CTA ── */}
      <section className="relative z-10 py-32 px-6 max-w-5xl mx-auto text-center">
        <div className="premium-card p-12 md:p-24 bg-primary text-white text-center flex flex-col items-center shadow-2xl">
          <h2 className="text-5xl md:text-7xl font-serif tracking-tight mb-6">Ready to land more interviews?</h2>
          <p className="text-white/60 font-medium text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Join the career strategists already using Lumina to get past ATS filters and in front of real recruiters.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link to={user ? "/dashboard" : "/auth"} className="w-full sm:w-auto px-10 py-5 bg-accent-emerald text-primary rounded-full text-sm font-bold uppercase tracking-[0.15em] hover:bg-accent-emerald/90 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              Claim Your Free Analysis
            </Link>
            <Link to="/auth" className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white rounded-full text-sm font-bold uppercase tracking-[0.15em] hover:bg-white/20 transition-all">
              See Pricing
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[10px] font-bold font-display text-white/40 uppercase tracking-widest mt-12">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-accent-emerald"/> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-accent-emerald"/> Results in 25s</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-accent-emerald"/> No data sold</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center">
            <LuminaLogo size={120} className="object-contain" />
          </div>
          <p className="text-primary/40 text-[10px] font-black font-display uppercase tracking-[0.4em] text-center md:text-left">
            Built for the modern career strategist
          </p>
          <div className="flex gap-12 text-primary/60 text-[10px] font-bold font-display uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
