import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Star, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  LayoutDashboard, 
  ShieldCheck, 
  Target, 
  BarChart3, 
  Globe, 
  Import,
  ClipboardList
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// ── CUSTOM HOOKS ──

const useScrollReveal = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return { ref, isInView };
};

const useCounter = (end: number, duration = 2) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, end, duration]);

  return { ref, count };
};

// ── COMPONENTS ──

const ScoreRing = ({ score, color, delay = 0 }: { score: number, color: string, delay?: number }) => {
  const { ref, isInView } = useScrollReveal();
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div ref={ref} className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
        <motion.circle 
          cx="64" cy="64" r={radius} 
          stroke={color} strokeWidth="8" fill="transparent" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-4xl font-serif text-[#1E2A3A]">{score}</span>
    </div>
  );
};

const MetricBar = ({ label, score, color, delay = 0 }: { label: string, score: number, color: string, delay?: number }) => {
  const { ref, isInView } = useScrollReveal();
  return (
    <div ref={ref} className="w-full space-y-1.5">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#1E2A3A]/60">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.4, ease: "easeOut", delay }}
          className="h-full origin-left rounded-full"
          style={{ backgroundColor: color, width: `${score}%` }}
        />
      </div>
    </div>
  );
};

const Terminal = () => {
  const [text, setText] = useState("");
  const fullText = "Paste complete 'About the Job' for objective-grade analysis extraction...";
  
  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(typing);
    }, 28);
    return () => clearInterval(typing);
  }, []);

  return (
    <div className="bg-[#1E2A3A] rounded-[2rem] p-8 md:p-12 shadow-2xl border border-white/5 font-mono text-sm md:text-base text-white/90 relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-6">
        <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
        <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
        <div className="w-3 h-3 rounded-full bg-[#10B981]" />
        <span className="ml-4 text-xs text-white/40">lumina_engine_v3.sh</span>
      </div>
      <div className="flex gap-6">
        <div className="hidden md:flex flex-col text-white/20 select-none text-right">
          {Array.from({ length: 6 }).map((_, i) => <span key={i}>0{i+1}</span>)}
        </div>
        <div className="flex-1">
          <p className="leading-relaxed">
            {text}
            <span className="inline-block w-2 h-5 ml-1 bg-[#10B981] animate-pulse align-middle" />
          </p>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ end, prefix = "", suffix = "", label, sub, color, isLast }: { 
  end: number, prefix?: string, suffix?: string, label: string, sub: string, color: string, isLast: boolean 
}) => {
  const { ref, count } = useCounter(end);
  return (
    <div className={`flex flex-col items-center text-center md:border-r border-white/10 ${isLast ? 'md:border-r-0' : ''} px-8`}>
      <div ref={ref} className={`text-5xl md:text-7xl font-serif italic mb-4 ${color}`}>
        {prefix}{count}{suffix}
      </div>
      <div className="space-y-1">
        <div className="text-[11px] font-black uppercase tracking-widest text-white">{label}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-white/30">{sub}</div>
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-black/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-[#10B981] transition-colors"
      >
        <span className="text-lg font-bold text-[#1E2A3A] tracking-tight">{question}</span>
        {isOpen ? <ChevronUp size={20} className="text-[#10B981]" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[#6B7280] leading-relaxed max-w-3xl">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── MAIN PAGE ──

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans text-[#1E2A3A] selection:bg-[#10B981]/20 selection:text-[#1E2A3A]">
      
      {/* ── SECTION 1 — HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Ambient Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-[#10B981]/10 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-[#2563EB]/5 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-[#F59E0B]/5 rounded-full blur-[80px]" 
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECFDF5] border border-[#10B981]/20 text-[#10B981]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] font-display">v3.0 Signal Live</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[96px] font-serif leading-[0.85] tracking-tighter text-[#1E2A3A]">
              Land in the <span className="italic text-[#10B981]">top 0.1%</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#6B7280] font-medium max-w-2xl mx-auto leading-relaxed">
              Paste a job description. Upload your resume. Get your exact match score, skill gaps, and a winning playbook — in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link to={user ? "/dashboard" : "/auth"} className="group px-10 py-5 bg-[#1E2A3A] text-white rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center gap-2">
                Deploy Engine <ArrowRight size={16} className="text-[#10B981]" />
              </Link>
              <Link to="/auth" className="px-10 py-5 bg-white text-[#1E2A3A] border border-[#1E2A3A]/10 rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-white transition-all hover:scale-[1.02] active:scale-95">
                Try with Sample Resume
              </Link>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex items-center -space-x-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${i === 0 ? 'bg-[#1E2A3A]' : i === 1 ? 'bg-[#10B981]' : 'bg-[#2563EB]'}`}>
                    {['JD', 'RA', 'SM'][i]}
                  </div>
                ))}
                <div className="ml-6 pl-4 text-xs font-medium text-[#6B7280]">
                  <span className="text-[#1E2A3A] font-bold">1,240+ Scientists</span> already deployed
                </div>
              </div>
              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]/60">
                <span className="flex items-center gap-1.5"><Check size={12} className="text-[#10B981]" /> No data sold</span>
                <span className="flex items-center gap-1.5"><Check size={12} className="text-[#10B981]" /> ~25s results</span>
                <span className="flex items-center gap-1.5"><Check size={12} className="text-[#10B981]" /> Free to start</span>
                <span className="flex items-center gap-1.5"><Check size={12} className="text-[#10B981]" /> 0.1% career outcomes</span>
              </div>
            </div>

            <div className="w-full max-w-5xl pt-16">
              <Terminal />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2 — BEFORE / AFTER ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="badge-eyebrow">Real Results</span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#1E2A3A]">See the difference instantly</h2>
          <p className="text-[#6B7280] font-medium">One resume. One JD. The gap is everything.</p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* BEFORE CARD */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-soft space-y-8"
          >
            <div className="flex justify-between items-center">
              <span className="px-4 py-1.5 rounded-full bg-red-50 text-[#EF4444] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" /> Before Lumina
              </span>
            </div>
            <div className="flex justify-center">
              <ScoreRing score={28} color="#EF4444" />
            </div>
            <div className="space-y-5">
              <MetricBar label="ATS Score" score={28} color="#EF4444" delay={0.2} />
              <MetricBar label="Keyword Match" score={19} color="#F59E0B" delay={0.4} />
              <MetricBar label="Gap Analysis" score={34} color="#F59E0B" delay={0.6} />
              <MetricBar label="Impact Bullets" score={22} color="#EF4444" delay={0.8} />
            </div>
          </motion.div>

          <div className="w-16 h-16 rounded-full bg-[#1E2A3A] flex items-center justify-center text-white shadow-xl z-10 shrink-0">
            <ArrowRight size={24} />
          </div>

          {/* AFTER CARD */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-md bg-gradient-to-br from-white to-[#ECFDF5] rounded-[2.5rem] p-10 shadow-soft border border-[#10B981]/20 space-y-8"
          >
            <div className="flex justify-between items-center">
              <span className="px-4 py-1.5 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Check size={12} /> Lumina Optimised
              </span>
              <span className="px-3 py-1 rounded-full bg-[#10B981] text-white text-[10px] font-bold">+65 pts</span>
            </div>
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-[#10B981]/20 blur-[40px] rounded-full scale-50" />
              <ScoreRing score={93} color="#10B981" delay={0.2} />
            </div>
            <div className="space-y-5">
              <MetricBar label="ATS Score" score={93} color="#10B981" delay={0.4} />
              <MetricBar label="Keyword Match" score={89} color="#10B981" delay={0.6} />
              <MetricBar label="Gap Analysis" score={91} color="#10B981" delay={0.8} />
              <MetricBar label="Impact Bullets" score={96} color="#10B981" delay={1.0} />
            </div>
          </motion.div>
        </div>
        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]/40">
          Illustrative average improvement · Actual results vary by resume and job description
        </p>
      </section>

      {/* ── SECTION 3 — STATS STRIP ── */}
      <section className="bg-[#1E2A3A] py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-0">
          <StatItem end={25} suffix="s" label="Avg. processing time" sub="from paste to results" color="text-[#10B981]" isLast={false} />
          <StatItem end={65} prefix="+" label="Avg. ATS score lift" sub="per optimisation" color="text-white" isLast={false} />
          <StatItem end={4} label="Intelligence modules" sub="JD · Gap · Tailor · Insights" color="text-[#F59E0B]" isLast={false} />
          <StatItem end={100} suffix="%" label="JD-specific tailoring" sub="no generic rewrites" color="text-[#10B981]" isLast={true} />
        </div>
      </section>

      {/* ── SECTION 4 — HOW IT WORKS ── */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-4">
          <span className="badge-eyebrow">3 steps</span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#1E2A3A]">Dead simple. Effortlessly powerful.</h2>
          <p className="text-[#6B7280] font-medium">No forms. No questionnaires. Paste and go.</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Connector Line */}
          <div className="absolute top-[60px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#10B981]/20 to-transparent hidden md:block" />
          
          {[
            { 
              step: "01", icon: <ClipboardList />, color: "bg-[#1E2A3A]", title: "Paste Resume & Job Description",
              desc: "Drop in your resume (PDF or plain text) and the target job description. Lumina's JD Decoder immediately surfaces hidden requirements, role-critical skills, and the exact keywords ATS systems filter on."
            },
            { 
              step: "02", icon: <Zap />, color: "bg-[#10B981]", title: "AI Runs the Intelligence Analysis",
              desc: "Gap Analysis runs real-time diagnostics. Lumina finds missing keywords, weak bullets, and misaligned positioning — then rewrites with stronger verbs and injected keywords tuned for ATS and human reviewers."
            },
            { 
              step: "03", icon: <Target />, color: "bg-[#F59E0B]", title: "Download & Apply with Confidence",
              desc: "Get your optimised resume as PDF or DOCX. See your ATS score jump. Use Market Insights to benchmark your profile against current industry standards before you hit submit."
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="group relative bg-white p-10 rounded-[2.5rem] shadow-soft border border-transparent hover:border-[#10B981]/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#10B981]/5 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center mb-8 shadow-lg`}>
                {item.icon}
              </div>
              <h4 className="text-xl font-bold mb-4 tracking-tight leading-snug">{item.title}</h4>
              <p className="text-[#6B7280] text-sm leading-relaxed">{item.desc}</p>
              <span className="absolute bottom-8 right-8 text-5xl font-serif italic text-black/[0.03] select-none group-hover:text-[#10B981]/10 transition-colors">
                {item.step}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5 — AUDIENCE SEGMENTS ── */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-12 space-y-4">
            <span className="badge-eyebrow">Built for</span>
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#1E2A3A]">Who uses Lumina</h2>
            <p className="text-[#6B7280] font-medium">From campus placements to senior tech roles — one intelligence engine.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
            {[
              { label: "Engineering Freshers", color: "bg-[#10B981]" },
              { label: "AI/ML Job Seekers", color: "bg-[#2563EB]" },
              { label: "Data Science Roles", color: "bg-[#F59E0B]" },
              { label: "Campus Placements", color: "bg-[#EF4444]" },
              { label: "IT Professionals", color: "bg-[#1E2A3A]" },
              { label: "Mid-Career Switchers", color: "bg-[#10B981]" },
              { label: "Fintech & Banking", color: "bg-[#2563EB]" },
              { label: "MBA Candidates", color: "bg-[#F59E0B]" }
            ].map((chip, i) => (
              <button 
                key={i}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4F5F7] border border-transparent text-[#6B7280] text-xs font-bold transition-all hover:bg-[#ECFDF5] hover:border-[#10B981]/30 hover:text-[#1E2A3A]"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${chip.color}`} />
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — FEATURES GRID ── */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-4">
          <span className="badge-eyebrow">Features</span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#1E2A3A]">Total Intelligence Ecosystem</h2>
          <p className="text-[#6B7280] font-medium">Not just keyword stuffing — real, strategic career intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Large Card — JD Decoder */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-white p-12 rounded-[2.5rem] shadow-soft flex flex-col justify-between group hover:border-[#10B981]/20 border border-transparent transition-all"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shadow-inner">
                <SearchIcon />
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-bold tracking-tight">JD Decoder</h4>
                <p className="text-[#6B7280] text-lg leading-relaxed max-w-xl">
                  Lumina reads every job description like a senior recruiter. Uncover hidden metrics, mission-critical skills, implicit culture signals, seniority expectations — and the exact ATS keywords filtering out 72% of applicants.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-8">
              {["RAG", "LLMs", "LangChain", "Python", "FastAPI", "+ your role keywords"].map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-[#F4F5F7] text-[10px] font-black uppercase tracking-widest text-[#1E2A3A]/60">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Medium Card — Gap Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[2.5rem] shadow-soft group hover:border-[#2563EB]/20 border border-transparent transition-all flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-8 shadow-inner">
              <BarChart3 size={24} />
            </div>
            <h4 className="text-2xl font-bold mb-4 tracking-tight">Gap Analysis</h4>
            <p className="text-[#6B7280] text-sm leading-relaxed mb-8 flex-1">
              Real-time diagnostics comparing your profile against decoded role requirements. Hard numbers, not vague advice.
            </p>
            <div className="p-5 rounded-2xl bg-[#F4F5F7] space-y-3 font-mono text-[10px]">
              <div className="line-through text-[#EF4444] opacity-60 break-words leading-relaxed">
                Missing: "distributed systems", "LLM fine-tuning", "production APIs"
              </div>
              <div className="text-[#10B981] font-bold flex items-center gap-2">
                <Check size={12} /> 3 critical gaps identified · Targeted rewrite ready
              </div>
            </div>
          </motion.div>

          {/* Bottom row */}
          {[
            { 
              icon: <LayoutDashboard />, color: "text-[#1E2A3A]", bg: "bg-gray-100", title: "Resume Tailor",
              desc: "Every bullet rewritten with stronger action verbs, quantified results, and injected keywords — tuned for both machine and human review.",
              preview: (
                <div className="space-y-2 mt-4 font-mono text-[10px]">
                  <div className="text-red-400 line-through leading-relaxed opacity-60">Worked on ML models for classification</div>
                  <div className="text-[#10B981] font-bold leading-relaxed">✓ Fine-tuned LLaMA-3 reducing inference latency by 38%</div>
                </div>
              )
            },
            { 
              icon: <Globe />, color: "text-[#F59E0B]", bg: "bg-amber-50", title: "Market Insights",
              desc: "Strategic calibration using current industry intelligence. Benchmark your profile against what the market is hiring for right now — not two-year-old data."
            },
            { 
              icon: <ShieldCheck />, color: "text-[#10B981]", bg: "bg-[#ECFDF5]", title: "Genuine ATS Score",
              desc: "Real before/after score — no inflated vanity metrics. Lumina shows exactly where you started and precisely how far the optimisation moved the needle."
            }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-soft group hover:border-[#10B981]/20 border border-transparent transition-all flex flex-col"
            >
              <div className={`w-12 h-12 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center mb-8 shadow-inner`}>
                {feat.icon}
              </div>
              <h4 className="text-xl font-bold mb-4 tracking-tight">{feat.title}</h4>
              <p className="text-[#6B7280] text-sm leading-relaxed flex-1">{feat.desc}</p>
              {feat.preview}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION 7 — TESTIMONIALS ── */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <span className="badge-eyebrow">Results</span>
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#1E2A3A]">Career strategists who deployed Lumina</h2>
            <p className="text-[#6B7280] font-medium">Real outcomes. Real scores. Real interviews.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                initial: "A", name: "Arjun M.", role: "Placed — AI Engineer, Bengaluru startup", score: "ATS 31 → 91",
                quote: "I applied to 40 jobs with a generic resume and got 0 callbacks. After Lumina, I got 3 interview calls in the first week."
              },
              { 
                initial: "P", name: "Priya S.", role: "Data Scientist, mid-career switch", score: "ATS 24 → 88",
                quote: "The Gap Analysis showed me exactly which skills I was missing for each role. I stopped guessing and started landing interviews."
              },
              { 
                initial: "R", name: "Rahul K.", role: "Fresher — SDE, campus placement", score: "ATS 19 → 94",
                quote: "Lumina decoded the JD and rewrote my resume bullets in 25 seconds. My placement officer said it was the strongest resume she'd seen from our batch."
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -4 }}
                className="bg-[#F4F5F7] p-10 rounded-[2.5rem] shadow-soft border border-transparent hover:shadow-xl transition-all space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1E2A3A] text-white flex items-center justify-center font-bold text-lg font-display">
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-bold text-[#1E2A3A]">{t.name}</div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-[#6B7280]">{t.role}</div>
                  </div>
                </div>
                <div className="inline-block px-3 py-1 rounded-lg bg-[#ECFDF5] text-[#10B981] text-[10px] font-black uppercase tracking-widest">
                  {t.score}
                </div>
                <p className="text-xl font-serif italic text-[#1E2A3A] leading-snug">"{t.quote}"</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-[#10B981] text-[#10B981]" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8 — FAQ ── */}
      <section className="py-32 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="badge-eyebrow">Guidance</span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#1E2A3A]">Questions, answered</h2>
          <p className="text-[#6B7280] font-medium">Everything you need to know before you deploy.</p>
        </div>

        <div className="space-y-2">
          {[
            { q: "Is Lumina free to use?", a: "Yes — Lumina is free to start. Paste your JD and resume and get your full analysis, score, and rewritten bullets at no cost. No credit card required." },
            { q: "What AI powers Lumina?", a: "Lumina is powered by Llama-3.3, one of the most capable open-weight language models available. Your data is processed securely and never sold or shared with third parties." },
            { q: "How is Lumina different from Jobscan or Teal HQ?", a: "Jobscan gives you a keyword match score. Lumina gives you a full intelligence report — JD decoding, gap diagnostics, resume rewriting, and market benchmarking — in a single pass. It's the difference between a score and a strategy." },
            { q: "Does it work for Indian job portals like Naukri or LinkedIn India?", a: "Yes. Lumina analyses any plain-text job description regardless of the platform it came from. Paste the full job posting and Lumina handles the rest." },
            { q: "Will ATS systems penalise a Lumina-optimised resume?", a: "No. Lumina injects keywords naturally into your existing bullet structure — it doesn't keyword-stuff or use hidden text tricks. The output reads well to both ATS systems and human recruiters." },
            { q: "How long does analysis take?", a: "Approximately 25 seconds from paste to full optimised output. No forms, no questionnaires — just paste and go." }
          ].map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} />)}
        </div>
      </section>

      {/* ── SECTION 9 — FINAL CTA ── */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-[#1E2A3A] rounded-[3rem] p-12 md:p-24 overflow-hidden text-center flex flex-col items-center gap-8"
        >
          {/* Ambient Glowing Blobs */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#10B981]/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#10B981]/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[10px] font-black uppercase tracking-widest">
              Free to start
            </span>
            <h2 className="text-4xl md:text-6xl font-serif italic text-white leading-tight">
              Ready to land more interviews?
            </h2>
            <p className="text-white/60 font-medium max-w-2xl mx-auto text-lg">
              Join the career strategists already using Lumina to get past ATS filters and in front of real recruiters.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Link to="/auth" className="px-10 py-5 bg-[#10B981] text-white rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-95 shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all">
              Claim Your Free Analysis →
            </Link>
            <button className="px-10 py-5 bg-transparent text-white border border-white/20 rounded-full text-xs font-bold uppercase tracking-[0.15em] hover:bg-white/5 transition-all">
              See Pricing
            </button>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/35">
            <span>✓ No credit card</span>
            <span>✓ Results in 25s</span>
            <span>✓ No data sold</span>
          </div>
        </motion.div>
      </section>

      {/* Footer minimal info */}
      <footer className="py-12 border-t border-black/5 flex flex-col items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Lumina" style={{ width: 120 }} className="object-contain h-auto" />
        </Link>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
          Built for the top 0.1% of career strategists
        </p>
      </footer>

      {/* Inject custom global styles for fonts and components */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
        .text-gradient-elite {
          background: linear-gradient(to bottom right, #1E2A3A, #4B5563);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-strong {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px border rgba(255, 255, 255, 0.3);
        }
        .shadow-soft {
          box-shadow: 0 2px 12px rgba(30,42,58,0.06);
        }
        .badge-eyebrow {
          display: inline-block;
          padding: 0.375rem 1rem;
          border-radius: 9999px;
          background-color: #ECFDF5;
          border: 1px solid rgba(16,185,129,0.2);
          color: #10B981;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .macos-window {
          background: #1E2A3A;
          border-radius: 2.5rem;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .bento-card {
          background: white;
          border-radius: 2.5rem;
          box-shadow: 0 2px 12px rgba(30,42,58,0.06);
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }
        .premium-card {
          background: white;
          border-radius: 2.5rem;
          box-shadow: 0 2px 12px rgba(30,42,58,0.06);
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }
      `}} />
    </div>
  );
};

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

export default Index;
