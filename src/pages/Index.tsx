import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturedSection } from "@/components/FeaturedSection";
import { PhilosophySection } from "@/components/PhilosophySection";
import { ServicesSection } from "@/components/ServicesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background dot-grid-bg grain-overlay font-sans text-slate-800">
      {/* ── SECTION 1 — HERO ── */}
      <section className="min-h-screen relative flex flex-col overflow-hidden">
        {/* Navbar */}
        <nav className="relative z-20 px-6 py-6 w-full">
          <div className="liquid-glass rounded-full pill max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={24} color="#3B82F6" />
              <span className="text-slate-800 font-semibold text-lg">Lumina JD</span>
              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full ml-2 font-medium">0.1% Strategist</span>
              
              <div className="hidden md:flex items-center gap-8 ml-8">
                {["Features", "How It Works", "Tracker"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/auth" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link
                to="/home"
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 py-2 text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                Try Free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[10%]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="liquid-glass rounded-full px-4 py-1.5 flex items-center gap-2 mb-8 border border-slate-200/50 hover:bg-white/40 transition-colors cursor-default group">
              <Sparkles size={14} className="text-blue-500 group-hover:rotate-12 transition-transform" />
              <span className="text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase">The #1 ATS Optimization Engine</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl text-slate-900 tracking-tight font-serif">
              Land in the top <em className="italic" style={{ color: "#3B82F6" }}>0.1%.</em>
            </h1>
            
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
              Paste a job description. Upload your resume. Get your exact match score, skill gaps, and a winning playbook — in seconds.
            </p>

            {/* Dual CTA */}
            <div className="flex gap-4 mt-10 justify-center flex-wrap">
              <Link
                to="/home"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-4 text-base font-semibold flex items-center gap-2 transition-all shadow-xl shadow-blue-500/25 group"
              >
                Analyze My JD Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="liquid-glass rounded-full px-8 py-4 text-slate-700 text-base font-medium transition-all hover:bg-white/80">
                See a Sample Report
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-4 mt-12 flex-wrap">
              {[
                "50,000+ JDs Decoded",
                "94% Interview Rate",
                "ATS Bypass Playbook Included"
              ].map((stat, i) => (
                <div key={i} className="liquid-glass rounded-full px-6 py-3 text-slate-600 text-sm font-medium">
                  {stat}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <div id="features">
        <FeaturedSection />
      </div>
      <PhilosophySection />
      <ServicesSection />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles size={20} color="#3B82F6" />
            <span className="text-slate-800 font-bold">Lumina JD</span>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            Built for the modern career strategist
          </p>
          <div className="flex gap-8 text-slate-500 text-sm">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
